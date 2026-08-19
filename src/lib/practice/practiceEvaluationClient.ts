import type { SupportedLocale } from "@/lib/i18n/locales";
import type { InterviewPreparation } from "@/types/preparation";
import type { InterviewAnswerEvaluationRequest, InterviewAnswerEvaluationResponse } from "@/types/practice";

type Question = InterviewPreparation["questions"][number];
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type PracticeEvaluationRequestResult = { status: "completed"; response: InterviewAnswerEvaluationResponse } | { status: "duplicate" | "stale" };

export function buildPracticeEvaluationRequest(question: Question, answer: string, outputLanguage: SupportedLocale): InterviewAnswerEvaluationRequest {
  const nonEmpty = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);
  return { question: question.question.trim(), category: question.category, difficulty: question.difficulty, whyAsked: question.whyAsked.trim(), relatedRequirement: question.relatedRequirement?.trim() || null, resumeEvidence: nonEmpty(question.resumeEvidence), jdEvidence: nonEmpty(question.jdEvidence), answerOutline: nonEmpty(question.answerOutline), answer: answer.trim(), outputLanguage };
}

export function createPracticeEvaluationRequestController(fetcher: Fetcher = fetch) {
  let activeController: AbortController | null = null;
  let generation = 0;
  return {
    cancel() { generation += 1; activeController?.abort(); activeController = null; },
    hasPending() { return activeController !== null; },
    async submit(payload: InterviewAnswerEvaluationRequest): Promise<PracticeEvaluationRequestResult> {
      if (activeController) return { status: "duplicate" };
      const controller = new AbortController();
      const requestGeneration = ++generation;
      activeController = controller;
      try {
        const response = await fetcher("/api/interview/practice/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
        const body = (await response.json()) as InterviewAnswerEvaluationResponse;
        if (generation !== requestGeneration || controller.signal.aborted) return { status: "stale" };
        return { status: "completed", response: body };
      } catch {
        if (generation !== requestGeneration || controller.signal.aborted) return { status: "stale" };
        return { status: "completed", response: { success: false, error: { code: "AI_UPSTREAM_ERROR", message: "The answer evaluation service is temporarily unavailable." } } };
      } finally {
        if (generation === requestGeneration) activeController = null;
      }
    },
  };
}
