import type { InterviewAnswerEvaluationRequest } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;
export const STAR_APPLICABLE_CATEGORIES: ReadonlySet<InterviewAnswerEvaluationRequest["category"]> = new Set(["resume", "project", "behavioral", "situational"]);
export function isStarApplicableCategory(category: InterviewAnswerEvaluationRequest["category"]): boolean { return STAR_APPLICABLE_CATEGORIES.has(category); }
