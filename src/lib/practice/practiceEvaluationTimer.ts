export const PRACTICE_EVALUATION_DELAY_MS = 800;

export type PracticeEvaluationTimer = {
  cancel: () => boolean;
  hasPending: () => boolean;
  start: (onComplete: () => void) => boolean;
};

export function createPracticeEvaluationTimer(): PracticeEvaluationTimer {
  let handle: ReturnType<typeof setTimeout> | null = null;

  return {
    cancel() {
      if (handle === null) return false;
      clearTimeout(handle);
      handle = null;
      return true;
    },
    hasPending() {
      return handle !== null;
    },
    start(onComplete) {
      if (handle !== null) return false;
      handle = setTimeout(() => {
        handle = null;
        onComplete();
      }, PRACTICE_EVALUATION_DELAY_MS);
      return true;
    },
  };
}
