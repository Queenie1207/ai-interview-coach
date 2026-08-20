export const MIN_PRACTICE_ANSWER_LENGTH = 20;
export const MAX_PRACTICE_ANSWER_LENGTH = 5000;
export const MIN_FOLLOW_UP_ANSWER_LENGTH = 10;
export const MAX_FOLLOW_UP_ANSWER_LENGTH = 3000;

export type PracticeAnswerValidationError = "required" | "tooShort" | "tooLong" | null;

export function validatePracticeAnswer(answer: string): PracticeAnswerValidationError {
  const length = answer.trim().length;
  if (length === 0) return "required";
  if (length < MIN_PRACTICE_ANSWER_LENGTH) return "tooShort";
  if (length > MAX_PRACTICE_ANSWER_LENGTH) return "tooLong";
  return null;
}

export function validateFollowUpAnswer(answer: string): PracticeAnswerValidationError {
  const length = answer.trim().length;
  if (length === 0) return "required";
  if (length < MIN_FOLLOW_UP_ANSWER_LENGTH) return "tooShort";
  if (length > MAX_FOLLOW_UP_ANSWER_LENGTH) return "tooLong";
  return null;
}
