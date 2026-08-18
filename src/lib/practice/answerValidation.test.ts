import { describe, expect, it } from "vitest";
import { validatePracticeAnswer } from "./answerValidation";

describe("practice answer validation", () => {
  it("rejects blank, short, and overly long answers", () => {
    expect(validatePracticeAnswer("   ")).toBe("required");
    expect(validatePracticeAnswer("short answer")).toBe("tooShort");
    expect(validatePracticeAnswer("x".repeat(5001))).toBe("tooLong");
  });

  it("accepts the inclusive length boundaries after trimming", () => {
    expect(validatePracticeAnswer(`  ${"x".repeat(20)}  `)).toBeNull();
    expect(validatePracticeAnswer("x".repeat(5000))).toBeNull();
  });
});
