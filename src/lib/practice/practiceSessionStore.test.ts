import { describe, expect, it, vi } from "vitest";
import { createPracticeSessionStore, isEvaluationCurrent } from "./practiceSessionStore";

describe("practice session store", () => {
  it("preserves each question's answer, evaluation, and submitted snapshot", () => {
    const first = {}; const second = {}; const store = createPracticeSessionStore<object, string>();
    store.save(first, { answer: "first answer", evaluation: "first evaluation", lastEvaluatedAnswerSnapshot: "first answer", followUpHistory: [{ round: 1, question: "detail?", answer: "detail answer" }], pendingFollowUpQuestion: null, currentFollowUpAnswer: "", followUpError: null, currentEvaluation: "first evaluation", finalEvaluation: "final", stopReason: "answer_complete", status: "completed" });
    store.save(second, { answer: "second answer", evaluation: null, lastEvaluatedAnswerSnapshot: null, followUpHistory: [], pendingFollowUpQuestion: null, currentFollowUpAnswer: "", followUpError: null, currentEvaluation: null, finalEvaluation: null, stopReason: null, status: "idle" });
    expect(store.get(first).followUpHistory).toHaveLength(1);
    expect(store.get(second).answer).toBe("second answer");
  });

  it("keeps the answer after success or failure", () => {
    const question = {}; const store = createPracticeSessionStore<object, string>();
    store.save(question, { answer: "submitted answer", evaluation: "result", lastEvaluatedAnswerSnapshot: "submitted answer", followUpHistory: [], pendingFollowUpQuestion: null, currentFollowUpAnswer: "", followUpError: null, currentEvaluation: "result", finalEvaluation: null, stopReason: null, status: "initial_evaluated" });
    expect(store.get(question).answer).toBe("submitted answer");
    store.save(question, { ...store.get(question), evaluation: null });
    expect(store.get(question).answer).toBe("submitted answer");
  });

  it("preserves retry data after a follow-up failure", () => {
    const question = {}; const store = createPracticeSessionStore<object, string>();
    store.save(question, { answer: "original answer", evaluation: "initial", lastEvaluatedAnswerSnapshot: "original answer", followUpHistory: [{ round: 1, question: "First?", answer: "First complete answer." }], pendingFollowUpQuestion: "Second?", currentFollowUpAnswer: "Current draft", followUpError: "Temporary failure", currentEvaluation: "current", finalEvaluation: null, stopReason: null, status: "error" });
    const session = store.get(question); expect(session.answer).toBe("original answer"); expect(session.followUpHistory).toHaveLength(1); expect(session.pendingFollowUpQuestion).toBe("Second?"); expect(session.currentFollowUpAnswer).toBe("Current draft"); expect(session.status).toBe("error");
  });

  it("isolates histories and restores the same question", () => {
    const first = {}; const second = {}; const store = createPracticeSessionStore<object, string>();
    const firstSession = { ...store.get(first), answer: "first", followUpHistory: [{ round: 1, question: "First?", answer: "First complete answer." }] };
    store.save(first, firstSession); store.save(second, { ...store.get(second), answer: "second" });
    expect(store.get(first)).toEqual(firstSession); expect(store.get(second).followUpHistory).toEqual([]);
  });

  it("marks an edited answer stale without sending a request", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(isEvaluationCurrent("edited answer", "submitted answer")).toBe(false);
    expect(isEvaluationCurrent("submitted answer", "submitted answer")).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
