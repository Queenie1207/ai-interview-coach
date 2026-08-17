import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { PreparationAuthenticationError, PreparationEmptyOutputError, PreparationInvalidJsonError, PreparationInvalidOutputError, PreparationRateLimitedError, PreparationTruncatedOutputError, PreparationUpstreamError, prepareInterview } from "@/lib/ai/prepareInterview";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { InterviewAnalysisSchema } from "@/lib/schemas/interviewAnalysisSchema";
import { ResumeSchema } from "@/lib/schemas/resumeSchema";
import { InterviewPreparationRequestSchema } from "@/lib/schemas/interviewPreparationRequestSchema";
import type { InterviewPreparationResponse, PreparationErrorCode } from "@/types/preparation";

export const runtime = "nodejs";
function failure(code: PreparationErrorCode, message: string, status: number) { return NextResponse.json<InterviewPreparationResponse>({ success: false, error: { code, message } }, { status }); }
function safeLog(code: PreparationErrorCode, status: number) { console.error("[interview-preparation] failure", { code, provider: "gemini", status }); }

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  if (typeof body !== "object" || body === null) return failure("INVALID_REQUEST", "Request body must be an object.", 400);
  const value = body as Record<string, unknown>;
  if (!("resume" in value)) return failure("INVALID_RESUME", "resume is required.", 400);
  const resume = ResumeSchema.safeParse(value.resume);
  if (!resume.success) return failure("INVALID_RESUME", "resume must be valid structured resume data.", 422);
  if (typeof value.jobDescription !== "string" || !value.jobDescription.trim()) return failure("INVALID_JOB_DESCRIPTION", "Job Description is required.", 400);
  const jobDescription = value.jobDescription.trim();
  if (jobDescription.length < 50) return failure("INVALID_JOB_DESCRIPTION", "Job Description must be at least 50 characters.", 422);
  if (!("analysis" in value)) return failure("INVALID_ANALYSIS", "analysis is required.", 400);
  const analysis = InterviewAnalysisSchema.safeParse(value.analysis);
  if (!analysis.success) return failure("INVALID_ANALYSIS", "analysis must be valid interview analysis data.", 422);
  if (value.companyName !== undefined && typeof value.companyName !== "string") return failure("INVALID_REQUEST", "companyName must be a string.", 400);
  if (value.positionName !== undefined && typeof value.positionName !== "string") return failure("INVALID_REQUEST", "positionName must be a string.", 400);
  if (!isSupportedLocale(value.outputLanguage)) return failure("INVALID_OUTPUT_LANGUAGE", "The requested output language is not supported.", 400);
  const parsedRequest = InterviewPreparationRequestSchema.safeParse(value);
  if (!parsedRequest.success) return failure("INVALID_REQUEST", "Request body contains unsupported or invalid fields.", 422);
  try {
    const data = await prepareInterview({ resume: parsedRequest.data.resume, jobDescription: parsedRequest.data.jobDescription, analysis: parsedRequest.data.analysis, companyName: parsedRequest.data.companyName?.trim(), positionName: parsedRequest.data.positionName?.trim(), outputLanguage: parsedRequest.data.outputLanguage });
    return NextResponse.json<InterviewPreparationResponse>({ success: true, data });
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
    for (const [ErrorType, code, message, status] of mappings) if (error instanceof ErrorType) { safeLog(code, status); return failure(code, message, status); }
    safeLog("INTERNAL_ERROR", 500); return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
