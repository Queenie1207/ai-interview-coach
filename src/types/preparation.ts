import type { InterviewPreparation, MoreInterviewQuestions } from "@/lib/schemas/interviewPreparationSchema";
import type { AnalysisErrorCode } from "@/types/analysis";

export type PreparationErrorCode = AnalysisErrorCode | "INVALID_ANALYSIS";

export type InterviewPreparationResponse =
  | { success: true; data: InterviewPreparation }
  | { success: false; error: { code: PreparationErrorCode; message: string } };

export type MoreInterviewQuestionsResponse =
  | { success: true; data: MoreInterviewQuestions }
  | { success: false; error: { code: PreparationErrorCode; message: string } };

export type { InterviewPreparation };
