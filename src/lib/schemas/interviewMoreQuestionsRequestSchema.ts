import { z } from "zod";
import { InterviewAnalysisSchema } from "@/lib/schemas/interviewAnalysisSchema";
import { ResumeSchema } from "@/lib/schemas/resumeSchema";

export const ExcludedQuestionSchema = z.object({
  question: z.string().trim().min(1),
  followUps: z.array(z.string().trim().min(1)),
}).strict();

export const InterviewMoreQuestionsRequestSchema = z.object({
  resume: ResumeSchema,
  jobDescription: z.string().trim().min(50),
  analysis: InterviewAnalysisSchema,
  outputLanguage: z.enum(["zh-TW", "zh-CN", "en"]),
  companyName: z.string().optional(),
  positionName: z.string().optional(),
  excludedQuestions: z.array(ExcludedQuestionSchema).max(20),
  count: z.number().int().min(1).max(5),
}).strict().superRefine((value, context) => {
  if (value.excludedQuestions.length + value.count > 20) {
    context.addIssue({ code: "custom", path: ["count"], message: "The total question count cannot exceed 20." });
  }
});

export type InterviewMoreQuestionsRequest = z.infer<typeof InterviewMoreQuestionsRequestSchema>;
