import { describe, expect, it } from "vitest";
import { validPracticeEvaluation } from "@/test/practiceEvaluationFixture";
import { InterviewAnswerEvaluationSchema } from "./interviewAnswerEvaluationSchema";

describe("InterviewAnswerEvaluationSchema", () => {
  it("accepts valid structured output", () => expect(InterviewAnswerEvaluationSchema.safeParse(validPracticeEvaluation).success).toBe(true));
  it.each([["overallScore", -1], ["overallScore", 101]] as const)("rejects invalid %s score %s", (field, value) => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, [field]: value }).success).toBe(false));
  it("rejects an out-of-range dimension score", () => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, dimensions: { ...validPracticeEvaluation.dimensions, clarity: { score: 101, feedback: "Invalid" } } }).success).toBe(false));
  it("requires overallScore to equal the rounded dimension mean", () => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, overallScore: 81 }).success).toBe(false));
  it("requires a null follow-up when needsFollowUp is false", () => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, needsFollowUp: false }).success).toBe(false));
  it("requires a follow-up question when needsFollowUp is true", () => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, suggestedFollowUpQuestion: null }).success).toBe(false));
  it("rejects unknown fields", () => expect(InterviewAnswerEvaluationSchema.safeParse({ ...validPracticeEvaluation, secret: "prompt" }).success).toBe(false));
});
