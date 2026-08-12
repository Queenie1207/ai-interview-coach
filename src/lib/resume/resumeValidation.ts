import type { ResumeParseErrorCode } from "@/types/resumeParse";
import { MAX_RESUME_FILE_SIZE, isPdfFile } from "@/utils/fileValidation";

type ResumeValidationFailure = {
  success: false;
  status: number;
  code: ResumeParseErrorCode;
  message: string;
};

type ResumeValidationSuccess = {
  success: true;
  file: File;
};

export type ResumeValidationResult = ResumeValidationSuccess | ResumeValidationFailure;

export function validateResumeUpload(value: FormDataEntryValue | null): ResumeValidationResult {
  if (!(value instanceof File) || value.size === 0) {
    return {
      success: false,
      status: 400,
      code: "FILE_REQUIRED",
      message: "Resume PDF is required.",
    };
  }

  if (!isPdfFile(value)) {
    return {
      success: false,
      status: 415,
      code: "INVALID_FILE_TYPE",
      message: "Only PDF files are supported.",
    };
  }

  if (value.size > MAX_RESUME_FILE_SIZE) {
    return {
      success: false,
      status: 413,
      code: "FILE_TOO_LARGE",
      message: "Resume PDF must be 10 MB or smaller.",
    };
  }

  return {
    success: true,
    file: value,
  };
}
