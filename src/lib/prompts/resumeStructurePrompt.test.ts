import { describe, expect, it } from "vitest";
import { RESUME_STRUCTURE_SYSTEM_PROMPT } from "@/lib/prompts/resumeStructurePrompt";

describe("resume structure prompt", () => {
  it("requires exclusive classification and restricts additional sections", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exactly one best-fitting section");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exclusively in certifications");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("additionalSections contains only content that cannot reliably fit another section");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Never copy already classified content into it");
  });

  it("constrains profile title and preserves the original summary", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("explicitly and independently labeled");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("資訊科技碩士學生");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("complete original personal introduction");
  });

  it("sets concise collection and highlight limits", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("at most 50 unique skills");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Never copy whole resume passages into highlights");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Each highlight contains one concise source fact");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("5 highlights per experience");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("3 per education");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("5 per project");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("3 per activity");
  });

  it("requires all top-level fields and explicit empty values", () => {
    for (const field of ["profile", "skills", "languages", "experience", "education", "projects", "activities", "certifications", "additionalSections"]) {
      expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain(field);
    }
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Use [] for a collection with no data and null for a missing scalar");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("never omit fields or add top-level fields");
  });
});
