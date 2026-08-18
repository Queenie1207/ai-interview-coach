import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import { normalizeStructuredJson } from "@/lib/ai/normalizeStructuredJson";
import {
  createSafeProviderDiagnostics,
  interviewQuestionProviderJsonSchema,
  normalizePreparationStarOutlines,
  providerArray,
  providerObject,
  PreparationAuthenticationError,
  PreparationEmptyOutputError,
  PreparationInvalidJsonError,
  PreparationInvalidOutputError,
  PreparationRateLimitedError,
  PreparationTruncatedOutputError,
  PreparationUpstreamError,
} from "@/lib/ai/prepareInterview";
import { buildInterviewMoreQuestionsSystemPrompt } from "@/lib/prompts/interviewMoreQuestionsPrompt";
import { MoreInterviewQuestionsSchema, type MoreInterviewQuestions } from "@/lib/schemas/interviewPreparationSchema";
import type { InterviewMoreQuestionsRequest } from "@/lib/schemas/interviewMoreQuestionsRequestSchema";

export const moreQuestionsProviderJsonSchema = providerObject({
  questions: { ...providerArray(interviewQuestionProviderJsonSchema), minItems: 0, maxItems: 5 },
});

export type CompactAnalysisContext = {
  summary: string;
  strengths: Array<{ title: string; resumeEvidence: string[]; jdEvidence: string[] }>;
  gaps: Array<{ requirement: string; status: "partial" | "missing"; resumeEvidence: string[]; jdEvidence: string[] }>;
  interviewFocus: Array<{ title: string; requirement: string; resumeEvidence: string[] }>;
};

export function compactAnalysis(analysis: InterviewMoreQuestionsRequest["analysis"]): CompactAnalysisContext {
  return {
    summary: analysis.summary,
    strengths: analysis.strengths.map((item) => ({ title: item.title, resumeEvidence: item.evidence.resumeEvidence, jdEvidence: item.evidence.jdEvidence })),
    gaps: analysis.gaps.map((item) => ({ requirement: item.requirement, status: item.status, resumeEvidence: item.resumeEvidence, jdEvidence: item.jdEvidence })),
    interviewFocus: analysis.interviewFocus.map((item) => ({ title: item.topic, requirement: item.relatedRequirement, resumeEvidence: item.resumeEvidence })),
  };
}

export function normalizeQuestionText(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/[\s\p{P}\p{S}]+/gu, "");
}

function isClearlyOverlapping(a: string, b: string): boolean {
  const left = normalizeQuestionText(a);
  const right = normalizeQuestionText(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length > right.length ? left : right;
  return shorter.length >= 12 && longer.includes(shorter) && shorter.length / longer.length >= 0.8;
}

export function deduplicateQuestions(
  generated: MoreInterviewQuestions["questions"],
  excluded: InterviewMoreQuestionsRequest["excludedQuestions"],
): MoreInterviewQuestions["questions"] {
  const blocked = excluded.flatMap((item) => [item.question, ...item.followUps]);
  const accepted: MoreInterviewQuestions["questions"] = [];
  for (const item of generated) {
    if ([...blocked, ...accepted.map((question) => question.question)].some((value) => isClearlyOverlapping(item.question, value))) continue;
    accepted.push({ ...item, question: item.question.trim() });
  }
  return accepted;
}

export async function prepareMoreInterviewQuestions(input: InterviewMoreQuestionsRequest): Promise<MoreInterviewQuestions> {
  const { client, model } = getGeminiConfiguration();
  const promptInput = {
    resume: input.resume,
    jobDescription: input.jobDescription,
    analysisContext: compactAnalysis(input.analysis),
    companyName: input.companyName,
    positionName: input.positionName,
    excludedQuestions: input.excludedQuestions,
    count: input.count,
  };
  let completion;
  try {
    completion = await client.chat.completions.create({
      model, temperature: 0, max_completion_tokens: 6144, reasoning_effort: "low",
      messages: [{ role: "system", content: buildInterviewMoreQuestionsSystemPrompt(input.outputLanguage, input.count) }, { role: "user", content: JSON.stringify(promptInput) }],
      response_format: { type: "json_schema", json_schema: { name: "more_interview_questions", strict: true, schema: moreQuestionsProviderJsonSchema } },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) throw new PreparationAuthenticationError();
    if (error instanceof OpenAI.RateLimitError) throw new PreparationRateLimitedError();
    console.error("[interview-more-questions] upstream-diagnostics", JSON.stringify(createSafeProviderDiagnostics(error)));
    throw new PreparationUpstreamError();
  }
  const choice = completion.choices[0];
  const content = choice?.message?.content;
  if (!content) throw new PreparationEmptyOutputError();
  if (choice.finish_reason === "length") throw new PreparationTruncatedOutputError();
  let value: unknown;
  try { value = JSON.parse(normalizeStructuredJson(content)); } catch { throw new PreparationInvalidJsonError(); }
  const parsed = MoreInterviewQuestionsSchema.safeParse(normalizePreparationStarOutlines(value));
  if (!parsed.success) throw new PreparationInvalidOutputError();
  return { questions: deduplicateQuestions(parsed.data.questions, input.excludedQuestions).slice(0, input.count) };
}
