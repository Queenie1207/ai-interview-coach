import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { evaluateInterviewFollowUp, FollowUpEvaluationAuthenticationError, FollowUpEvaluationEmptyOutputError, FollowUpEvaluationInvalidJsonError, FollowUpEvaluationInvalidOutputError, FollowUpEvaluationRateLimitedError, FollowUpEvaluationUpstreamError } from "@/lib/ai/evaluateInterviewFollowUp";
import { InterviewFollowUpEvaluationRequestSchema } from "@/lib/schemas/interviewFollowUpEvaluationRequestSchema";
import type { FollowUpEvaluationErrorCode, InterviewFollowUpEvaluationResponse } from "@/types/practice";

export const runtime = "nodejs";
function failure(code: FollowUpEvaluationErrorCode, message: string, status: number) { return NextResponse.json<InterviewFollowUpEvaluationResponse>({ success: false, error: { code, message } }, { status }); }
function safeLog(code: FollowUpEvaluationErrorCode, status: number) { console.error("[interview-follow-up-evaluation] failure", { code, provider: "gemini", status }); }

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return failure("INVALID_REQUEST", "Request body must be an object.", 400);
  const value = body as Record<string, unknown>;
  if (typeof value.originalAnswer === "string") {
    const length = value.originalAnswer.trim().length;
    if (length < 20) return failure("ORIGINAL_ANSWER_TOO_SHORT", "Original answer must be at least 20 characters.", 422);
    if (length > 5000) return failure("ORIGINAL_ANSWER_TOO_LONG", "Original answer must be no more than 5000 characters.", 422);
  }
  if (typeof value.followUpAnswer === "string") {
    const length = value.followUpAnswer.trim().length;
    if (length < 10) return failure("FOLLOW_UP_ANSWER_TOO_SHORT", "Follow-up answer must be at least 10 characters.", 422);
    if (length > 3000) return failure("FOLLOW_UP_ANSWER_TOO_LONG", "Follow-up answer must be no more than 3000 characters.", 422);
  }
  const parsed = InterviewFollowUpEvaluationRequestSchema.safeParse(value);
  if (!parsed.success) return failure("INVALID_REQUEST", "Request body contains missing, unsupported, or invalid fields.", 422);
  try {
    const finalEvaluation = await evaluateInterviewFollowUp(parsed.data);
    return NextResponse.json<InterviewFollowUpEvaluationResponse>({ success: true, data: { finalEvaluation } });
  } catch (error) {
    const mappings: Array<[new (...args: never[]) => Error, FollowUpEvaluationErrorCode, string, number]> = [
      [AiNotConfiguredError, "AI_NOT_CONFIGURED", "Final evaluation is not configured on the server.", 503],
      [FollowUpEvaluationAuthenticationError, "AI_AUTHENTICATION_ERROR", "The final evaluation service could not authenticate.", 502],
      [FollowUpEvaluationRateLimitedError, "AI_RATE_LIMITED", "The final evaluation service is busy. Please try again later.", 429],
      [FollowUpEvaluationUpstreamError, "AI_UPSTREAM_ERROR", "The final evaluation service is temporarily unavailable. Please try again.", 502],
      [FollowUpEvaluationEmptyOutputError, "AI_EMPTY_OUTPUT", "The final evaluation service returned no output. Please try again.", 502],
      [FollowUpEvaluationInvalidJsonError, "AI_INVALID_JSON", "The final evaluation service returned invalid data. Please try again.", 502],
      [FollowUpEvaluationInvalidOutputError, "AI_INVALID_OUTPUT", "The final evaluation could not be validated reliably. Please try again.", 502],
    ];
    for (const [ErrorType, code, message, status] of mappings) if (error instanceof ErrorType) { safeLog(code, status); return failure(code, message, status); }
    safeLog("INTERNAL_ERROR", 500); return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
