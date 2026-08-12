import { NextResponse } from "next/server";
import type {
  ParsedResume,
  ResumeParseErrorCode,
  ResumeParseErrorResponse,
  ResumeParseSuccessResponse,
} from "@/types/resumeParse";

export function resumeParseSuccess(data: ParsedResume): NextResponse<ResumeParseSuccessResponse> {
  return NextResponse.json({
    success: true,
    data,
  });
}

export function resumeParseError(
  code: ResumeParseErrorCode,
  message: string,
  status: number,
): NextResponse<ResumeParseErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
