export type PracticeSession<Evaluation> = {
  answer: string;
  evaluation: Evaluation | null;
  lastEvaluatedAnswerSnapshot: string | null;
  followUpOpen: boolean;
  followUpAnswer: string;
  followUpError: string | null;
  finalEvaluation: Evaluation | null;
};

export function emptyPracticeSession<Evaluation>(): PracticeSession<Evaluation> {
  return { answer: "", evaluation: null, lastEvaluatedAnswerSnapshot: null, followUpOpen: false, followUpAnswer: "", followUpError: null, finalEvaluation: null };
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
