import { describe, expect, it } from "vitest";
import { INTERVIEW_ANALYSIS_SYSTEM_PROMPT as prompt } from "./interviewAnalysisPrompt";

describe("interview analysis prompt", () => {
  it.each(["Never invent", "resume evidence and JD evidence", "Transferable ability", "strong: matchScore 80-100", "not complete sample answers", "Never score or judge using name"])("contains safeguard: %s", (text) => expect(prompt).toContain(text));
});
