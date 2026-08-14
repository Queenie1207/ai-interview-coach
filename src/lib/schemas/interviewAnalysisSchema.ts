import { z } from "zod";

const EvidenceSchema = z.object({
  resumeEvidence: z.array(z.string()),
  jdEvidence: z.array(z.string()),
}).strict();

const StrengthSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  evidence: EvidenceSchema,
}).strict();

const GapSchema = z.object({
  requirement: z.string(),
  status: z.enum(["partial", "missing"]),
  explanation: z.string(),
  jdEvidence: z.array(z.string()),
  resumeEvidence: z.array(z.string()),
  recommendation: z.string(),
}).strict();

const InterviewFocusSchema = z.object({
  topic: z.string(),
  reason: z.string(),
  relatedRequirement: z.string(),
  resumeEvidence: z.array(z.string()),
}).strict();

export const InterviewAnalysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchLevel: z.enum(["strong", "moderate", "weak"]),
  summary: z.string(),
  strengths: z.array(StrengthSchema),
  gaps: z.array(GapSchema),
  interviewFocus: z.array(InterviewFocusSchema),
}).strict().superRefine((value, context) => {
  const expected = value.matchScore >= 80 ? "strong" : value.matchScore >= 50 ? "moderate" : "weak";
  if (value.matchLevel !== expected) {
    context.addIssue({ code: "custom", path: ["matchLevel"], message: "matchLevel must correspond to matchScore." });
  }
});

export type InterviewAnalysis = z.infer<typeof InterviewAnalysisSchema>;
