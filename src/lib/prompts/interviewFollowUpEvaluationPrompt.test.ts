import { describe, expect, it } from "vitest";
import { buildInterviewFollowUpEvaluationSystemPrompt, INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT } from "./interviewFollowUpEvaluationPrompt";
describe("follow-up evaluation prompt", () => {
  it("prevents invention", () => { expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("only facts explicitly stated"); expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("Never insert facts found only"); expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("assumptions in followUpQuestion"); });
  it("uses category rules", () => { expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("Technical knowledge questions"); expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("Behavioral or experience questions"); expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("Motivation questions"); });
  it("forces final state", () => { expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("needsFollowUp must be false"); expect(INTERVIEW_FOLLOW_UP_EVALUATION_SYSTEM_PROMPT).toContain("suggestedFollowUpQuestion must be null"); });
  it.each(["zh-TW", "zh-CN", "en"] as const)("uses %s", (locale) => expect(buildInterviewFollowUpEvaluationSystemPrompt(locale)).toMatch(/Chinese|English/));
});
