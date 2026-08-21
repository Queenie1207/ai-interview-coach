import { z } from "zod";
import { DifficultySchema, QuestionCategorySchema } from "@/lib/schemas/interviewPreparationSchema";
import { MAX_FOLLOW_UP_ROUNDS } from "@/lib/practice/followUpFlow";

const evidence = z.array(z.string().trim().min(1).max(4000)).max(20);

export const FollowUpTurnSchema = z.object({
  round: z.number().int().min(1),
  question: z.string().trim().min(1).max(4000),
  answer: z.string().trim().min(10).max(3000),
}).strict();

export const InterviewFollowUpEvaluationRequestSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  category: QuestionCategorySchema,
  difficulty: DifficultySchema,
  whyAsked: z.string().trim().min(1).max(4000),
  relatedRequirement: z.string().trim().min(1).max(4000).nullable(),
  resumeEvidence: evidence,
  jdEvidence: evidence,
  answerOutline: evidence,
  originalAnswer: z.string().trim().min(20).max(5000),
  followUpHistory: z.array(FollowUpTurnSchema).max(MAX_FOLLOW_UP_ROUNDS),
  outputLanguage: z.enum(["zh-TW", "zh-CN", "en"]),
  intent: z.enum(["continue", "finish"]),
}).strict().superRefine((value, context) => {
  value.followUpHistory.forEach((turn, index) => {
    if (turn.round !== index + 1) context.addIssue({ code: "custom", path: ["followUpHistory", index, "round"], message: "Rounds must start at 1 and be consecutive." });
  });
});

export type InterviewFollowUpEvaluationRequest = z.infer<typeof InterviewFollowUpEvaluationRequestSchema>;
