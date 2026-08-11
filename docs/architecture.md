# Architecture

## Phase-one scope

This phase provides a responsive home page where a user selects a resume PDF, enters a job description, and views a simulated interview analysis. It is entirely client-side.

## Home page

The page contains a header, resume uploader, job-description form, analysis action, loading state, and mock-result section.

## Component responsibilities

- `Header` presents the product identity.
- `ResumeUploader` handles PDF selection, drag-and-drop UI, and file display.
- `JobDescriptionForm` presents the company, position, and job-description inputs.
- `AnalyzeButton` renders the primary form action.
- `LoadingAnalysis` presents in-progress feedback.
- `AnalysisResultPanel` renders the analysis cards.

## State flow

The client page owns the selected `File`, input values, field errors, result, and `idle` / `loading` / `success` analysis status with React `useState`. Submission validates the form. Valid data clears the old result, enters `loading`, waits 1.5 seconds with `Promise` and `setTimeout`, then sets the mock result and enters `success`. Inputs are disabled while loading.

## Mock-data flow

Analysis types live in `src/types`; the fixed phase-one analysis result lives in `src/data`. UI components receive typed data via props and do not embed mock analysis content.

## Deferred work

Future phases may add PDF parsing, an LLM, RAG, and Tool Calling. None are implemented in phase one.
