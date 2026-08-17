# Architecture

## Phase-one scope

This phase provides a responsive home page where a user selects a resume PDF, enters a job description, and views a simulated interview analysis. It is entirely client-side.

## Phase 2A scope

Phase 2A adds real PDF upload and text extraction. The selected PDF is sent to a Next.js Route Handler, parsed in memory, and returned as plain text JSON for display in the browser. The app still does not use an LLM, AI API, database, login, RAG, MCP, Tool Calling, or OCR.

## Phase 2B scope

Phase 2B converts extracted text to typed resume data. The browser calls the existing parser, then posts only its returned text to `POST /api/resume/structure`. Gemini is called only by the server through its OpenAI-compatible API. A fixed prompt controls extraction, strict JSON Schema constrains Chat Completions output, and Zod independently validates it. `ResumeData` is inferred from `ResumeSchema`.

## Phase 3A scope

Phase 3A adds evidence-based matching through `POST /api/interview/analyze`. It accepts only validated `ResumeData`, a Job Description of at least 50 trimmed characters, and optional company and position names. Gemini strict structured output is independently checked with `InterviewAnalysisSchema`. No PDF text is sent to this endpoint.

## Home page

The page uses four in-memory steps on one App Router URL and renders only the active step. Sensitive workflow data is not persisted.

## Component responsibilities

- `Header` presents the product identity.
- `ResumeUploader` handles PDF selection, drag-and-drop UI, and file display.
- `JobDescriptionForm` presents the company, position, and job-description inputs.
- `AnalyzeButton` renders the primary form action.
- `LoadingAnalysis` presents in-progress feedback.
- `ResumeParseResult` displays the parsed resume metadata and collapsible text preview.
- `StructuredResumeResult` displays non-empty structured sections as responsive cards.
- `AnalysisResultPanel` renders the real analysis, including evidence.
- `StepNavigation` exposes accessible active, completed, and disabled states.
- `InterviewPreparationPanel` renders preparation actions, questions, and review topics.
- `InterviewQuestionCard` provides the native-button accordion interaction.

## Phase 3B data flow and API

Validated `ResumeData` + Job Description + `InterviewAnalysis` + output language -> `POST /api/interview/prepare` -> one Gemini strict JSON Schema call -> `InterviewPreparationSchema.safeParse` -> preparation UI. PDF and extracted text are never sent to Phase 3B.

## State flow

The client page owns form and result state. On the first submission for a PDF it calls parse, structure, then analyze. Inputs and file actions stay disabled throughout. After structuring succeeds, analysis failures preserve `ResumeData`; retrying or changing only job inputs calls only analyze. Replacing or removing the PDF clears parsed text, structured data, and analysis.

## Phase 3A data flow and API

Browser -> validated `ResumeData` + Job Description -> `POST /api/interview/analyze` -> Gemini strict JSON Schema -> Zod `InterviewAnalysisSchema` -> evidence-based result.

## Phase 2B data flow and API

Browser -> `POST /api/resume/parse` -> extracted text -> `POST /api/resume/structure` -> Gemini Chat Completions strict JSON Schema -> Zod `ResumeSchema` -> `ResumeData` -> cards.

The structure route requires `application/json` with a non-empty string `extractedText`, limited to 100,000 characters. It returns the shared success/data or success/error envelope. AI failure codes are `AI_NOT_CONFIGURED`, `AI_AUTHENTICATION_ERROR`, `AI_RATE_LIMITED`, `AI_UPSTREAM_ERROR`, `AI_EMPTY_OUTPUT`, `AI_INVALID_JSON`, and `AI_INVALID_OUTPUT`; request validation and unexpected internal errors keep their existing codes.

`GEMINI_API_KEY` and centrally read `GEMINI_MODEL` are server variables; the model defaults to `gemini-3.1-flash-lite`. The resume is a user message separate from the system prompt and is never logged or persisted. Rate and token limits are provider-dependent.

## Phase 2A data flow

Browser -> `POST /api/resume/parse` Route Handler -> server-side resume validation -> PDF parser -> cleaned plain text -> JSON response -> browser preview.

The route accepts `multipart/form-data` with a `resume` file field. The PDF is read into memory, parsed, and discarded. It is never written to disk or permanently stored.

## API response format

Success:

```json
{
  "success": true,
  "data": {
    "text": "...",
    "characterCount": 2846,
    "fileName": "resume.pdf"
  }
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF files are supported."
  }
}
```

Supported error codes are `FILE_REQUIRED`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `EMPTY_PDF_TEXT`, and `PDF_PARSE_FAILED`.

## Mock-data flow

Analysis types live in `src/types`; the fixed phase-one analysis result lives in `src/data`. UI components receive typed data via props and do not embed mock analysis content. Phase 2A displays the parsed resume text separately and does not send it to an LLM.

## Deferred work

Future phases may add JD matching, interview analysis, OCR, RAG, and Tool Calling. None are implemented in Phase 2B.
