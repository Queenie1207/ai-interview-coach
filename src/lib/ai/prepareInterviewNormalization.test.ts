import { describe, expect, it } from "vitest";
import { normalizePreparationStarOutlines } from "./prepareInterview";

describe("preparation STAR normalization", () => {
  it("converts only the exact empty STAR placeholder to null", () => {
    const value = { questions: [{ question: "Q", starOutlineParts: [] }] };
    expect(normalizePreparationStarOutlines(value)).toEqual({ questions: [{ question: "Q", starOutline: null }] });
  });

  it("preserves a STAR outline containing evidence", () => {
    const starOutline = { situation: "Context", task: null, action: ["Action"], result: null };
    const value = { questions: [{ question: "Q", starOutlineParts: ["Context", "", "Action", ""] }] };
    expect(normalizePreparationStarOutlines(value)).toEqual({ questions: [{ question: "Q", starOutline }] });
  });

  it("does not invent or repair malformed data", () => {
    const value = { questions: [{ question: "Q", starOutline: { situation: null } }] };
    expect(normalizePreparationStarOutlines(value)).toEqual(value);
  });

  it("removes empty STAR action placeholders and collapses an empty STAR", () => {
    const value = { questions: [{ question: "Q", starOutlineParts: ["", "", " ", ""] }] };
    expect(normalizePreparationStarOutlines(value)).toEqual({ questions: [{ question: "Q", starOutline: null }] });
  });
});
