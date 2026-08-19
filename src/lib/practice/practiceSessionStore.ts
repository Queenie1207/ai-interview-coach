export type PracticeSession<Evaluation> = {
  answer: string;
  evaluation: Evaluation | null;
  lastEvaluatedAnswerSnapshot: string | null;
};

export function createPracticeSessionStore<Question extends object, Evaluation>() {
  const sessions = new Map<Question, PracticeSession<Evaluation>>();
  return {
    clear() { sessions.clear(); },
    get(question: Question): PracticeSession<Evaluation> { return sessions.get(question) ?? { answer: "", evaluation: null, lastEvaluatedAnswerSnapshot: null }; },
    save(question: Question, session: PracticeSession<Evaluation>) { sessions.set(question, session); },
  };
}

export function isEvaluationCurrent(answer: string, lastEvaluatedAnswerSnapshot: string | null): boolean {
  return lastEvaluatedAnswerSnapshot !== null && answer === lastEvaluatedAnswerSnapshot;
}
