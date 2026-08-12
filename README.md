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
