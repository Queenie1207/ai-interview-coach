import { describe, expect, it } from "vitest";
import { validPracticeEvaluation } from "@/test/practiceEvaluationFixture";
import { AnswerEvaluationInvalidJsonError, AnswerEvaluationInvalidOutputError, parseInterviewAnswerEvaluationContent } from "./evaluateInterviewAnswer";

describe("answer evaluation structured output", () => {
  it("parses valid structured output", () => expect(parseInterviewAnswerEvaluationContent(JSON.stringify(validPracticeEvaluation), "technical")).toEqual(validPracticeEvaluation));
  it("rejects invalid JSON", () => expect(() => parseInterviewAnswerEvaluationContent("not json", "technical")).toThrow(AnswerEvaluationInvalidJsonError));
  it("rejects schema-invalid output", () => expect(() => parseInterviewAnswerEvaluationContent(JSON.stringify({ ...validPracticeEvaluation, overallScore: 101 }), "technical")).toThrow(AnswerEvaluationInvalidOutputError));
  it("rejects STAR output for a technical question", () => expect(() => parseInterviewAnswerEvaluationContent(JSON.stringify({ ...validPracticeEvaluation, starEvaluation: { situation: "S", task: "T", action: "A", result: "R", feedback: "F" } }), "technical")).toThrow(AnswerEvaluationInvalidOutputError));
  it("allows suitable STAR feedback for a behavioral question", () => { const starEvaluation = { situation: "Clear", task: "Clear", action: "Specific", result: null, feedback: "Add the result." }; expect(parseInterviewAnswerEvaluationContent(JSON.stringify({ ...validPracticeEvaluation, starEvaluation }), "behavioral").starEvaluation).toEqual(starEvaluation); });
});
