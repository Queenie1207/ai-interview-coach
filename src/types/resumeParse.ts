export type ResumeParseErrorCode =
  | "FILE_REQUIRED"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_PDF_TEXT"
  | "PDF_PARSE_FAILED";

export type ParsedResume = {
  text: string;
  characterCount: number;
  fileName: string;
};

export type ResumeParseSuccessResponse = {
  success: true;
  data: ParsedResume;
};

export type ResumeParseErrorResponse = {
  success: false;
  error: {
    code: ResumeParseErrorCode;
    message: string;
  };
};

export type ResumeParseResponse = ResumeParseSuccessResponse | ResumeParseErrorResponse;
