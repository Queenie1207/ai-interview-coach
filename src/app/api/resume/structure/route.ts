import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "@/lib/ai/groqClient";
import { AiInvalidOutputError, AiUpstreamError, structureResume } from "@/lib/ai/structureResume";
import type { ResumeStructureErrorCode, ResumeStructureResponse } from "@/types/resume";
import { MAX_RESUME_TEXT_LENGTH } from "@/lib/resume/resumeStructureValidation";

export const runtime = "nodejs";
function failure(code: ResumeStructureErrorCode, message: string, status: number) {
  return NextResponse.json<ResumeStructureResponse>({ success: false, error: { code, message } }, { status });
}

function safeLog(code: ResumeStructureErrorCode, stage: string, status: number) {
  console.error("[resume-structure] failure", { code, stage, status, model: process.env.GROQ_MODEL?.trim() || "not-configured" });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return failure("INVALID_CONTENT_TYPE", "Content-Type must be application/json.", 415);
  }
  let body: unknown;
  try { body = await request.json(); } catch { return failure("INVALID_REQUEST", "Request body must be valid JSON.", 400); }
  if (typeof body !== "object" || body === null || !("extractedText" in body)) return failure("INVALID_REQUEST", "extractedText is required.", 400);
  const extractedText = (body as { extractedText?: unknown }).extractedText;
  if (typeof extractedText !== "string") return failure("INVALID_REQUEST", "extractedText must be a string.", 400);
  const trimmedText = extractedText.trim();
  if (!trimmedText) return failure("EMPTY_RESUME_TEXT", "Resume text cannot be empty.", 422);
  if (trimmedText.length > MAX_RESUME_TEXT_LENGTH) return failure("RESUME_TEXT_TOO_LARGE", `Resume text must not exceed ${MAX_RESUME_TEXT_LENGTH.toLocaleString()} characters.`, 413);

  try {
    const data = await structureResume(trimmedText);
    return NextResponse.json<ResumeStructureResponse>({ success: true, data });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) { safeLog("AI_NOT_CONFIGURED", "configuration", 503); return failure("AI_NOT_CONFIGURED", "Resume structuring is not configured on the server.", 503); }
    if (error instanceof AiUpstreamError) { safeLog("AI_UPSTREAM_ERROR", "upstream", 502); return failure("AI_UPSTREAM_ERROR", "The resume structuring service is temporarily unavailable. Please try again.", 502); }
    if (error instanceof AiInvalidOutputError) { safeLog("AI_INVALID_OUTPUT", "validation", 502); return failure("AI_INVALID_OUTPUT", "The resume could not be structured reliably. Please try again.", 502); }
    safeLog("INTERNAL_ERROR", "internal", 500);
    return failure("INTERNAL_ERROR", "An unexpected error occurred. Please try again.", 500);
  }
}
