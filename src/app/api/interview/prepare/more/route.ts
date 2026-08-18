import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { prepareMoreInterviewQuestions } from "@/lib/ai/prepareMoreInterviewQuestions";
import { PreparationAuthenticationError, PreparationEmptyOutputError, PreparationInvalidJsonError, PreparationInvalidOutputError, PreparationRateLimitedError, PreparationTruncatedOutputError, PreparationUpstreamError } from "@/lib/ai/prepareInterview";
import { InterviewMoreQuestionsRequestSchema } from "@/lib/schemas/interviewMoreQuestionsRequestSchema";
import type { MoreInterviewQuestionsResponse, PreparationErrorCode } from "@/types/preparation";

export const runtime = "nodejs";
function failure(code: PreparationErrorCode, message: string, status: number) { return NextResponse.json<MoreInterviewQuestionsResponse>({ success: false, error: { code, message } }, { status }); }
function safeLog(code: PreparationErrorCode, status: number, stage: string) { console.error("[interview-more-questions] failure", { code, provider: "gemini", model: "configured", status, stage }); }

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  const parsed = InterviewMoreQuestionsRequestSchema.safeParse(body);
  if (!parsed.success) return failure("INVALID_REQUEST", "Request body contains unsupported or invalid fields.", 422);
  if (parsed.data.excludedQuestions.length >= 20) return failure("INVALID_REQUEST", "The question limit has already been reached.", 422);
  try {
    const data = await prepareMoreInterviewQuestions(parsed.data);
    return NextResponse.json<MoreInterviewQuestionsResponse>({ success: true, data });
  } catch (error) {
    const mappings: Array<[new (...args: never[]) => Error, PreparationErrorCode, string, number]> = [
      [AiNotConfiguredError, "AI_NOT_CONFIGURED", "Interview preparation is not configured on the server.", 503],
      [PreparationAuthenticationError, "AI_AUTHENTICATION_ERROR", "The interview preparation service could not authenticate.", 502],
      [PreparationRateLimitedError, "AI_RATE_LIMITED", "The interview preparation service is busy. Please try again later.", 429],
      [PreparationUpstreamError, "AI_UPSTREAM_ERROR", "The interview preparation service is temporarily unavailable. Please try again.", 502],
      [PreparationEmptyOutputError, "AI_EMPTY_OUTPUT", "The interview preparation service returned no output. Please try again.", 502],
      [PreparationInvalidJsonError, "AI_INVALID_JSON", "The interview preparation service returned invalid data. Please try again.", 502],
      [PreparationTruncatedOutputError, "AI_OUTPUT_TRUNCATED", "The interview preparation output was incomplete. Please try again.", 502],
      [PreparationInvalidOutputError, "AI_INVALID_OUTPUT", "The interview preparation could not be validated reliably. Please try again.", 502],
    ];
    for (const [ErrorType, code, message, status] of mappings) if (error instanceof ErrorType) { safeLog(code, status, "generation"); return failure(code, message, status); }
    safeLog("INTERNAL_ERROR", 500, "unexpected"); return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
