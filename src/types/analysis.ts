import type { InterviewAnalysis } from "@/lib/schemas/interviewAnalysisSchema";

export type AnalysisErrorCode =
  | "INVALID_CONTENT_TYPE" | "INVALID_REQUEST" | "INVALID_RESUME"
  | "INVALID_JOB_DESCRIPTION" | "AI_NOT_CONFIGURED" | "AI_AUTHENTICATION_ERROR"
  | "AI_RATE_LIMITED" | "AI_UPSTREAM_ERROR" | "AI_EMPTY_OUTPUT"
  | "AI_INVALID_JSON" | "AI_INVALID_OUTPUT" | "INTERNAL_ERROR";

export type InterviewAnalysisResponse =
  | { success: true; data: InterviewAnalysis }
  | { success: false; error: { code: AnalysisErrorCode; message: string } };

export type AnalysisStatus = "idle" | "loading" | "success";
export type { InterviewAnalysis };
