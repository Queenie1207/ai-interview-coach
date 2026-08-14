import { describe, expect, it } from "vitest";
import { ResumeSchema } from "@/lib/schemas/resumeSchema";
import { validResume } from "@/test/resumeFixture";

describe("ResumeSchema", () => {
  it("accepts valid data", () => expect(ResumeSchema.safeParse(validResume).success).toBe(true));
  it("rejects non-array skills", () => expect(ResumeSchema.safeParse({ ...validResume, skills: "Swift" }).success).toBe(false));
  it("rejects missing fields", () => { const missing: Record<string, unknown> = { ...validResume }; delete missing.profile; expect(ResumeSchema.safeParse(missing).success).toBe(false); });
  it("rejects unknown top-level fields", () => expect(ResumeSchema.safeParse({ ...validResume, score: 100 }).success).toBe(false));

  it.each(["activities", "certifications", "additionalSections"] as const)(
    "rejects data missing the required %s field",
    (field) => {
      const missing: Record<string, unknown> = { ...validResume };
      delete missing[field];
      expect(ResumeSchema.safeParse(missing).success).toBe(false);
    },
  );

  it("accepts all required collection fields as empty arrays", () => {
    expect(
      ResumeSchema.safeParse({
        ...validResume,
        skills: [],
        languages: [],
        experience: [],
        education: [],
        projects: [],
        activities: [],
        certifications: [],
        additionalSections: [],
      }).success,
    ).toBe(true);
  });
});
