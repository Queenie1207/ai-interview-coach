import { EmptyPdfTextError, extractResumeTextFromPdf } from "@/lib/resume/pdfParser";
import { resumeParseError, resumeParseSuccess } from "@/lib/resume/resumeResponse";
import { validateResumeUpload } from "@/lib/resume/resumeValidation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return resumeParseError("FILE_REQUIRED", "Resume PDF is required.", 400);
  }

  const validation = validateResumeUpload(formData.get("resume"));

  if (!validation.success) {
    return resumeParseError(validation.code, validation.message, validation.status);
  }

  try {
    const bytes = Buffer.from(await validation.file.arrayBuffer());
    const text = await extractResumeTextFromPdf(bytes);

    return resumeParseSuccess({
      text,
      characterCount: text.length,
      fileName: validation.file.name,
    });
  } catch (error) {
    if (error instanceof EmptyPdfTextError) {
      return resumeParseError("EMPTY_PDF_TEXT", error.message, 422);
    }

    return resumeParseError("PDF_PARSE_FAILED", "We could not read this PDF. Please try another file.", 422);
  }
}
