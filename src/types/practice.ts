import type { InterviewAnswerEvaluation } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import type { InterviewAnswerEvaluationRequest } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";
import type { InterviewFinalEvaluation } from "@/lib/schemas/interviewFinalEvaluationSchema";
import type { InterviewFollowUpEvaluationRequest } from "@/lib/schemas/interviewFollowUpEvaluationRequestSchema";

export type PracticeEvaluationErrorCode =
  | "INVALID_CONTENT_TYPE" | "INVALID_REQUEST" | "ANSWER_TOO_SHORT" | "ANSWER_TOO_LONG"
  | "AI_NOT_CONFIGURED" | "AI_AUTHENTICATION_ERROR" | "AI_RATE_LIMITED" | "AI_UPSTREAM_ERROR"
  | "AI_EMPTY_OUTPUT" | "AI_INVALID_JSON" | "AI_INVALID_OUTPUT" | "INTERNAL_ERROR";

export type InterviewAnswerEvaluationResponse =
  | { success: true; data: InterviewAnswerEvaluation }
  | { success: false; error: { code: PracticeEvaluationErrorCode; message: string } };

export type FollowUpEvaluationErrorCode =
  | "INVALID_CONTENT_TYPE" | "INVALID_REQUEST" | "ORIGINAL_ANSWER_TOO_SHORT" | "ORIGINAL_ANSWER_TOO_LONG"
  | "FOLLOW_UP_ANSWER_TOO_SHORT" | "FOLLOW_UP_ANSWER_TOO_LONG"
  | "AI_NOT_CONFIGURED" | "AI_AUTHENTICATION_ERROR" | "AI_RATE_LIMITED" | "AI_UPSTREAM_ERROR"
  | "AI_EMPTY_OUTPUT" | "AI_INVALID_JSON" | "AI_INVALID_OUTPUT" | "INTERNAL_ERROR";

export type InterviewFollowUpEvaluationResponse =
  | { success: true; data: { finalEvaluation: InterviewFinalEvaluation } }
  | { success: false; error: { code: FollowUpEvaluationErrorCode; message: string } };

export type { InterviewAnswerEvaluation, InterviewAnswerEvaluationRequest, InterviewFinalEvaluation, InterviewFollowUpEvaluationRequest };
