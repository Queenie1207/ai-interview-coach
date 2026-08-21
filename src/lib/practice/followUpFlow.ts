import type { FollowUpTurn } from "@/types/practice";

export const MAX_FOLLOW_UP_ROUNDS = 3;

export function normalizeFollowUpQuestion(question: string): string {
  return question.normalize("NFKC").trim().toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu, "");
}

export function isDuplicateFollowUpQuestion(nextQuestion: string, historyQuestions: string[]): boolean {
  const normalized = normalizeFollowUpQuestion(nextQuestion);
  return normalized.length > 0 && historyQuestions.some((question) => normalizeFollowUpQuestion(question) === normalized);
}

export function truncateFollowUpHistory(history: FollowUpTurn[], fromRound: number): FollowUpTurn[] {
  return history.filter((turn) => turn.round < fromRound);
}
