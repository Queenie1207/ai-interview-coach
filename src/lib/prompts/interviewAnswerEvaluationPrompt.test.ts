import { describe, expect, it } from "vitest";
import { buildInterviewAnswerEvaluationSystemPrompt, INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT } from "./interviewAnswerEvaluationPrompt";

describe("interview answer evaluation prompt", () => {
  it("forbids sensitive-trait scoring and invented facts", () => { expect(INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT).toContain("Never score grammar, accent, name, gender, age, nationality"); expect(INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT).toContain("Never invent experience"); expect(INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT).toContain("never fabricate"); });
  it("does not force technical questions into STAR or start a follow-up loop", () => { expect(INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT).toContain("Technical knowledge questions must not be forced into STAR"); expect(INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT).toContain("Do not conduct another interview turn"); });
  it.each([["zh-TW", "Traditional Chinese"], ["zh-CN", "Simplified Chinese"], ["en", "English"]] as const)("adds the %s language rule", (locale, expected) => expect(buildInterviewAnswerEvaluationSystemPrompt(locale)).toContain(expected));
});
