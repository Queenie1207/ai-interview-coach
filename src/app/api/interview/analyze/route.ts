import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import {
  AnalysisAuthenticationError, AnalysisEmptyOutputError, AnalysisInvalidJsonError,
  AnalysisInvalidOutputError, AnalysisRateLimitedError, AnalysisUpstreamError, analyzeInterview,
} from "@/lib/ai/analyzeInterview";
import { ResumeSchema } from "@/lib/schemas/resumeSchema";
import type { AnalysisErrorCode, InterviewAnalysisResponse } from "@/types/analysis";
import { isSupportedLocale } from "@/lib/i18n/locales";

export const runtime = "nodejs";
const MIN_JD_LENGTH = 50;

function failure(code: AnalysisErrorCode, message: string, status: number) {
  return NextResponse.json<InterviewAnalysisResponse>({ success: false, error: { code, message } }, { status });
}
function safeLog(code: AnalysisErrorCode, stage: string, status: number) {
  console.error("[interview-analysis] failure", { code, provider: "gemini", stage, status });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  if (typeof body !== "object" || body === null) return failure("INVALID_REQUEST", "Request body must be an object.", 400);
  const value = body as Record<string, unknown>;
  if (!("resume" in value)) return failure("INVALID_RESUME", "resume is required.", 400);
  const parsedResume = ResumeSchema.safeParse(value.resume);
  if (!parsedResume.success) return failure("INVALID_RESUME", "resume must be valid structured resume data.", 422);
  if (typeof value.jobDescription !== "string" || !value.jobDescription.trim()) return failure("INVALID_JOB_DESCRIPTION", "Job Description is required.", 400);
  const jobDescription = value.jobDescription.trim();
  if (jobDescription.length < MIN_JD_LENGTH) return failure("INVALID_JOB_DESCRIPTION", `Job Description must be at least ${MIN_JD_LENGTH} characters.`, 422);
  if (value.companyName !== undefined && typeof value.companyName !== "string") return failure("INVALID_REQUEST", "companyName must be a string.", 400);
  if (value.positionName !== undefined && typeof value.positionName !== "string") return failure("INVALID_REQUEST", "positionName must be a string.", 400);
  if (!isSupportedLocale(value.outputLanguage)) return failure("INVALID_OUTPUT_LANGUAGE", "The requested output language is not supported.", 400);

  try {
    const data = await analyzeInterview({ resume: parsedResume.data, jobDescription, companyName: typeof value.companyName === "string" ? value.companyName.trim() : undefined, positionName: typeof value.positionName === "string" ? value.positionName.trim() : undefined, outputLanguage: value.outputLanguage });
    return NextResponse.json<InterviewAnalysisResponse>({ success: true, data });
  } catch (error) {
    const mappings: Array<[new (...args: never[]) => Error, AnalysisErrorCode, string, number]> = [
      [AiNotConfiguredError, "AI_NOT_CONFIGURED", "Interview analysis is not configured on the server.", 503],
      [AnalysisAuthenticationError, "AI_AUTHENTICATION_ERROR", "The interview analysis service could not authenticate.", 502],
      [AnalysisRateLimitedError, "AI_RATE_LIMITED", "The interview analysis service is busy. Please try again later.", 429],
      [AnalysisUpstreamError, "AI_UPSTREAM_ERROR", "The interview analysis service is temporarily unavailable. Please try again.", 502],
      [AnalysisEmptyOutputError, "AI_EMPTY_OUTPUT", "The interview analysis service returned no output. Please try again.", 502],
      [AnalysisInvalidJsonError, "AI_INVALID_JSON", "The interview analysis service returned invalid data. Please try again.", 502],
      [AnalysisInvalidOutputError, "AI_INVALID_OUTPUT", "The interview analysis could not be validated reliably. Please try again.", 502],
    ];
    for (const [ErrorType, code, message, status] of mappings) if (error instanceof ErrorType) { safeLog(code, code.toLowerCase(), status); return failure(code, message, status); }
    safeLog("INTERNAL_ERROR", "internal", 500);
    return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
