import { describe, expect, it } from "vitest";
import { InterviewMoreQuestionsRequestSchema } from "./interviewMoreQuestionsRequestSchema";
import { validAnalysis } from "@/test/analysisFixture";
import { validResume } from "@/test/resumeFixture";

const valid = { resume: validResume, jobDescription: "We require strong Swift skills, mobile architecture, and reliable API integration experience.", analysis: validAnalysis, outputLanguage: "en", excludedQuestions: [{ question: "Tell me about yourself", followUps: ["Why this role?"] }], count: 5 };

describe("InterviewMoreQuestionsRequestSchema", () => {
  it("accepts a valid request", () => expect(InterviewMoreQuestionsRequestSchema.safeParse(valid).success).toBe(true));
  it.each([0, 6, 1.5])("rejects invalid count %s", (count) => expect(InterviewMoreQuestionsRequestSchema.safeParse({ ...valid, count }).success).toBe(false));
  it("rejects invalid exclusions", () => expect(InterviewMoreQuestionsRequestSchema.safeParse({ ...valid, excludedQuestions: [{ question: "x", followUps: [], whyAsked: "private" }] }).success).toBe(false));
  it.each(["unknownField", "extractedText", "pdf", "file", "resumeFile", "preparation"])("rejects %s", (field) => expect(InterviewMoreQuestionsRequestSchema.safeParse({ ...valid, [field]: "private" }).success).toBe(false));
  it("rejects totals above 20", () => expect(InterviewMoreQuestionsRequestSchema.safeParse({ ...valid, excludedQuestions: Array.from({ length: 18 }, (_, i) => ({ question: `q${i}`, followUps: [] })), count: 3 }).success).toBe(false));
});
