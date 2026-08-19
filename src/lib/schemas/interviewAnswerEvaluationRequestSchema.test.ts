import { describe, expect, it } from "vitest";
import { validPracticeEvaluationRequest } from "@/test/practiceEvaluationFixture";
import { InterviewAnswerEvaluationRequestSchema } from "./interviewAnswerEvaluationRequestSchema";

describe("InterviewAnswerEvaluationRequestSchema", () => {
  it("accepts a minimal valid request", () => expect(InterviewAnswerEvaluationRequestSchema.safeParse(validPracticeEvaluationRequest).success).toBe(true));
  it.each(["question", "answer"] as const)("rejects missing %s", (field) => { const value: Record<string, unknown> = { ...validPracticeEvaluationRequest }; delete value[field]; expect(InterviewAnswerEvaluationRequestSchema.safeParse(value).success).toBe(false); });
  it("rejects short and long answers", () => { expect(InterviewAnswerEvaluationRequestSchema.safeParse({ ...validPracticeEvaluationRequest, answer: "short" }).success).toBe(false); expect(InterviewAnswerEvaluationRequestSchema.safeParse({ ...validPracticeEvaluationRequest, answer: "x".repeat(5001) }).success).toBe(false); });
  it("rejects an unsupported output language", () => expect(InterviewAnswerEvaluationRequestSchema.safeParse({ ...validPracticeEvaluationRequest, outputLanguage: "fr" }).success).toBe(false));
  it.each(["resume", "jobDescription", "analysis", "questions", "reviewTopics", "extractedText"])("rejects forbidden field %s", (field) => expect(InterviewAnswerEvaluationRequestSchema.safeParse({ ...validPracticeEvaluationRequest, [field]: "private" }).success).toBe(false));
});
