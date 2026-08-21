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
- `InterviewPracticePanel` composes the selected-question view, answer form, and mock result.
- `PracticeAnswerForm` owns accessible answer input and validation presentation.
- `AnswerEvaluationPanel` renders the validated answer score, dimension feedback, optional STAR feedback, and follow-up signal.

## Phase 3B data flow and API

Validated `ResumeData` + Job Description + `InterviewAnalysis` + output language -> `POST /api/interview/prepare` -> one Gemini strict JSON Schema call -> `InterviewPreparationSchema.safeParse` -> preparation UI. PDF and extracted text are never sent to Phase 3B.

Additional-question flow: validated `ResumeData` + Job Description + `InterviewAnalysis` + output language + prior question/follow-up text + count -> `POST /api/interview/prepare/more`. The server reduces the analysis to summary, strengths/evidence, gaps/status/evidence, and interview-focus requirements/evidence before one Gemini call. Provider-only `starOutlineParts` is normalized to the public nullable `starOutline`, Zod validates the result, and deterministic text filtering removes direct or clearly overlapping duplicates before the browser appends up to the 20-question limit. Existing question details and review topics are neither sent as exclusion context nor regenerated.

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

Phase 4A-2 posts only the selected question fields, current answer, and output language to `POST /api/interview/practice/evaluate`. The route strictly rejects unknown fields, calls Gemini once without retry, requests JSON Schema structured output, and validates it with `InterviewAnswerEvaluationSchema`. The request never includes the PDF, extracted text, complete resume, complete Job Description, analysis, review topics, or other questions. Leaving or changing the practice question aborts the active browser request and a generation guard ignores stale responses. Follow-up output is display-only and does not start an agent loop.

Practice answers, evaluations, and the last evaluated answer snapshot are kept per question in page memory. Editing a submitted answer never sends a request; while it differs from its snapshot, the prior evaluation is hidden and the UI asks for another explicit submission. The evaluation prompt treats the current answer as the controlling source for `improvedAnswer`, uses resume evidence only for consistency or suggestions, uses JD evidence only for relevance, and applies motivation, behavioral/experience, technical-knowledge, and technical-debugging evidence standards without universally requiring metrics or STAR.

Phase 4B-1 adds a separate explicit follow-up flow. The browser calls `POST /api/interview/practice/follow-up/evaluate` only after the user opens and submits the one follow-up form. The allowlisted payload contains one question's context, original answer, follow-up question and answer, and output language; it excludes the full resume, Job Description, analysis, preparation, other questions, and other answers. A separate abortable controller and generation guard prevent duplicate and stale writes. Each in-memory question session retains its follow-up draft, error, open state, and final evaluation. Editing the original answer invalidates the follow-up and final result. The final Zod and provider schemas force the flow to end without another follow-up.

Phase 4B-2 extends that endpoint and per-question state into a bounded state machine. `followUpHistory` contains consecutive completed turns and the server derives the round count rather than accepting a client maximum. One explicit answer or finish action produces one request and at most one Gemini call. A discriminated continue/complete schema controls the result; server guards force completion after the third answer, on user finish, or when normalized question text duplicates history. Abort, request-id, and generation guards prevent stale writes, while editing the original answer truncates all dependent follow-up state.

## Deferred work

Future phases may add JD matching, interview analysis, OCR, RAG, and Tool Calling. None are implemented in Phase 2B.
