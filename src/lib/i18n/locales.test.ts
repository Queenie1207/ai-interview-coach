import { describe, expect, it } from "vitest";
import { isSupportedLocale, localeFromBrowserLanguage, resolveInitialLocale } from "./locales";
import { messages } from "./messages";

describe("locales", () => {
  it.each(["zh-TW", "zh-CN", "en"])("accepts %s", (locale) => expect(isSupportedLocale(locale)).toBe(true));
  it("rejects unsupported locales", () => expect(isSupportedLocale("fr")).toBe(false));
  it("prefers valid stored locale", () => expect(resolveInitialLocale("en", "zh-TW")).toBe("en"));
  it("falls back from invalid storage", () => expect(resolveInitialLocale("bad", "zh-CN")).toBe("zh-CN"));
  it.each([["zh-TW", "zh-TW"], ["zh-HK", "zh-TW"], ["zh-Hant", "zh-TW"], ["zh-CN", "zh-CN"], ["zh-SG", "zh-CN"], ["zh-Hans", "zh-CN"], ["fr-FR", "en"]] as const)("maps %s", (input, expected) => expect(localeFromBrowserLanguage(input)).toBe(expected));
  it("has identical message keys", () => {
    expect(Object.keys(messages["zh-CN"]).sort()).toEqual(Object.keys(messages.en).sort());
    expect(Object.keys(messages["zh-TW"]).sort()).toEqual(Object.keys(messages.en).sort());
  });
  it.each(["zh-TW", "zh-CN", "en"] as const)("has workflow loading, error, and retry text for %s", (locale) => {
    expect(messages[locale].comparingRequirements).toBeTruthy();
    expect(messages[locale].analysisUnknown).toBeTruthy();
    expect(messages[locale].retryAnalysis).toBeTruthy();
    expect(messages[locale].generatingPreparation).toBeTruthy();
    expect(messages[locale].preparationUnknown).toBeTruthy();
    expect(messages[locale].retryPreparation).toBeTruthy();
  });
  it.each(["zh-TW", "zh-CN", "en"] as const)("has the stale evaluation notice for %s", (locale) => expect(messages[locale].answerChangedEvaluationStale).toBeTruthy());
});
