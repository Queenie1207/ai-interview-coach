import { describe, expect, it } from "vitest";
import { validFinalEvaluation } from "@/test/followUpEvaluationFixture";
import { validPracticeEvaluation } from "@/test/practiceEvaluationFixture";
import { FollowUpEvaluationInvalidJsonError, FollowUpEvaluationInvalidOutputError, parseInterviewFollowUpDecisionContent } from "./evaluateInterviewFollowUp";

describe("follow-up decision structured output", () => {
  it("parses continue and complete decisions", () => { const continued = { decision: "continue", stopReason: null, nextFollowUpQuestion: "What happened next?", currentEvaluation: validPracticeEvaluation }; const complete = { decision: "complete", stopReason: "answer_complete", nextFollowUpQuestion: null, finalEvaluation: validFinalEvaluation }; expect(parseInterviewFollowUpDecisionContent(JSON.stringify(continued), "technical")).toEqual(continued); expect(parseInterviewFollowUpDecisionContent(JSON.stringify(complete), "technical")).toEqual(complete); });
  it("rejects invalid JSON and contradictory output", () => { expect(() => parseInterviewFollowUpDecisionContent("not json", "technical")).toThrow(FollowUpEvaluationInvalidJsonError); expect(() => parseInterviewFollowUpDecisionContent(JSON.stringify({ decision: "continue", stopReason: "answer_complete", nextFollowUpQuestion: null, finalEvaluation: validFinalEvaluation }), "technical")).toThrow(FollowUpEvaluationInvalidOutputError); });
  it("rejects STAR output for technical questions", () => { const finalEvaluation = { ...validFinalEvaluation, starEvaluation: { situation: "S", task: "T", action: "A", result: "R", feedback: "F" } }; expect(() => parseInterviewFollowUpDecisionContent(JSON.stringify({ decision: "complete", stopReason: "answer_complete", nextFollowUpQuestion: null, finalEvaluation }), "technical")).toThrow(FollowUpEvaluationInvalidOutputError); });
});
