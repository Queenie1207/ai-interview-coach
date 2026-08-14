import { describe, expect, it } from "vitest";
import { RESUME_STRUCTURE_SYSTEM_PROMPT } from "@/lib/prompts/resumeStructurePrompt";

describe("resume structure prompt", () => {
  it("requires exclusive classification and restricts additional sections", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exactly one best-fitting section");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exclusively in certifications");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("cannot be classified reliably must not be deleted");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("complete original wording in additionalSections");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("never copy content already classified elsewhere into it");
  });

  it("constrains profile title and preserves the original summary", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("explicitly and independently labeled");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("資訊科技碩士學生");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("complete original personal introduction");
  });

  it("forbids summarizing, rewriting, splitting, and merging source items", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("at most 50 unique skills");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("not a summarizer");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Do not summarize, shorten, polish, paraphrase, regenerate, merge, split");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Never split one source item into multiple highlights");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("merge multiple source items into one highlight");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Preserve source order");
  });

  it("preserves guidance context, purpose, results, and evaluation scenarios", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("professors, doctors, advisors, teams");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("guidance relationships");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("work purpose, results, evaluation subjects, evaluation scenarios");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("real-world environments or deployment");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("在刘云辉教授团队与王刚博士指导下");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Keep the entire input as one highlight");
  });

  it("requires all top-level fields and explicit empty values", () => {
    for (const field of ["profile", "skills", "languages", "experience", "education", "projects", "activities", "certifications", "additionalSections"]) {
      expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain(field);
    }
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("Use [] for a collection with no data and null for a missing scalar");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("never omit fields or add top-level fields");
  });
});
