import type { InterviewAnswerEvaluation } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import type { InterviewAnswerEvaluationRequest } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";
import type { InterviewFinalEvaluation } from "@/lib/schemas/interviewFinalEvaluationSchema";
import type { InterviewFollowUpEvaluationRequest } from "@/lib/schemas/interviewFollowUpEvaluationRequestSchema";
import type { FollowUpStopReason, InterviewFollowUpDecision } from "@/lib/schemas/interviewFollowUpDecisionSchema";

export type FollowUpTurn = { round: number; question: string; answer: string };
export type PracticeFollowUpStatus = "idle" | "evaluating_initial" | "initial_evaluated" | "awaiting_follow_up" | "submitting_follow_up" | "awaiting_next_follow_up" | "finalizing" | "completed" | "error";

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
  | "INVALID_HISTORY" | "INVALID_ROUND" | "MAX_ROUNDS_REACHED"
  | "AI_NOT_CONFIGURED" | "AI_AUTHENTICATION_ERROR" | "AI_RATE_LIMITED" | "AI_UPSTREAM_ERROR"
  | "AI_EMPTY_OUTPUT" | "AI_INVALID_JSON" | "AI_INVALID_OUTPUT" | "INTERNAL_ERROR";

export type InterviewFollowUpEvaluationResponse =
  | { success: true; data: InterviewFollowUpDecision }
  | { success: false; error: { code: FollowUpEvaluationErrorCode; message: string } };

export type { InterviewAnswerEvaluation, InterviewAnswerEvaluationRequest, InterviewFinalEvaluation, InterviewFollowUpEvaluationRequest, FollowUpStopReason, InterviewFollowUpDecision };
