import { describe, expect, it } from "vitest";
import { categoryMessageKeys } from "./InterviewQuestionCard";
import { translate } from "@/lib/i18n/messages";

const expected = {
  en: ["Introduction", "Resume", "Project", "Technical", "Behavioral", "Gap", "Situational"],
  "zh-TW": ["自我介紹", "履歷", "專案", "技術", "行為", "缺口", "情境"],
  "zh-CN": ["自我介绍", "简历", "项目", "技术", "行为", "差距", "情境"],
} as const;

describe("interview question category labels", () => {
  it.each(["zh-TW", "zh-CN", "en"] as const)("uses localized labels for %s", (locale) => {
    expect(Object.values(categoryMessageKeys).map((key) => translate(locale, key))).toEqual(expected[locale]);
  });
});
