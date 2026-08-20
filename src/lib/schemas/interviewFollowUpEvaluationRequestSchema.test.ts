import { describe, expect, it } from "vitest";
import { validFollowUpEvaluationRequest } from "@/test/followUpEvaluationFixture";
import { InterviewFollowUpEvaluationRequestSchema } from "./interviewFollowUpEvaluationRequestSchema";
describe("InterviewFollowUpEvaluationRequestSchema", () => {
  it("accepts a valid request", () => expect(InterviewFollowUpEvaluationRequestSchema.safeParse(validFollowUpEvaluationRequest).success).toBe(true));
  it.each(["originalAnswer", "followUpQuestion", "followUpAnswer"] as const)("rejects missing %s", (field) => { const value: Record<string, unknown> = { ...validFollowUpEvaluationRequest }; delete value[field]; expect(InterviewFollowUpEvaluationRequestSchema.safeParse(value).success).toBe(false); });
  it("validates length", () => { expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, followUpAnswer: "short" }).success).toBe(false); expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, followUpAnswer: "x".repeat(3001) }).success).toBe(false); });
  it("rejects language and unknown fields", () => { expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, outputLanguage: "fr" }).success).toBe(false); expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, resume: "private" }).success).toBe(false); });
});
