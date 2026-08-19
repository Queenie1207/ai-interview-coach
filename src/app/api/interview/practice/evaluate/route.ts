import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { AnswerEvaluationAuthenticationError, AnswerEvaluationEmptyOutputError, AnswerEvaluationInvalidJsonError, AnswerEvaluationInvalidOutputError, AnswerEvaluationRateLimitedError, AnswerEvaluationUpstreamError, evaluateInterviewAnswer } from "@/lib/ai/evaluateInterviewAnswer";
import { InterviewAnswerEvaluationRequestSchema } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";
import type { InterviewAnswerEvaluationResponse, PracticeEvaluationErrorCode } from "@/types/practice";

export const runtime = "nodejs";
function failure(code: PracticeEvaluationErrorCode, message: string, status: number) { return NextResponse.json<InterviewAnswerEvaluationResponse>({ success: false, error: { code, message } }, { status }); }
function safeLog(code: PracticeEvaluationErrorCode, status: number) { console.error("[interview-answer-evaluation] failure", { code, provider: "gemini", status }); }

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return failure("INVALID_REQUEST", "Request body must be an object.", 400);
  const value = body as Record<string, unknown>;
  if (typeof value.answer === "string") {
    const answerLength = value.answer.trim().length;
    if (answerLength < 20) return failure("ANSWER_TOO_SHORT", "Answer must be at least 20 characters.", 422);
    if (answerLength > 5000) return failure("ANSWER_TOO_LONG", "Answer must be no more than 5000 characters.", 422);
  }
  const parsed = InterviewAnswerEvaluationRequestSchema.safeParse(value);
  if (!parsed.success) return failure("INVALID_REQUEST", "Request body contains missing, unsupported, or invalid fields.", 422);
  try {
    const data = await evaluateInterviewAnswer(parsed.data);
    return NextResponse.json<InterviewAnswerEvaluationResponse>({ success: true, data });
  } catch (error) {
    const mappings: Array<[new (...args: never[]) => Error, PracticeEvaluationErrorCode, string, number]> = [
      [AiNotConfiguredError, "AI_NOT_CONFIGURED", "Answer evaluation is not configured on the server.", 503],
      [AnswerEvaluationAuthenticationError, "AI_AUTHENTICATION_ERROR", "The answer evaluation service could not authenticate.", 502],
      [AnswerEvaluationRateLimitedError, "AI_RATE_LIMITED", "The answer evaluation service is busy. Please try again later.", 429],
      [AnswerEvaluationUpstreamError, "AI_UPSTREAM_ERROR", "The answer evaluation service is temporarily unavailable. Please try again.", 502],
      [AnswerEvaluationEmptyOutputError, "AI_EMPTY_OUTPUT", "The answer evaluation service returned no output. Please try again.", 502],
      [AnswerEvaluationInvalidJsonError, "AI_INVALID_JSON", "The answer evaluation service returned invalid data. Please try again.", 502],
      [AnswerEvaluationInvalidOutputError, "AI_INVALID_OUTPUT", "The answer evaluation could not be validated reliably. Please try again.", 502],
    ];
    for (const [ErrorType, code, message, status] of mappings) if (error instanceof ErrorType) { safeLog(code, status); return failure(code, message, status); }
    safeLog("INTERNAL_ERROR", 500); return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
