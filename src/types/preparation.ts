import type { InterviewPreparation } from "@/lib/schemas/interviewPreparationSchema";
import type { AnalysisErrorCode } from "@/types/analysis";

export type PreparationErrorCode = AnalysisErrorCode | "INVALID_ANALYSIS";

export type InterviewPreparationResponse =
  | { success: true; data: InterviewPreparation }
  | { success: false; error: { code: PreparationErrorCode; message: string } };

export type { InterviewPreparation };
