import { z } from "zod";
import { InterviewAnalysisSchema } from "@/lib/schemas/interviewAnalysisSchema";
import { ResumeSchema } from "@/lib/schemas/resumeSchema";

export const InterviewPreparationRequestSchema = z.object({
  resume: ResumeSchema,
  jobDescription: z.string().trim().min(50),
  analysis: InterviewAnalysisSchema,
  outputLanguage: z.enum(["zh-TW", "zh-CN", "en"]),
  companyName: z.string().optional(),
  positionName: z.string().optional(),
}).strict();

export type InterviewPreparationRequest = z.infer<typeof InterviewPreparationRequestSchema>;
