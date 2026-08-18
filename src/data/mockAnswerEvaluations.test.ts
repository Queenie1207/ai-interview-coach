import { describe, expect, it } from "vitest";
import { mockAnswerEvaluations } from "./mockAnswerEvaluations";

describe("mock answer evaluations", () => {
  it.each(["zh-TW", "zh-CN", "en"] as const)("provides a complete localized preview for %s", (locale) => {
    const evaluation = mockAnswerEvaluations[locale];
    expect(evaluation.overallScore).toBe(80);
    expect([evaluation.relevanceScore, evaluation.evidenceScore, evaluation.structureScore, evaluation.clarityScore]).toHaveLength(4);
    expect(evaluation.needsFollowUp).toBe(true);
    expect(evaluation.suggestedFollowUp).toBeTruthy();
  });
});
