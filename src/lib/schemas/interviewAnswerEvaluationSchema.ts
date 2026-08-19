import { z } from "zod";
import { SCORE_MAX, SCORE_MIN } from "@/lib/practice/questionEvaluationRules";

export const EvaluationDimensionSchema = z.object({ score: z.number().int().min(SCORE_MIN).max(SCORE_MAX), feedback: z.string().trim().min(1) }).strict();
export const StarEvaluationSchema = z.object({ situation: z.string().trim().min(1).nullable(), task: z.string().trim().min(1).nullable(), action: z.string().trim().min(1).nullable(), result: z.string().trim().min(1).nullable(), feedback: z.string().trim().min(1) }).strict();

export const InterviewAnswerEvaluationSchema = z.object({
  overallScore: z.number().int().min(SCORE_MIN).max(SCORE_MAX), summary: z.string().trim().min(1),
  strengths: z.array(z.string().trim().min(1)).max(10), improvements: z.array(z.string().trim().min(1)).max(10), missingPoints: z.array(z.string().trim().min(1)).max(10), improvedAnswer: z.string().trim().min(1),
  needsFollowUp: z.boolean(), suggestedFollowUpQuestion: z.string().trim().min(1).nullable(),
  dimensions: z.object({ relevance: EvaluationDimensionSchema, evidence: EvaluationDimensionSchema, structure: EvaluationDimensionSchema, clarity: EvaluationDimensionSchema }).strict(),
  starEvaluation: StarEvaluationSchema.nullable(),
}).strict().superRefine((value, context) => {
  const expectedOverallScore = Math.round((value.dimensions.relevance.score + value.dimensions.evidence.score + value.dimensions.structure.score + value.dimensions.clarity.score) / 4);
  if (value.overallScore !== expectedOverallScore) context.addIssue({ code: "custom", path: ["overallScore"], message: "Overall score must be the rounded mean of dimension scores." });
  if (!value.needsFollowUp && value.suggestedFollowUpQuestion !== null) context.addIssue({ code: "custom", path: ["suggestedFollowUpQuestion"], message: "Follow-up must be null when it is not needed." });
  if (value.needsFollowUp && value.suggestedFollowUpQuestion === null) context.addIssue({ code: "custom", path: ["suggestedFollowUpQuestion"], message: "Follow-up is required when needsFollowUp is true." });
});

export type InterviewAnswerEvaluation = z.infer<typeof InterviewAnswerEvaluationSchema>;
