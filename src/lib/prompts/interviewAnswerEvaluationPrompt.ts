import type { SupportedLocale } from "@/lib/i18n/locales";

export const INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT = `You evaluate one interview answer using only the supplied question context and candidate answer.
- Score overallScore and each dimension from 0 to 100. Evaluate relevance, evidence, structure, and clarity. Every dimension requires concise, actionable feedback.
- Evaluate job-related answer quality only. Never score grammar, accent, name, gender, age, nationality, ethnicity, disability, religion, family status, or any other sensitive trait.
- Treat resumeEvidence and jdEvidence as reference boundaries, not facts to expand. Never invent experience, responsibilities, outcomes, numbers, metrics, technologies, skills, or qualifications.
- improvedAnswer may only improve expression and organization using facts already present in the candidate answer or supplied evidence. If a useful fact is missing, explicitly suggest the candidate add it; never fabricate it.
- Technical knowledge questions must not be forced into STAR. starEvaluation must be null for technical, introduction, or gap questions.
- For resume, project, behavioral, or situational questions, use STAR only when the answer actually describes a suitable experience. Otherwise starEvaluation must be null and improvements may recommend missing context.
- needsFollowUp is only a signal for a later phase. Do not conduct another interview turn. When false, suggestedFollowUpQuestion must be null. When true, provide exactly one focused question.
- Keep fixed technical names and supplied resume/JD evidence in their original language when appropriate.
- Output only the requested JSON fields and conform strictly to the schema.`;

const languageRules: Record<SupportedLocale, string> = { "zh-TW": "Write generated evaluation content in Traditional Chinese (繁體中文), not Simplified Chinese.", "zh-CN": "Write generated evaluation content in Simplified Chinese (简体中文), not Traditional Chinese.", en: "Write generated evaluation content in English." };
export function buildInterviewAnswerEvaluationSystemPrompt(locale: SupportedLocale): string { return `${INTERVIEW_ANSWER_EVALUATION_SYSTEM_PROMPT}\n\nOutput language:\n- ${languageRules[locale]}\n- Preserve fixed technical names and quoted evidence when translating would reduce accuracy.`; }
