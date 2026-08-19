import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { AnswerEvaluationAuthenticationError, AnswerEvaluationEmptyOutputError, AnswerEvaluationInvalidJsonError, AnswerEvaluationInvalidOutputError, AnswerEvaluationRateLimitedError, AnswerEvaluationUpstreamError } from "@/lib/ai/evaluateInterviewAnswer";
import { validPracticeEvaluation, validPracticeEvaluationRequest } from "@/test/practiceEvaluationFixture";

vi.mock("@/lib/ai/evaluateInterviewAnswer", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/ai/evaluateInterviewAnswer")>()), evaluateInterviewAnswer: vi.fn() }));
import { evaluateInterviewAnswer } from "@/lib/ai/evaluateInterviewAnswer";
import { POST } from "./route";

const mocked = vi.mocked(evaluateInterviewAnswer);
const request = (body: string, contentType = "application/json") => new Request("http://localhost/api/interview/practice/evaluate", { method: "POST", headers: { "Content-Type": contentType }, body });

describe("interview practice evaluation route", () => {
  beforeEach(() => mocked.mockReset());
  it("rejects non-JSON content and malformed JSON", async () => { expect((await POST(request("x", "text/plain"))).status).toBe(415); expect((await POST(request("{"))).status).toBe(400); });
  it.each(["question", "answer"] as const)("rejects missing %s", async (field) => { const body: Record<string, unknown> = { ...validPracticeEvaluationRequest }; delete body[field]; const response = await POST(request(JSON.stringify(body))); expect(response.status).toBe(422); expect((await response.json()).error.code).toBe("INVALID_REQUEST"); expect(mocked).not.toHaveBeenCalled(); });
  it("returns dedicated answer length errors", async () => { const short = await POST(request(JSON.stringify({ ...validPracticeEvaluationRequest, answer: "short" }))); expect((await short.json()).error.code).toBe("ANSWER_TOO_SHORT"); const long = await POST(request(JSON.stringify({ ...validPracticeEvaluationRequest, answer: "x".repeat(5001) }))); expect((await long.json()).error.code).toBe("ANSWER_TOO_LONG"); });
  it("rejects an unsupported output language", async () => { const response = await POST(request(JSON.stringify({ ...validPracticeEvaluationRequest, outputLanguage: "fr" }))); expect(response.status).toBe(422); expect(mocked).not.toHaveBeenCalled(); });
  it.each(["resume", "jobDescription", "analysis", "questions", "reviewTopics", "extractedText", "apiKey"])("rejects and does not echo forbidden field %s", async (field) => { const privateValue = "private-answer-prompt-resume-jd-api-key"; const response = await POST(request(JSON.stringify({ ...validPracticeEvaluationRequest, [field]: privateValue }))); expect(response.status).toBe(422); expect(JSON.stringify(await response.json())).not.toContain(privateValue); expect(mocked).not.toHaveBeenCalled(); });
  it("calls the AI service exactly once and returns success/data", async () => { mocked.mockResolvedValueOnce(validPracticeEvaluation); const response = await POST(request(JSON.stringify(validPracticeEvaluationRequest))); expect(response.status).toBe(200); expect(await response.json()).toEqual({ success: true, data: validPracticeEvaluation }); expect(mocked).toHaveBeenCalledTimes(1); expect(mocked).toHaveBeenCalledWith(validPracticeEvaluationRequest); });
  it.each([[new AiNotConfiguredError(), "AI_NOT_CONFIGURED", 503], [new AnswerEvaluationAuthenticationError(), "AI_AUTHENTICATION_ERROR", 502], [new AnswerEvaluationRateLimitedError(), "AI_RATE_LIMITED", 429], [new AnswerEvaluationUpstreamError("raw upstream prompt answer key"), "AI_UPSTREAM_ERROR", 502], [new AnswerEvaluationEmptyOutputError(), "AI_EMPTY_OUTPUT", 502], [new AnswerEvaluationInvalidJsonError(), "AI_INVALID_JSON", 502], [new AnswerEvaluationInvalidOutputError(), "AI_INVALID_OUTPUT", 502]] as const)("maps a safe failure %#", async (error, code, status) => { mocked.mockRejectedValueOnce(error); const response = await POST(request(JSON.stringify(validPracticeEvaluationRequest))); expect(response.status).toBe(status); const body = await response.json(); expect(body.error.code).toBe(code); const serialized = JSON.stringify(body); expect(serialized).not.toContain(validPracticeEvaluationRequest.answer); expect(serialized).not.toContain("raw upstream"); expect(serialized).not.toContain("GEMINI"); });
});
