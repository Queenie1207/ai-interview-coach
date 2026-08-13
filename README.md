# AI Interview Coach

AI Interview Coach is an interview-prep prototype for resume and job-description matching. Users can choose a resume PDF, paste a job description, parse the resume text on the Next.js server, and review mock interview focus areas.

## Phase-one features

- Responsive home page at `/`
- PDF selection by click or drag and drop
- PDF type and 10 MB size validation
- Job Description validation with a 50-character minimum
- Loading state while validation and analysis work is in progress
- Mock analysis result with match score, strengths, potential gaps, and likely interview focus

## Phase 2A features

- `POST /api/resume/parse` accepts a `resume` field via `multipart/form-data`
- Server-side PDF validation for required file, type, and 10 MB size limit
- Resume PDF text extraction with `pdf-parse`
- Parsed resume text preview on the home page
- Uploaded PDFs are processed in memory only and are not permanently stored
- Scanned image-only PDFs are not supported because OCR is not included
- No LLM, AI API, database, login, RAG, MCP, or Tool Calling is used in Phase 2A

## PDF package

Phase 2A uses `pdf-parse` for server-side PDF text extraction. It is a maintained TypeScript package built on `pdfjs-dist`, works in Node.js, and does not require sending resume files to an external service.

## Phase 2B

Phase 2B sends Phase 2A's extracted text to `POST /api/resume/structure`. On the server, fixed extraction instructions are a system message and the resume text is a separate user message. Groq Chat Completions produces strict JSON Schema output, then Zod runtime-validates it as `ResumeData`.

The schema includes profile, skills, languages, experience, education, projects, activities, certifications, and additional sections. The prompt prohibits invented facts, wholesale translation, scoring, JD matching, and interview questions. Groq is server-only; resume text is neither logged nor persisted. JD matching, Agents, RAG, databases, OCR, and automatic retry remain out of scope. Free API plans have provider rate and token limits.

Copy `.env.example` to `.env.local` and supply your own server-side key:

```text
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
```

The API accepts `application/json` containing `{ "extractedText": "..." }`. Success is `{ "success": true, "data": { ... } }`; failure is `{ "success": false, "error": { "code": "...", "message": "..." } }`. Validation failures use 400/413/415/422, missing configuration uses 503, and safe upstream or invalid-output failures use 502.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Production build

```bash
npm run build
```

## Test and local Phase 2B check

```bash
npm test
npm run dev
```

With `.env.local` configured, upload a non-sensitive text PDF, enter at least 50 JD characters, and submit. The PDF remains in memory; structured cards appear after both APIs succeed. The JD is not sent to Groq.
