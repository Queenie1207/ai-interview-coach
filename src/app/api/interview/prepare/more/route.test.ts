import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError } from "@/lib/ai/geminiClient";
import { PreparationEmptyOutputError, PreparationInvalidJsonError, PreparationInvalidOutputError, PreparationTruncatedOutputError, PreparationUpstreamError } from "@/lib/ai/prepareInterview";
import { validAnalysis } from "@/test/analysisFixture";
import { validPreparation } from "@/test/preparationFixture";
import { validResume } from "@/test/resumeFixture";

vi.mock("@/lib/ai/prepareMoreInterviewQuestions", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/ai/prepareMoreInterviewQuestions")>()), prepareMoreInterviewQuestions: vi.fn() }));
import { prepareMoreInterviewQuestions } from "@/lib/ai/prepareMoreInterviewQuestions";
import { POST } from "./route";

const mocked = vi.mocked(prepareMoreInterviewQuestions);
const validBody = { resume: validResume, jobDescription: "We require strong Swift skills, mobile architecture, and experience integrating reliable APIs.", analysis: validAnalysis, outputLanguage: "en", excludedQuestions: [{ question: "Existing question", followUps: ["Existing follow-up"] }], count: 5 };
const request = (body: string, type = "application/json") => new Request("http://localhost/api/interview/prepare/more", { method: "POST", headers: { "Content-Type": type }, body });

describe("interview prepare more route", () => {
  beforeEach(() => mocked.mockReset());
  it("rejects non-JSON and malformed JSON", async () => { expect((await POST(request("x", "text/plain"))).status).toBe(415); expect((await POST(request("{"))).status).toBe(400); });
  it.each([0, 6])("rejects invalid count %s", async (count) => { expect((await POST(request(JSON.stringify({ ...validBody, count })))).status).toBe(422); expect(mocked).not.toHaveBeenCalled(); });
  it.each(["unknownField", "extractedText", "pdf", "file", "resumeFile", "preparation"])("rejects forbidden %s without leaking it", async (field) => { const response = await POST(request(JSON.stringify({ ...validBody, [field]: "secret private input" }))); expect(response.status).toBe(422); expect(JSON.stringify(await response.json())).not.toContain("secret"); expect(mocked).not.toHaveBeenCalled(); });
  it("returns only newly generated questions and calls Gemini helper once", async () => { const questions = [validPreparation.questions[0]]; mocked.mockResolvedValueOnce({ questions }); const response = await POST(request(JSON.stringify(validBody))); expect(await response.json()).toEqual({ success: true, data: { questions } }); expect(mocked).toHaveBeenCalledTimes(1); });
  it.each([[new AiNotConfiguredError(), "AI_NOT_CONFIGURED"], [new PreparationEmptyOutputError(), "AI_EMPTY_OUTPUT"], [new PreparationInvalidJsonError(), "AI_INVALID_JSON"], [new PreparationTruncatedOutputError(), "AI_OUTPUT_TRUNCATED"], [new PreparationInvalidOutputError(), "AI_INVALID_OUTPUT"], [new PreparationUpstreamError("secret resume prompt"), "AI_UPSTREAM_ERROR"]] as const)("maps safe error %#", async (error, code) => { mocked.mockRejectedValueOnce(error); const response = await POST(request(JSON.stringify(validBody))); const body = await response.json(); expect(body.error.code).toBe(code); expect(JSON.stringify(body)).not.toContain("secret"); });
});
