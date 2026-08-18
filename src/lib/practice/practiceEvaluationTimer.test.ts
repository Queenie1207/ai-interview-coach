import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPracticeEvaluationTimer, PRACTICE_EVALUATION_DELAY_MS } from "./practiceEvaluationTimer";

type TestSession = {
  answer: string;
  evaluation: string | null;
  question: string | null;
  submitting: boolean;
};

function createHarness() {
  const timer = createPracticeEvaluationTimer();
  const session: TestSession = { answer: "A valid practice answer with enough detail.", evaluation: null, question: "question-1", submitting: false };
  let completionCount = 0;

  function submit(): boolean {
    if (session.submitting || timer.hasPending()) return false;
    session.submitting = true;
    return timer.start(() => {
      completionCount += 1;
      session.evaluation = `evaluation-${completionCount}`;
      session.submitting = false;
    });
  }

  function cancelAndReset(clearSession: boolean) {
    timer.cancel();
    session.submitting = false;
    if (clearSession) {
      session.answer = "";
      session.evaluation = null;
      session.question = null;
    }
  }

  return { cancelAndReset, getCompletionCount: () => completionCount, session, submit, timer };
}

describe("practice evaluation timer lifecycle", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.clearAllTimers(); vi.restoreAllMocks(); vi.useRealTimers(); });

  it("enters submitting and publishes the mock result only after 800ms", () => {
    const harness = createHarness();
    expect(harness.submit()).toBe(true);
    expect(harness.session.submitting).toBe(true);
    expect(harness.session.evaluation).toBeNull();
    vi.advanceTimersByTime(PRACTICE_EVALUATION_DELAY_MS - 1);
    expect(harness.session.evaluation).toBeNull();
    vi.advanceTimersByTime(1);
    expect(harness.session.evaluation).toBe("evaluation-1");
    expect(harness.session.submitting).toBe(false);
  });

  it("allows only one effective flow during a rapid double submit", () => {
    const harness = createHarness();
    expect(harness.submit()).toBe(true);
    expect(harness.submit()).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(PRACTICE_EVALUATION_DELAY_MS);
    expect(harness.getCompletionCount()).toBe(1);
  });

  it("cancels on return and cannot publish after timers advance", () => {
    const harness = createHarness();
    harness.submit();
    harness.cancelAndReset(false);
    expect(harness.timer.hasPending()).toBe(false);
    expect(harness.session.submitting).toBe(false);
    vi.runAllTimers();
    expect(harness.session.evaluation).toBeNull();
    expect(harness.getCompletionCount()).toBe(0);
  });

  it("cancels the old question before switching to a new question", () => {
    const harness = createHarness();
    harness.submit();
    harness.cancelAndReset(false);
    harness.session.question = "question-2";
    vi.runAllTimers();
    expect(harness.session.question).toBe("question-2");
    expect(harness.session.evaluation).toBeNull();
  });

  it("supports a new submission after cancellation without the stale result winning", () => {
    const harness = createHarness();
    harness.submit();
    harness.cancelAndReset(false);
    expect(harness.submit()).toBe(true);
    vi.advanceTimersByTime(PRACTICE_EVALUATION_DELAY_MS);
    expect(harness.session.evaluation).toBe("evaluation-1");
    expect(harness.getCompletionCount()).toBe(1);
  });

  it.each(["remove", "replace"])("clears practice state when the PDF is %s", () => {
    const harness = createHarness();
    harness.submit();
    harness.cancelAndReset(true);
    expect(harness.timer.hasPending()).toBe(false);
    expect(harness.session).toEqual({ answer: "", evaluation: null, question: null, submitting: false });
    vi.runAllTimers();
    expect(harness.getCompletionCount()).toBe(0);
  });

  it("does not call fetch or any API while completing a mock submission", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createHarness();
    harness.submit();
    vi.advanceTimersByTime(PRACTICE_EVALUATION_DELAY_MS);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
