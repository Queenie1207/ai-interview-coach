import { describe, expect, it, vi } from "vitest";
import { validPreparation } from "@/test/preparationFixture";
import type { InterviewAnswerEvaluationResponse } from "@/types/practice";
import { buildPracticeEvaluationRequest, createPracticeEvaluationRequestController } from "./practiceEvaluationClient";

const success: InterviewAnswerEvaluationResponse = { success: true, data: { overallScore: 80, summary: "Focused answer.", strengths: ["Relevant"], improvements: ["Add detail"], missingPoints: [], improvedAnswer: "A clearer answer.", needsFollowUp: false, suggestedFollowUpQuestion: null, dimensions: { relevance: { score: 82, feedback: "Relevant" }, evidence: { score: 76, feedback: "Some evidence" }, structure: { score: 80, feedback: "Clear" }, clarity: { score: 82, feedback: "Readable" } }, starEvaluation: null } };

describe("practice evaluation client", () => {
  it("builds only the allowlisted single-question payload", () => {
    const question = validPreparation.questions[0];
    const payload = buildPracticeEvaluationRequest(question, "  This is a sufficiently detailed answer for evaluation.  ", "en");
    expect(Object.keys(payload).sort()).toEqual(["answer", "answerOutline", "category", "difficulty", "jdEvidence", "outputLanguage", "question", "relatedRequirement", "resumeEvidence", "whyAsked"].sort());
    expect(payload).not.toHaveProperty("resume"); expect(payload).not.toHaveProperty("jobDescription"); expect(payload).not.toHaveProperty("analysis"); expect(payload).not.toHaveProperty("reviewTopics"); expect(payload).not.toHaveProperty("questions");
  });

  it("posts only to the evaluate endpoint", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => { void input; void init; return new Response(JSON.stringify(success), { status: 200 }); });
    const controller = createPracticeEvaluationRequestController(fetcher);
    const payload = buildPracticeEvaluationRequest(validPreparation.questions[0], "This is a sufficiently detailed answer for evaluation.", "en");
    const result = await controller.submit(payload);
    expect(result).toEqual({ status: "completed", response: success });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe("/api/interview/practice/evaluate");
    expect(JSON.stringify(fetcher.mock.calls[0]?.[1])).not.toContain("/api/resume/parse");
    expect(JSON.stringify(fetcher.mock.calls[0]?.[1])).not.toContain("/api/interview/prepare");
  });

  it("keeps the caller-owned answer when the API fails", async () => {
    const failure: InterviewAnswerEvaluationResponse = { success: false, error: { code: "AI_UPSTREAM_ERROR", message: "Please retry." } };
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => { void input; void init; return new Response(JSON.stringify(failure), { status: 502 }); });
    const controller = createPracticeEvaluationRequestController(fetcher);
    const answer = "This answer must remain available after a failed evaluation.";
    const payload = buildPracticeEvaluationRequest(validPreparation.questions[0], answer, "en");
    expect(await controller.submit(payload)).toEqual({ status: "completed", response: failure });
    expect(answer).toBe("This answer must remain available after a failed evaluation.");
    expect(payload.answer).toBe(answer);
  });

  it("blocks a rapid duplicate request", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetcher = vi.fn(() => new Promise<Response>((resolve) => { resolveResponse = resolve; }));
    const controller = createPracticeEvaluationRequestController(fetcher);
    const payload = buildPracticeEvaluationRequest(validPreparation.questions[0], "This is a sufficiently detailed answer for evaluation.", "en");
    const first = controller.submit(payload);
    expect(await controller.submit(payload)).toEqual({ status: "duplicate" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    resolveResponse?.(new Response(JSON.stringify(success)));
    await first;
  });

  it("marks a response stale after return or question change", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve) => { resolveResponse = resolve; init?.signal?.addEventListener("abort", () => resolve(new Response(JSON.stringify(success)))); }));
    const controller = createPracticeEvaluationRequestController(fetcher);
    const payload = buildPracticeEvaluationRequest(validPreparation.questions[0], "This is a sufficiently detailed answer for evaluation.", "en");
    const pending = controller.submit(payload);
    controller.cancel();
    resolveResponse?.(new Response(JSON.stringify(success)));
    expect(await pending).toEqual({ status: "stale" });
  });
});
