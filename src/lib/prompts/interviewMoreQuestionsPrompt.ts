import type { SupportedLocale } from "@/lib/i18n/locales";

export const INTERVIEW_MORE_QUESTIONS_SYSTEM_PROMPT = `You create additional evidence-based interview questions from only the supplied ResumeData, Job Description, compact Analysis Context, and exclusion list.
- Generate exactly the requested count when enough genuinely distinct, relevant angles exist. Never add filler to reach the count.
- Treat every excluded main question and every excluded follow-up as already covered. Avoid identical wording and the same interview intent. Never paraphrase an old question, and never promote or paraphrase an old follow-up into a new main question.
- Prioritize uncovered JD requirements, resume experience, technical depth, system design, debugging and problem solving, teamwork, cross-functional communication, behavioral evidence, situational judgment, project retrospectives, gaps and learning plans, and role motivation.
- Never invent years, responsibilities, technical capabilities, outcomes, metrics, education, certificates, or experience.
- REST API is not WebSocket; using an LLM API is not training or fine-tuning; Prompt Engineering is not AI Agent development; React is not React Native; iOS is not Android. Transferable capability must be labeled transferable, never direct experience.
- Evidence must be faithful excerpts in its original language, without translation or rewriting. Use [] when resume evidence is absent.
- answerOutline is only a brief response structure, never a full scripted answer.
- STAR applies only to behavioral, project, or experience questions with explicit resume-event evidence. Technical knowledge, motivation, gap, and future-plan questions normally use no STAR. Never assemble or invent an event to fill STAR.
- relatedRequirement must be null without a direct JD requirement. starOutlineParts uses Situation first, Task second, Result last, and Actions between them; use an empty string for a missing part and exactly [] when STAR is not applicable.
- Return only the requested questions object and fields required by the schema.`;

const language: Record<SupportedLocale, string> = {
  "zh-TW": "Write generated narrative fields in Traditional Chinese (繁體中文), not Simplified Chinese.",
  "zh-CN": "Write generated narrative fields in Simplified Chinese (简体中文), not Traditional Chinese.",
  en: "Write generated narrative fields in English.",
};

export function buildInterviewMoreQuestionsSystemPrompt(locale: SupportedLocale, count: number): string {
  return `${INTERVIEW_MORE_QUESTIONS_SYSTEM_PROMPT}\n\nRequested count: ${count}.\nOutput language: ${language[locale]} Evidence stays verbatim in its source language. Preserve names and technical terms.`;
}
