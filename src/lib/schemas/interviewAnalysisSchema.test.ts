import { describe, expect, it } from "vitest";
import { InterviewAnalysisSchema } from "./interviewAnalysisSchema";
import { validAnalysis } from "@/test/analysisFixture";

describe("InterviewAnalysisSchema", () => {
  it("accepts valid analysis", () => expect(InterviewAnalysisSchema.safeParse(validAnalysis).success).toBe(true));
  it.each([-1, 101, 82.5])("rejects invalid score %s", (matchScore) => expect(InterviewAnalysisSchema.safeParse({ ...validAnalysis, matchScore }).success).toBe(false));
  it("rejects invalid level", () => expect(InterviewAnalysisSchema.safeParse({ ...validAnalysis, matchLevel: "excellent" }).success).toBe(false));
  it("rejects level inconsistent with score", () => expect(InterviewAnalysisSchema.safeParse({ ...validAnalysis, matchLevel: "weak" }).success).toBe(false));
  it("rejects nested unknown fields", () => expect(InterviewAnalysisSchema.safeParse({ ...validAnalysis, strengths: [{ ...validAnalysis.strengths[0], extra: true }] }).success).toBe(false));
  it("rejects invalid evidence", () => expect(InterviewAnalysisSchema.safeParse({ ...validAnalysis, strengths: [{ ...validAnalysis.strengths[0], evidence: { resumeEvidence: "Swift", jdEvidence: [] } }] }).success).toBe(false));
  it("rejects missing top-level fields", () => { const incomplete: Record<string, unknown> = { ...validAnalysis }; delete incomplete.summary; expect(InterviewAnalysisSchema.safeParse(incomplete).success).toBe(false); });
});
