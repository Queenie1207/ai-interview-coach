# Architecture

## Phase-one scope

This phase provides a responsive home page where a user selects a resume PDF, enters a job description, and views a simulated interview analysis. It is entirely client-side.

## Phase 2A scope

Phase 2A adds real PDF upload and text extraction. The selected PDF is sent to a Next.js Route Handler, parsed in memory, and returned as plain text JSON for display in the browser. The app still does not use an LLM, AI API, database, login, RAG, MCP, Tool Calling, or OCR.

## Phase 2B scope

Phase 2B converts extracted text to typed resume data. The browser calls the existing parser, then posts only its returned text to `POST /api/resume/structure`. Groq is called only by the server. A fixed prompt controls extraction, strict JSON Schema constrains Chat Completions output, and Zod independently validates it. `ResumeData` is inferred from `ResumeSchema`.

## Home page

The page contains a header, resume uploader, job-description form, analysis action, loading state, and mock-result section.

## Component responsibilities

- `Header` presents the product identity.
- `ResumeUploader` handles PDF selection, drag-and-drop UI, and file display.
- `JobDescriptionForm` presents the company, position, and job-description inputs.
- `AnalyzeButton` renders the primary form action.
- `LoadingAnalysis` presents in-progress feedback.
- `ResumeParseResult` displays the parsed resume metadata and collapsible text preview.
- `StructuredResumeResult` displays non-empty structured sections as responsive cards.
- `AnalysisResultPanel` renders the analysis cards.

## State flow

The client page owns form and result state. Valid submission clears old results, calls the parser, and only on success calls the structure route. Inputs stay disabled through both requests. Parse failure stops Phase 2B; structure failure clears old structured data and allows retry. The Phase 1 analysis is visibly labeled fixed mock data.

## Phase 2B data flow and API

Browser -> `POST /api/resume/parse` -> extracted text -> `POST /api/resume/structure` -> Groq Chat Completions strict JSON Schema -> Zod `ResumeSchema` -> `ResumeData` -> cards.

The structure route requires `application/json` with a non-empty string `extractedText`, limited to 100,000 characters. It returns the shared success/data or success/error envelope. Codes are `INVALID_CONTENT_TYPE`, `INVALID_REQUEST`, `EMPTY_RESUME_TEXT`, `RESUME_TEXT_TOO_LARGE`, `AI_NOT_CONFIGURED`, `AI_UPSTREAM_ERROR`, `AI_INVALID_OUTPUT`, and `INTERNAL_ERROR`.

`GROQ_API_KEY` and centrally read `GROQ_MODEL` are server variables. The resume is a user message separate from the system prompt and is never logged or persisted. Rate and token limits are provider-dependent.

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
