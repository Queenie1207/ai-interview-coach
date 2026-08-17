import { describe, expect, it } from "vitest";
import {
  RESUME_STRUCTURE_REASONING_EFFORT,
  createInvalidJsonDiagnostics,
  resumeJsonSchema,
} from "@/lib/ai/structureResume";

const requiredTopLevelFields = [
  "profile",
  "skills",
  "languages",
  "experience",
  "education",
  "projects",
  "activities",
  "certifications",
  "additionalSections",
];

describe("resume structured output configuration", () => {
  it("uses the model's lowest supported reasoning effort", () => {
    expect(RESUME_STRUCTURE_REASONING_EFFORT).toBe("low");
  });

  it("requires every top-level field and rejects additional properties", () => {
    expect(resumeJsonSchema.required).toEqual(requiredTopLevelFields);
    expect(resumeJsonSchema.additionalProperties).toBe(false);
    expect(Object.keys(resumeJsonSchema.properties)).toEqual(requiredTopLevelFields);
  });

  it("creates safe invalid-JSON diagnostics without response content", () => {
    const sensitiveContent = "```json\n{\"name\":\"Sensitive Candidate\"}\n```";
    const diagnostics = createInvalidJsonDiagnostics({
      content: sensitiveContent,
      finishReason: "length",
      requestId: "request-123",
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
    });

    expect(diagnostics).toEqual({
      finishReason: "length",
      requestId: "request-123",
      outputCharacters: sensitiveContent.length,
      beginsWithJsonObject: false,
      endsWithJsonObject: false,
      containsMarkdownCodeFence: true,
      tokenUsage: { prompt: 100, completion: 200, total: 300 },
    });
    expect(JSON.stringify(diagnostics)).not.toContain("Sensitive Candidate");
  });

  it("detects a complete JSON object without retaining it", () => {
    const diagnostics = createInvalidJsonDiagnostics({
      content: "  {\"private\":true}  ",
      finishReason: "stop",
      requestId: undefined,
    });

    expect(diagnostics.beginsWithJsonObject).toBe(true);
    expect(diagnostics.endsWithJsonObject).toBe(true);
    expect(diagnostics.containsMarkdownCodeFence).toBe(false);
    expect(JSON.stringify(diagnostics)).not.toContain("private");
  });
});
