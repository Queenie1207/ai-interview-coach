import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { buildInterviewPreparationSystemPrompt } from "@/lib/prompts/interviewPreparationPrompt";
import { InterviewPreparationSchema, type InterviewPreparation } from "@/lib/schemas/interviewPreparationSchema";
import type { InterviewAnalysis } from "@/lib/schemas/interviewAnalysisSchema";
import type { ResumeData } from "@/lib/schemas/resumeSchema";
import { normalizeStructuredJson } from "@/lib/ai/normalizeStructuredJson";

export class PreparationAuthenticationError extends Error {}
export class PreparationRateLimitedError extends Error {}
export class PreparationUpstreamError extends Error {}
export class PreparationEmptyOutputError extends Error {}
export class PreparationInvalidJsonError extends Error {}
export class PreparationTruncatedOutputError extends Error {}
export class PreparationInvalidOutputError extends Error {}

const string = () => ({ type: "string" } as const);
const nullable = () => ({ type: ["string", "null"] } as const);
const array = (items: object) => ({ type: "array", items } as const);
const object = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const);

export const interviewPreparationJsonSchema = object({
  questions: { ...array(object({
    category: { type: "string", enum: ["introduction", "resume", "project", "technical", "behavioral", "gap", "situational"] },
    difficulty: { type: "string", enum: ["basic", "intermediate", "advanced"] },
    question: string(), whyAsked: string(), relatedRequirement: nullable(), resumeEvidence: array(string()), jdEvidence: array(string()), answerOutline: array(string()),
    starOutline: { anyOf: [object({ situation: nullable(), task: nullable(), action: array(string()), result: nullable() }), { type: "null" }] },
    followUps: array(string()),
  })), minItems: 5, maxItems: 10 },
  reviewTopics: { ...array(object({ topic: string(), reason: string(), priority: { type: "string", enum: ["high", "medium", "low"] }, relatedQuestions: array(string()) })), maxItems: 10 },
});

type Input = { resume: ResumeData; jobDescription: string; analysis: InterviewAnalysis; companyName?: string; positionName?: string; outputLanguage: SupportedLocale };

export async function prepareInterview(input: Input): Promise<InterviewPreparation> {
  const { client, model } = getGeminiConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({
      model, temperature: 0, max_completion_tokens: 8192, reasoning_effort: "low",
      messages: [{ role: "system", content: buildInterviewPreparationSystemPrompt(input.outputLanguage) }, { role: "user", content: JSON.stringify(input) }],
      response_format: { type: "json_schema", json_schema: { name: "interview_preparation", strict: true, schema: interviewPreparationJsonSchema } },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) throw new PreparationAuthenticationError();
    if (error instanceof OpenAI.RateLimitError) throw new PreparationRateLimitedError();
    throw new PreparationUpstreamError();
  }
  const choice = completion.choices[0];
  const content = choice?.message?.content;
  if (!content) throw new PreparationEmptyOutputError();
  if (choice.finish_reason === "length") throw new PreparationTruncatedOutputError();
  let value: unknown;
  try { value = JSON.parse(normalizeStructuredJson(content)); } catch { throw new PreparationInvalidJsonError(); }
  const parsed = InterviewPreparationSchema.safeParse(value);
  if (!parsed.success) throw new PreparationInvalidOutputError();
  return parsed.data;
}
