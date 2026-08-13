import { describe, expect, it } from "vitest";
import { normalizeResumeData } from "@/lib/resume/normalizeResumeData";
import { validResume } from "@/test/resumeFixture";

function withClassificationItems(activityTitles: string[], certificationNames: string[]) {
  return {
    ...validResume,
    activities: activityTitles.map((title) => ({
      title,
      organization: null,
      startDate: null,
      endDate: null,
      highlights: [],
    })),
    certifications: certificationNames.map((name) => ({ name, issuer: null, date: null })),
  };
}

describe("normalizeResumeData", () => {
  it("keeps an exact duplicate only in certifications", () => {
    const result = normalizeResumeData(
      withClassificationItems(["Adobe Certified Professional"], ["Adobe Certified Professional"]),
    );
    expect(result.activities).toHaveLength(0);
    expect(result.certifications).toHaveLength(1);
  });

  it("matches names after trimming, lowercasing, and whitespace normalization", () => {
    const result = normalizeResumeData(
      withClassificationItems(["  LEANIX   CERTIFIED PRACTITIONER  "], ["LeanIX Certified Practitioner"]),
    );
    expect(result.activities).toHaveLength(0);
  });

  it("does not remove names that are not exactly equal after normalization", () => {
    const result = normalizeResumeData(
      withClassificationItems(["AWS Concepts Workshop"], ["AWS Concepts"]),
    );
    expect(result.activities).toHaveLength(1);
  });

  it("preserves the sports competition award in activities", () => {
    const result = normalizeResumeData(
      withClassificationItems(["女子單打第三名及體育精神獎"], ["Microsoft Office Specialist 2016 Master"]),
    );
    expect(result.activities.map((activity) => activity.title)).toContain(
      "女子單打第三名及體育精神獎",
    );
  });
});
