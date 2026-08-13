import { describe, expect, it } from "vitest";
import { RESUME_STRUCTURE_SYSTEM_PROMPT } from "@/lib/prompts/resumeStructurePrompt";

describe("resume structure prompt classification rules", () => {
  it("requires exclusive certification classification and a final duplicate check", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exactly one best-fitting section");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("exclusively in certifications");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("check for identical items repeated across sections");
  });

  it("constrains profile title and preserves the complete original summary", () => {
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("explicitly and independently labeled");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("資訊科技碩士學生");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("use null");
    expect(RESUME_STRUCTURE_SYSTEM_PROMPT).toContain("preserve the complete original personal introduction");
  });
});
