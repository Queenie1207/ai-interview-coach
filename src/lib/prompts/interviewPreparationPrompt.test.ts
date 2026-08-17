import { describe, expect, it } from "vitest";
import { buildInterviewPreparationSystemPrompt } from "./interviewPreparationPrompt";

describe("interview preparation prompt", () => {
  it.each(["zh-TW", "zh-CN", "en"] as const)("contains safeguards for %s", (locale) => {
    const prompt = buildInterviewPreparationSystemPrompt(locale);
    expect(prompt).toMatch(/years of work experience/);
    expect(prompt).toMatch(/job responsibilities/);
    expect(prompt).toMatch(/project outcomes/);
    expect(prompt).toMatch(/quantitative metrics/);
    expect(prompt).toMatch(/technical capabilities/);
    expect(prompt).toMatch(/education/);
    expect(prompt).toMatch(/certificates or certifications/);
    expect(prompt).toMatch(/usage experience the candidate did not provide/);
    expect(prompt).toMatch(/never a complete scripted answer/);
    expect(prompt).toMatch(/STAR facts may only/);
    expect(prompt).toMatch(/Evidence stays verbatim/);
    expect(prompt).toMatch(/Every question must relate/);
  });

  it.each([
    ["zh-TW", "Traditional Chinese"],
    ["zh-CN", "Simplified Chinese"],
    ["en", "in English"],
  ] as const)("contains the %s output language rule", (locale, rule) => expect(buildInterviewPreparationSystemPrompt(locale)).toContain(rule));

  it("distinguishes non-equivalent technologies and experience", () => {
    const prompt = buildInterviewPreparationSystemPrompt("en");
    expect(prompt).toMatch(/REST API experience is not WebSocket experience/);
    expect(prompt).toMatch(/LLM API is not training or fine-tuning/);
    expect(prompt).toMatch(/Prompt Engineering is not AI Agent development/);
    expect(prompt).toMatch(/React experience is not React Native experience/);
    expect(prompt).toMatch(/iOS experience is not Android experience/);
  });

  it("keeps evidence, gap, and transferable-skill rules", () => {
    const prompt = buildInterviewPreparationSystemPrompt("en");
    expect(prompt).toMatch(/Never translate or rewrite evidence/);
    expect(prompt).toMatch(/gap has no resume evidence, use an empty resumeEvidence array/);
    expect(prompt).toMatch(/only be described as a transferable skill/);
    expect(prompt).toMatch(/never be presented as direct experience or direct evidence/);
  });
});
