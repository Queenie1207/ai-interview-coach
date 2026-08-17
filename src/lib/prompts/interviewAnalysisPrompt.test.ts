import { describe, expect, it } from "vitest";
import { INTERVIEW_ANALYSIS_SYSTEM_PROMPT as prompt, buildInterviewAnalysisSystemPrompt } from "./interviewAnalysisPrompt";

describe("interview analysis prompt", () => {
  it.each(["Never invent", "resume evidence and JD evidence", "Transferable ability", "strong: matchScore 80-100", "not complete sample answers", "Never score or judge using name"])("contains safeguard: %s", (text) => expect(prompt).toContain(text));
  it.each([["zh-TW", "Traditional Chinese"], ["zh-CN", "Simplified Chinese"], ["en", "English"]] as const)("sets %s output", (locale, text) => expect(buildInterviewAnalysisSystemPrompt(locale)).toContain(text));
  it.each(["original input language", "technical terms", "Do not add facts", "must not affect matchScore"])("keeps language safeguard: %s", (text) => expect(buildInterviewAnalysisSystemPrompt("en")).toContain(text));
});
