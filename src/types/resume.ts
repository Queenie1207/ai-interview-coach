import type { ResumeData } from "@/lib/schemas/resumeSchema";

export type ResumeStructureErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "INVALID_REQUEST"
  | "EMPTY_RESUME_TEXT"
  | "RESUME_TEXT_TOO_LARGE"
  | "AI_NOT_CONFIGURED"
  | "AI_UPSTREAM_ERROR"
  | "AI_INVALID_OUTPUT"
  | "INTERNAL_ERROR";

export type ResumeStructureResponse =
  | { success: true; data: ResumeData }
  | { success: false; error: { code: ResumeStructureErrorCode; message: string } };

export type { ResumeData };
