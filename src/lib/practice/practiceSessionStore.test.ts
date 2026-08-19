import { describe, expect, it, vi } from "vitest";
import { createPracticeSessionStore, isEvaluationCurrent } from "./practiceSessionStore";

describe("practice session store", () => {
  it("preserves each question's answer, evaluation, and submitted snapshot", () => {
    const first = {}; const second = {}; const store = createPracticeSessionStore<object, string>();
    store.save(first, { answer: "first answer", evaluation: "first evaluation", lastEvaluatedAnswerSnapshot: "first answer" });
    store.save(second, { answer: "second answer", evaluation: null, lastEvaluatedAnswerSnapshot: null });
    expect(store.get(first)).toEqual({ answer: "first answer", evaluation: "first evaluation", lastEvaluatedAnswerSnapshot: "first answer" });
    expect(store.get(second).answer).toBe("second answer");
  });

  it("keeps the answer after success or failure", () => {
    const question = {}; const store = createPracticeSessionStore<object, string>();
    store.save(question, { answer: "submitted answer", evaluation: "result", lastEvaluatedAnswerSnapshot: "submitted answer" });
    expect(store.get(question).answer).toBe("submitted answer");
    store.save(question, { ...store.get(question), evaluation: null });
    expect(store.get(question).answer).toBe("submitted answer");
  });

  it("marks an edited answer stale without sending a request", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(isEvaluationCurrent("edited answer", "submitted answer")).toBe(false);
    expect(isEvaluationCurrent("submitted answer", "submitted answer")).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
