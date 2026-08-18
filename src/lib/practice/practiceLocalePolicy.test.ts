import { describe, expect, it } from "vitest";
import { mockAnswerEvaluations } from "@/data/mockAnswerEvaluations";
import { resolveInitialLocale } from "@/lib/i18n/locales";
import { getPracticeLocaleChangeStrategy } from "./practiceLocalePolicy";

describe("practice locale policy", () => {
  it("preserves the active practice session during a UI language change", () => {
    expect(getPracticeLocaleChangeStrategy({ hasActivePractice: true, hasAnalysisState: true })).toBe("preserve-practice");
  });

  it("resets analysis and practice together after returning to the question list", () => {
    expect(getPracticeLocaleChangeStrategy({ hasActivePractice: false, hasAnalysisState: true })).toBe("reset-analysis-and-practice");
  });

  it.each(["zh-TW", "zh-CN", "en"] as const)("resolves initial %s to the matching mock", (locale) => {
    const resolved = resolveInitialLocale(locale, "en");
    expect(resolved).toBe(locale);
    expect(mockAnswerEvaluations[resolved].summary).toBeTruthy();
  });
});
