import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { PreparationEmptyOutputError, PreparationInvalidJsonError, PreparationInvalidOutputError, PreparationTruncatedOutputError, PreparationUpstreamError } from "@/lib/ai/prepareInterview";
import { validAnalysis } from "@/test/analysisFixture";
import { validPreparation } from "@/test/preparationFixture";
import { validResume } from "@/test/resumeFixture";

vi.mock("@/lib/ai/prepareInterview", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/ai/prepareInterview")>()), prepareInterview: vi.fn() }));
import { prepareInterview } from "@/lib/ai/prepareInterview";
import { POST } from "./route";

const mocked = vi.mocked(prepareInterview);
const jd = "We require strong Swift skills, mobile architecture, and experience integrating reliable APIs.";
const validBody = { resume: validResume, jobDescription: jd, analysis: validAnalysis, outputLanguage: "en" };
const req = (body: string, type = "application/json") => new Request("http://localhost/api/interview/prepare", { method: "POST", headers: { "Content-Type": type }, body });

describe("interview prepare route", () => {
  beforeEach(() => mocked.mockReset());
  it("rejects non JSON content", async () => expect((await POST(req("x", "text/plain"))).status).toBe(415));
  it("rejects malformed JSON", async () => expect((await POST(req("{"))).status).toBe(400));
  it("rejects missing resume", async () => expect((await POST(req(JSON.stringify({ ...validBody, resume: undefined })))).status).toBe(400));
  it("rejects invalid resume", async () => expect((await POST(req(JSON.stringify({ ...validBody, resume: {} })))).status).toBe(422));
  it("rejects missing JD", async () => expect((await POST(req(JSON.stringify({ ...validBody, jobDescription: undefined })))).status).toBe(400));
  it("rejects short JD", async () => expect((await POST(req(JSON.stringify({ ...validBody, jobDescription: "short" })))).status).toBe(422));
  it("rejects missing analysis", async () => expect((await POST(req(JSON.stringify({ ...validBody, analysis: undefined })))).status).toBe(400));
  it("rejects invalid analysis", async () => expect((await POST(req(JSON.stringify({ ...validBody, analysis: {} })))).status).toBe(422));
  it("rejects missing output language", async () => expect((await POST(req(JSON.stringify({ ...validBody, outputLanguage: undefined })))).status).toBe(400));
  it("rejects unsupported output language", async () => expect((await POST(req(JSON.stringify({ ...validBody, outputLanguage: "fr" })))).status).toBe(400));
  it.each(["extractedText", "pdf", "file", "resumeFile", "unknownField"])("rejects forbidden or unknown %s", async (field) => { const response = await POST(req(JSON.stringify({ ...validBody, [field]: "private content" }))); expect(response.status).toBe(422); const body = await response.json(); expect(body.error.code).toBe("INVALID_REQUEST"); expect(JSON.stringify(body)).not.toContain("private content"); expect(mocked).not.toHaveBeenCalled(); });
  it.each([[new AiNotConfiguredError(), "AI_NOT_CONFIGURED", 503], [new PreparationEmptyOutputError(), "AI_EMPTY_OUTPUT", 502], [new PreparationInvalidJsonError(), "AI_INVALID_JSON", 502], [new PreparationTruncatedOutputError(), "AI_OUTPUT_TRUNCATED", 502], [new PreparationInvalidOutputError(), "AI_INVALID_OUTPUT", 502], [new PreparationUpstreamError("secret resume JD prompt key output"), "AI_UPSTREAM_ERROR", 502]] as const)("maps safe failure %#", async (error, code, status) => { mocked.mockRejectedValueOnce(error); const response = await POST(req(JSON.stringify(validBody))); expect(response.status).toBe(status); const body = await response.json(); expect(body.error.code).toBe(code); expect(JSON.stringify(body)).not.toContain("secret resume"); });
  it("returns success/data and calls helper once", async () => { mocked.mockResolvedValueOnce(validPreparation); const response = await POST(req(JSON.stringify(validBody))); expect(response.status).toBe(200); expect(await response.json()).toEqual({ success: true, data: validPreparation }); expect(mocked).toHaveBeenCalledTimes(1); });
});
