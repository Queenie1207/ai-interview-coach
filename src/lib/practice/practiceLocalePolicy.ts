export type PracticeLocaleChangeStrategy = "preserve-practice" | "reset-analysis-and-practice" | "locale-only";

export function getPracticeLocaleChangeStrategy({ hasActivePractice, hasAnalysisState }: { hasActivePractice: boolean; hasAnalysisState: boolean }): PracticeLocaleChangeStrategy {
  if (hasActivePractice) return "preserve-practice";
  if (hasAnalysisState) return "reset-analysis-and-practice";
  return "locale-only";
}
