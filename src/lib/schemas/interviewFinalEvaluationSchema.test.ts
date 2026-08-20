import { describe, expect, it } from "vitest";
import { validFinalEvaluation } from "@/test/followUpEvaluationFixture";
import { InterviewFinalEvaluationSchema } from "./interviewFinalEvaluationSchema";
describe("InterviewFinalEvaluationSchema", () => {
  it("accepts valid output", () => expect(InterviewFinalEvaluationSchema.safeParse(validFinalEvaluation).success).toBe(true));
  it("ends follow-up", () => { expect(InterviewFinalEvaluationSchema.safeParse({ ...validFinalEvaluation, needsFollowUp: true }).success).toBe(false); expect(InterviewFinalEvaluationSchema.safeParse({ ...validFinalEvaluation, suggestedFollowUpQuestion: "Another?" }).success).toBe(false); });
  it("rejects score above 100", () => expect(InterviewFinalEvaluationSchema.safeParse({ ...validFinalEvaluation, dimensions: { ...validFinalEvaluation.dimensions, clarity: { score: 101, feedback: "bad" } } }).success).toBe(false));
});
