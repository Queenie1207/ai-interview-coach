import { z } from "zod";
import { DifficultySchema, QuestionCategorySchema } from "@/lib/schemas/interviewPreparationSchema";

const evidence = z.array(z.string().trim().min(1).max(4000)).max(20);
export const InterviewAnswerEvaluationRequestSchema = z.object({
  question: z.string().trim().min(1).max(4000), category: QuestionCategorySchema, difficulty: DifficultySchema,
  whyAsked: z.string().trim().min(1).max(4000), relatedRequirement: z.string().trim().min(1).max(4000).nullable(),
  resumeEvidence: evidence, jdEvidence: evidence, answerOutline: evidence,
  answer: z.string().trim().min(20).max(5000), outputLanguage: z.enum(["zh-TW", "zh-CN", "en"]),
}).strict();

export type InterviewAnswerEvaluationRequest = z.infer<typeof InterviewAnswerEvaluationRequestSchema>;
