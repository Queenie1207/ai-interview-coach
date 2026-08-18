import { z } from "zod";

export const QuestionCategorySchema = z.enum(["introduction", "resume", "project", "technical", "behavioral", "gap", "situational"]);
export const DifficultySchema = z.enum(["basic", "intermediate", "advanced"]);

export const StarOutlineSchema = z.object({
  situation: z.string().nullable(),
  task: z.string().nullable(),
  action: z.array(z.string()),
  result: z.string().nullable(),
}).strict();

export const InterviewQuestionSchema = z.object({
  category: QuestionCategorySchema,
  difficulty: DifficultySchema,
  question: z.string(),
  whyAsked: z.string(),
  relatedRequirement: z.string().nullable(),
  resumeEvidence: z.array(z.string()),
  jdEvidence: z.array(z.string()),
  answerOutline: z.array(z.string()),
  starOutline: StarOutlineSchema.nullable(),
  followUps: z.array(z.string()),
}).strict();

export const ReviewTopicSchema = z.object({
  topic: z.string(),
  reason: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  relatedQuestions: z.array(z.string()),
}).strict();

export const InterviewPreparationSchema = z.object({
  questions: z.array(InterviewQuestionSchema).min(5).max(10),
  reviewTopics: z.array(ReviewTopicSchema).max(10),
}).strict();

export const MoreInterviewQuestionsSchema = z.object({
  questions: z.array(InterviewQuestionSchema).max(5),
}).strict();

export type InterviewPreparation = z.infer<typeof InterviewPreparationSchema>;
export type MoreInterviewQuestions = z.infer<typeof MoreInterviewQuestionsSchema>;
