import { describe, expect, it } from "vitest";
import { validFinalEvaluation } from "@/test/followUpEvaluationFixture";
import { validPracticeEvaluation } from "@/test/practiceEvaluationFixture";
import { InterviewFollowUpDecisionSchema } from "./interviewFollowUpDecisionSchema";

const continued = { decision: "continue", stopReason: null, nextFollowUpQuestion: "What happened next?", currentEvaluation: validPracticeEvaluation };
const completed = { decision: "complete", stopReason: "answer_complete", nextFollowUpQuestion: null, finalEvaluation: validFinalEvaluation };

describe("InterviewFollowUpDecisionSchema", () => {
  it("accepts mutually exclusive continue and complete results", () => { expect(InterviewFollowUpDecisionSchema.safeParse(continued).success).toBe(true); expect(InterviewFollowUpDecisionSchema.safeParse(completed).success).toBe(true); });
  it.each([
    { ...continued, nextFollowUpQuestion: "" },
    { ...continued, stopReason: "answer_complete" },
    { ...continued, decision: "later" },
    { ...completed, nextFollowUpQuestion: "Another question?" },
    { ...completed, stopReason: "unknown" },
    { decision: "complete", stopReason: "answer_complete", nextFollowUpQuestion: null },
    { ...completed, currentEvaluation: validPracticeEvaluation },
  ])("rejects an invalid or contradictory result %#", (value) => expect(InterviewFollowUpDecisionSchema.safeParse(value).success).toBe(false));
  it("requires final follow-up fields to be terminal", () => { expect(InterviewFollowUpDecisionSchema.safeParse({ ...completed, finalEvaluation: { ...validFinalEvaluation, needsFollowUp: true, suggestedFollowUpQuestion: "Again?" } }).success).toBe(false); });
});
