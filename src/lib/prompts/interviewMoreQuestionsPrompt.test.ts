import { describe, expect, it } from "vitest";
import { buildInterviewMoreQuestionsSystemPrompt } from "./interviewMoreQuestionsPrompt";

describe("additional questions prompt", () => {
  it.each(["zh-TW", "zh-CN", "en"] as const)("contains exclusion, fidelity, STAR, and locale rules for %s", (locale) => {
    const prompt = buildInterviewMoreQuestionsSystemPrompt(locale, 5);
    expect(prompt).toContain("excluded main question");
    expect(prompt).toContain("excluded follow-up");
    expect(prompt).toContain("Never paraphrase");
    expect(prompt).toContain("Evidence must be faithful excerpts");
    expect(prompt).toContain("Never invent");
    expect(prompt).toContain("STAR applies only");
    expect(prompt).toContain("Requested count: 5");
  });
});
