import { z } from "zod";
import { EvaluationDimensionSchema, StarEvaluationSchema } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import { SCORE_MAX, SCORE_MIN } from "@/lib/practice/questionEvaluationRules";

export const InterviewFinalEvaluationSchema = z.object({
  overallScore: z.number().int().min(SCORE_MIN).max(SCORE_MAX),
  summary: z.string().trim().min(1),
  strengths: z.array(z.string().trim().min(1)).max(10),
  improvements: z.array(z.string().trim().min(1)).max(10),
  missingPoints: z.array(z.string().trim().min(1)).max(10),
  improvedAnswer: z.string().trim().min(1),
  needsFollowUp: z.literal(false),
  suggestedFollowUpQuestion: z.null(),
  dimensions: z.object({ relevance: EvaluationDimensionSchema, evidence: EvaluationDimensionSchema, structure: EvaluationDimensionSchema, clarity: EvaluationDimensionSchema }).strict(),
  starEvaluation: StarEvaluationSchema.nullable(),
}).strict().superRefine((value, context) => {
  const mean = Math.round((value.dimensions.relevance.score + value.dimensions.evidence.score + value.dimensions.structure.score + value.dimensions.clarity.score) / 4);
  if (value.overallScore !== mean) context.addIssue({ code: "custom", path: ["overallScore"], message: "Overall score must be the rounded mean of dimension scores." });
});

export type InterviewFinalEvaluation = z.infer<typeof InterviewFinalEvaluationSchema>;
