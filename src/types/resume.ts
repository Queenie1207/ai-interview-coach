import type { ResumeData } from "@/lib/schemas/resumeSchema";

export type ResumeStructureErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "INVALID_REQUEST"
  | "EMPTY_RESUME_TEXT"
  | "RESUME_TEXT_TOO_LARGE"
  | "AI_NOT_CONFIGURED"
  | "AI_AUTHENTICATION_ERROR"
  | "AI_RATE_LIMITED"
  | "AI_UPSTREAM_ERROR"
  | "AI_EMPTY_OUTPUT"
  | "AI_INVALID_JSON"
  | "AI_INVALID_OUTPUT"
  | "INTERNAL_ERROR";

export type ResumeStructureResponse =
  | { success: true; data: ResumeData }
  | { success: false; error: { code: ResumeStructureErrorCode; message: string } };

export type { ResumeData };
