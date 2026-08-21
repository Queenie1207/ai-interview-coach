import type { SupportedLocale } from "@/lib/i18n/locales";
import type { InterviewPreparation } from "@/types/preparation";
import type { FollowUpTurn, InterviewFollowUpEvaluationRequest, InterviewFollowUpEvaluationResponse } from "@/types/practice";

type Question = InterviewPreparation["questions"][number];
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type FollowUpRequestResult = { status: "completed"; response: InterviewFollowUpEvaluationResponse } | { status: "duplicate" | "stale" };

export function buildFollowUpEvaluationRequest(question: Question, originalAnswer: string, followUpHistory: FollowUpTurn[], outputLanguage: SupportedLocale, intent: "continue" | "finish"): InterviewFollowUpEvaluationRequest {
  const nonEmpty = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);
  return { question: question.question.trim(), category: question.category, difficulty: question.difficulty, whyAsked: question.whyAsked.trim(), relatedRequirement: question.relatedRequirement?.trim() || null, resumeEvidence: nonEmpty(question.resumeEvidence), jdEvidence: nonEmpty(question.jdEvidence), answerOutline: nonEmpty(question.answerOutline), originalAnswer: originalAnswer.trim(), followUpHistory: followUpHistory.map((turn) => ({ round: turn.round, question: turn.question.trim(), answer: turn.answer.trim() })), outputLanguage, intent };
}

export function createFollowUpEvaluationRequestController(fetcher: Fetcher = fetch) {
  let activeController: AbortController | null = null;
  let generation = 0;
  return {
    cancel() { generation += 1; activeController?.abort(); activeController = null; },
    hasPending() { return activeController !== null; },
    async submit(payload: InterviewFollowUpEvaluationRequest): Promise<FollowUpRequestResult> {
      if (activeController) return { status: "duplicate" };
      const controller = new AbortController(); const requestGeneration = ++generation; activeController = controller;
      try {
        const response = await fetcher("/api/interview/practice/follow-up/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
        const body = (await response.json()) as InterviewFollowUpEvaluationResponse;
        if (generation !== requestGeneration || controller.signal.aborted) return { status: "stale" };
        return { status: "completed", response: body };
      } catch {
        if (generation !== requestGeneration || controller.signal.aborted) return { status: "stale" };
        return { status: "completed", response: { success: false, error: { code: "AI_UPSTREAM_ERROR", message: "The final evaluation service is temporarily unavailable." } } };
      } finally { if (generation === requestGeneration) activeController = null; }
    },
  };
}
