# Architecture

## Phase-one scope

This phase provides a responsive home page where a user selects a resume PDF, enters a job description, and views a simulated interview analysis. It is entirely client-side.

## Phase 2A scope

Phase 2A adds real PDF upload and text extraction. The selected PDF is sent to a Next.js Route Handler, parsed in memory, and returned as plain text JSON for display in the browser. The app still does not use an LLM, AI API, database, login, RAG, MCP, Tool Calling, or OCR.

## Home page

The page contains a header, resume uploader, job-description form, analysis action, loading state, and mock-result section.

## Component responsibilities

- `Header` presents the product identity.
- `ResumeUploader` handles PDF selection, drag-and-drop UI, and file display.
- `JobDescriptionForm` presents the company, position, and job-description inputs.
- `AnalyzeButton` renders the primary form action.
- `LoadingAnalysis` presents in-progress feedback.
- `ResumeParseResult` displays the parsed resume metadata and collapsible text preview.
- `AnalysisResultPanel` renders the analysis cards.

## State flow

The client page owns the selected `File`, input values, field errors, parsed resume result, parse error, mock analysis result, and `idle` / `loading` / `success` analysis status with React `useState`. Submission validates the form. Valid data clears old parse and mock results, enters `loading`, sends the PDF to the parser route, then displays the parsed resume text and fixed mock analysis result on success. Inputs are disabled while loading.

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

Future phases may add OCR, an LLM, RAG, and Tool Calling. None are implemented in Phase 2A.
