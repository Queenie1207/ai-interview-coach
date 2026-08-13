import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError } from "@/lib/ai/groqClient";
import { AiInvalidOutputError } from "@/lib/ai/structureResume";
import { validResume } from "@/test/resumeFixture";

vi.mock("@/lib/ai/structureResume", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/ai/structureResume")>();
  return { ...original, structureResume: vi.fn() };
});
import { structureResume } from "@/lib/ai/structureResume";
import { MAX_RESUME_TEXT_LENGTH } from "@/lib/resume/resumeStructureValidation";
import { POST } from "./route";

const mocked = vi.mocked(structureResume);
const req = (body: BodyInit | null, type = "application/json") => new Request("http://localhost/api/resume/structure", { method: "POST", headers: { "Content-Type": type }, body });

describe("resume structure route", () => {
  beforeEach(() => mocked.mockReset());
  it("rejects non-JSON", async () => expect((await POST(req("text", "text/plain"))).status).toBe(415));
  it("rejects missing text", async () => expect((await POST(req("{}"))).status).toBe(400));
  it("rejects non-string text", async () => expect((await POST(req('{"extractedText":4}'))).status).toBe(400));
  it("rejects blank text", async () => expect((await POST(req('{"extractedText":"  "}'))).status).toBe(422));
  it("rejects oversized text", async () => expect((await POST(req(JSON.stringify({ extractedText: "x".repeat(MAX_RESUME_TEXT_LENGTH + 1) })))).status).toBe(413));
  it("handles missing configuration", async () => { mocked.mockImplementationOnce(() => { throw new AiNotConfiguredError(); }); const response = await POST(req('{"extractedText":"resume"}')); expect(response.status).toBe(503); expect(await response.json()).toMatchObject({ error: { code: "AI_NOT_CONFIGURED" } }); });
  it("handles invalid LLM data", async () => { mocked.mockImplementationOnce(() => { throw new AiInvalidOutputError(); }); const response = await POST(req('{"extractedText":"resume"}')); expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ error: { code: "AI_INVALID_OUTPUT" } }); });
  it("returns structured data", async () => { mocked.mockResolvedValue(validResume); const response = await POST(req('{"extractedText":"resume"}')); expect(response.status).toBe(200); expect(await response.json()).toEqual({ success: true, data: validResume }); });
});
