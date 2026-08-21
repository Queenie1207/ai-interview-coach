import type { FollowUpStopReason, FollowUpTurn, PracticeFollowUpStatus } from "@/types/practice";

export type PracticeSession<Evaluation> = {
  answer: string;
  evaluation: Evaluation | null;
  lastEvaluatedAnswerSnapshot: string | null;
  followUpHistory: FollowUpTurn[];
  pendingFollowUpQuestion: string | null;
  currentFollowUpAnswer: string;
  followUpError: string | null;
  currentEvaluation: Evaluation | null;
  finalEvaluation: Evaluation | null;
  stopReason: FollowUpStopReason | null;
  status: PracticeFollowUpStatus;
};

export function emptyPracticeSession<Evaluation>(): PracticeSession<Evaluation> {
  return { answer: "", evaluation: null, lastEvaluatedAnswerSnapshot: null, followUpHistory: [], pendingFollowUpQuestion: null, currentFollowUpAnswer: "", followUpError: null, currentEvaluation: null, finalEvaluation: null, stopReason: null, status: "idle" };
}

export function createPracticeSessionStore<Question extends object, Evaluation>() {
  const sessions = new Map<Question, PracticeSession<Evaluation>>();
  return {
    clear() { sessions.clear(); },
    get(question: Question): PracticeSession<Evaluation> { return sessions.get(question) ?? emptyPracticeSession<Evaluation>(); },
    save(question: Question, session: PracticeSession<Evaluation>) { sessions.set(question, session); },
  };
}

export function isEvaluationCurrent(answer: string, lastEvaluatedAnswerSnapshot: string | null): boolean {
  return lastEvaluatedAnswerSnapshot !== null && answer === lastEvaluatedAnswerSnapshot;
}
