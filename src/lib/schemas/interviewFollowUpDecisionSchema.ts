import { z } from "zod";
import { InterviewAnswerEvaluationSchema } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import { InterviewFinalEvaluationSchema } from "@/lib/schemas/interviewFinalEvaluationSchema";

export const FollowUpStopReasonSchema = z.enum(["answer_complete", "max_rounds_reached", "user_ended", "no_material_gap", "duplicate_follow_up"]);

export const InterviewFollowUpDecisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("continue"), stopReason: z.null(), nextFollowUpQuestion: z.string().trim().min(1), currentEvaluation: InterviewAnswerEvaluationSchema }).strict(),
  z.object({ decision: z.literal("complete"), stopReason: FollowUpStopReasonSchema, nextFollowUpQuestion: z.null(), finalEvaluation: InterviewFinalEvaluationSchema }).strict(),
]);

export type FollowUpStopReason = z.infer<typeof FollowUpStopReasonSchema>;
export type InterviewFollowUpDecision = z.infer<typeof InterviewFollowUpDecisionSchema>;
