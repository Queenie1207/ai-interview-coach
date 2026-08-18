import { describe, expect, it } from "vitest";
import { deduplicateQuestions, compactAnalysis } from "./prepareMoreInterviewQuestions";
import { validAnalysis } from "@/test/analysisFixture";
import { validPreparation } from "@/test/preparationFixture";

describe("more question context and deduplication", () => {
  it("builds compact analysis without UI explanations or recommendations", () => {
    const compact = compactAnalysis(validAnalysis);
    expect(compact.strengths[0]).toHaveProperty("title");
    expect(JSON.stringify(compact)).not.toContain("recommendation");
    expect(JSON.stringify(compact)).not.toContain("explanation");
  });
  it("removes old main, old follow-up, punctuation/case variants, and generated duplicates", () => {
    const base = validPreparation.questions[0];
    const generated = [
      { ...base, question: " Existing main? " },
      { ...base, question: "OLD FOLLOW UP!!!" },
      { ...base, question: "A genuinely new debugging question" },
      { ...base, question: "a genuinely new debugging question!" },
    ];
    const result = deduplicateQuestions(generated, [{ question: "existing main", followUps: ["old follow up"] }]);
    expect(result.map((item) => item.question)).toEqual(["A genuinely new debugging question"]);
  });
  it("can return fewer than requested without filling", () => expect(deduplicateQuestions([{ ...validPreparation.questions[0], question: "same" }], [{ question: "same", followUps: [] }])).toEqual([]));
});
