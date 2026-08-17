import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { AnalysisEmptyOutputError, AnalysisInvalidJsonError, AnalysisInvalidOutputError, AnalysisUpstreamError } from "@/lib/ai/analyzeInterview";
import { validAnalysis } from "@/test/analysisFixture";
import { validResume } from "@/test/resumeFixture";

vi.mock("@/lib/ai/analyzeInterview", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/ai/analyzeInterview")>()), analyzeInterview: vi.fn() }));
import { analyzeInterview } from "@/lib/ai/analyzeInterview";
import { POST } from "./route";

const mocked = vi.mocked(analyzeInterview);
const jd = "We require strong Swift skills, mobile architecture, and experience integrating reliable APIs.";
const req = (body: string, type = "application/json") => new Request("http://localhost/api/interview/analyze", { method: "POST", headers: { "Content-Type": type }, body });

describe("interview analyze route", () => {
  beforeEach(() => mocked.mockReset());
  it("rejects non JSON content", async () => expect((await POST(req("x", "text/plain"))).status).toBe(415));
  it("rejects malformed JSON", async () => expect((await POST(req("{"))).status).toBe(400));
  it("rejects missing resume", async () => expect((await POST(req(JSON.stringify({ jobDescription: jd })))).status).toBe(400));
  it("rejects invalid resume", async () => expect((await POST(req(JSON.stringify({ resume: {}, jobDescription: jd })))).status).toBe(422));
  it("rejects missing JD", async () => expect((await POST(req(JSON.stringify({ resume: validResume })))).status).toBe(400));
  it("rejects short JD", async () => expect((await POST(req(JSON.stringify({ resume: validResume, jobDescription: "short" })))).status).toBe(422));
  it("rejects missing output language", async () => { const response = await POST(req(JSON.stringify({ resume: validResume, jobDescription: jd }))); expect(response.status).toBe(400); expect((await response.json()).error.code).toBe("INVALID_OUTPUT_LANGUAGE"); });
  it("rejects unsupported output language", async () => { const response = await POST(req(JSON.stringify({ resume: validResume, jobDescription: jd, outputLanguage: "fr" }))); expect(response.status).toBe(400); expect((await response.json()).error.code).toBe("INVALID_OUTPUT_LANGUAGE"); });
  it.each(["zh-TW", "zh-CN", "en"] as const)("passes %s to analysis", async (outputLanguage) => { mocked.mockResolvedValueOnce(validAnalysis); const response = await POST(req(JSON.stringify({ resume: validResume, jobDescription: jd, outputLanguage }))); expect(response.status).toBe(200); expect(mocked).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage })); });
  it.each([[new AiNotConfiguredError(), "AI_NOT_CONFIGURED", 503], [new AnalysisEmptyOutputError(), "AI_EMPTY_OUTPUT", 502], [new AnalysisInvalidJsonError(), "AI_INVALID_JSON", 502], [new AnalysisInvalidOutputError(), "AI_INVALID_OUTPUT", 502], [new AnalysisUpstreamError("secret prompt and API key"), "AI_UPSTREAM_ERROR", 502]] as const)("maps safe failure %s", async (error, code, status) => { mocked.mockRejectedValueOnce(error); const response = await POST(req(JSON.stringify({ resume: validResume, jobDescription: jd, outputLanguage: "en" }))); expect(response.status).toBe(status); const body = await response.json(); expect(body.error.code).toBe(code); expect(JSON.stringify(body)).not.toContain("secret prompt"); });
  it("returns success/data", async () => { mocked.mockResolvedValueOnce(validAnalysis); const response = await POST(req(JSON.stringify({ resume: validResume, jobDescription: jd, outputLanguage: "en" }))); expect(response.status).toBe(200); expect(await response.json()).toEqual({ success: true, data: validAnalysis }); });
});
