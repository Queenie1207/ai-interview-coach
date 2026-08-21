import { describe, expect, it } from "vitest";
import { validFollowUpEvaluationRequest } from "@/test/followUpEvaluationFixture";
import { InterviewFollowUpEvaluationRequestSchema } from "./interviewFollowUpEvaluationRequestSchema";
describe("InterviewFollowUpEvaluationRequestSchema", () => {
  it("accepts a valid request", () => expect(InterviewFollowUpEvaluationRequestSchema.safeParse(validFollowUpEvaluationRequest).success).toBe(true));
  it("rejects missing history or invalid intent", () => { const value: Record<string, unknown> = { ...validFollowUpEvaluationRequest }; delete value.followUpHistory; expect(InterviewFollowUpEvaluationRequestSchema.safeParse(value).success).toBe(false); expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, intent: "loop" }).success).toBe(false); });
  it("requires consecutive rounds", () => expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, followUpHistory: [{ ...validFollowUpEvaluationRequest.followUpHistory[0], round: 2 }] }).success).toBe(false));
  it("enforces three rounds and answer length", () => { const turn = validFollowUpEvaluationRequest.followUpHistory[0]; expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, followUpHistory: [turn, { ...turn, round: 2 }, { ...turn, round: 3 }, { ...turn, round: 4 }] }).success).toBe(false); expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, followUpHistory: [{ ...turn, answer: "short" }] }).success).toBe(false); });
  it("rejects unknown maxRounds and private fields", () => { expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, maxRounds: 99 }).success).toBe(false); expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, resume: "private" }).success).toBe(false); });
  it.each(["zh-TW", "zh-CN", "en"] as const)("accepts %s output", (outputLanguage) => expect(InterviewFollowUpEvaluationRequestSchema.safeParse({ ...validFollowUpEvaluationRequest, outputLanguage }).success).toBe(true));
});
