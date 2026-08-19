import type { InterviewAnswerEvaluation } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import type { InterviewAnswerEvaluationRequest } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";

export type PracticeEvaluationErrorCode =
  | "INVALID_CONTENT_TYPE" | "INVALID_REQUEST" | "ANSWER_TOO_SHORT" | "ANSWER_TOO_LONG"
  | "AI_NOT_CONFIGURED" | "AI_AUTHENTICATION_ERROR" | "AI_RATE_LIMITED" | "AI_UPSTREAM_ERROR"
  | "AI_EMPTY_OUTPUT" | "AI_INVALID_JSON" | "AI_INVALID_OUTPUT" | "INTERNAL_ERROR";

export type InterviewAnswerEvaluationResponse =
  | { success: true; data: InterviewAnswerEvaluation }
  | { success: false; error: { code: PracticeEvaluationErrorCode; message: string } };

export type { InterviewAnswerEvaluation, InterviewAnswerEvaluationRequest };
