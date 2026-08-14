import { describe, expect, it } from "vitest";
import {
  RESUME_STRUCTURE_MAX_COMPLETION_TOKENS,
  RESUME_STRUCTURE_REASONING_EFFORT,
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
  it("uses an 8192 completion-token limit", () => {
    expect(RESUME_STRUCTURE_MAX_COMPLETION_TOKENS).toBe(8192);
  });

  it("uses the model's lowest supported reasoning effort", () => {
    expect(RESUME_STRUCTURE_REASONING_EFFORT).toBe("low");
  });

  it("requires every top-level field and rejects additional properties", () => {
    expect(resumeJsonSchema.required).toEqual(requiredTopLevelFields);
    expect(resumeJsonSchema.additionalProperties).toBe(false);
    expect(Object.keys(resumeJsonSchema.properties)).toEqual(requiredTopLevelFields);
  });
});
