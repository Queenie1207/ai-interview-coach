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

export type SafeProviderDiagnostics = {
  errorClass: string;
  status: number | "unavailable";
  reason: "invalid_schema" | "invalid_max_tokens" | "invalid_reasoning_effort" | "request_too_large" | "invalid_argument" | "unavailable";
  code: string;
  type: string;
  param: string;
  requestId: string;
};

function classifySafeReason(error: InstanceType<typeof OpenAI.APIError>): SafeProviderDiagnostics["reason"] {
  const message = error.message.toLowerCase();
  if (message.includes("schema")) return "invalid_schema";
  if (message.includes("max_completion_tokens") || message.includes("max tokens")) return "invalid_max_tokens";
  if (message.includes("reasoning_effort")) return "invalid_reasoning_effort";
  if (message.includes("context length") || message.includes("too many tokens") || message.includes("request too large")) return "request_too_large";
  if (message.includes("invalid argument") || error.status === 400) return "invalid_argument";
  return "unavailable";
}

function safeIdentifier(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_.:/\[\]-]{1,128}$/.test(value) ? value : "unavailable";
}

export function createSafeProviderDiagnostics(error: unknown): SafeProviderDiagnostics {
  if (!(error instanceof OpenAI.APIError)) {
    return {
      errorClass: error instanceof OpenAI.APIConnectionTimeoutError ? "APIConnectionTimeoutError" : error instanceof OpenAI.APIConnectionError ? "APIConnectionError" : "UnknownError",
      status: "unavailable",
      reason: "unavailable",
      code: "unavailable",
      type: "unavailable",
      param: "unavailable",
      requestId: "unavailable",
    };
  }

  return {
    errorClass: safeIdentifier(error.constructor.name),
    status: typeof error.status === "number" ? error.status : "unavailable",
    reason: classifySafeReason(error),
    code: safeIdentifier(error.code),
    type: safeIdentifier(error.type),
    param: safeIdentifier(error.param),
    requestId: safeIdentifier(error.requestID),
  };
}

export const providerString = () => ({ type: "string" } as const);
export const providerNullableString = () => ({ type: ["string", "null"] } as const);
export const providerArray = (items: object) => ({ type: "array", items } as const);
export const providerObject = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const);

export const interviewQuestionProviderJsonSchema = providerObject({
  category: { type: "string", enum: ["introduction", "resume", "project", "technical", "behavioral", "gap", "situational"] },
  difficulty: { type: "string", enum: ["basic", "intermediate", "advanced"] },
  question: providerString(), whyAsked: providerString(), relatedRequirement: providerNullableString(), resumeEvidence: providerArray(providerString()), jdEvidence: providerArray(providerString()), answerOutline: providerArray(providerString()),
  starOutlineParts: providerArray(providerString()),
  followUps: providerArray(providerString()),
});

export const interviewPreparationJsonSchema = providerObject({
  questions: { ...providerArray(interviewQuestionProviderJsonSchema), minItems: 5, maxItems: 10 },
  reviewTopics: { ...providerArray(providerObject({ topic: providerString(), reason: providerString(), priority: { type: "string", enum: ["high", "medium", "low"] }, relatedQuestions: providerArray(providerString()) })), maxItems: 10 },
});

type Input = { resume: ResumeData; jobDescription: string; analysis: InterviewAnalysis; companyName?: string; positionName?: string; outputLanguage: SupportedLocale };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyStarOutline(value: unknown): boolean {
  return isRecord(value) && value.situation === null && value.task === null && Array.isArray(value.action) && value.action.length === 0 && value.result === null;
}

export function normalizePreparationStarOutlines(value: unknown): unknown {
  if (!isRecord(value) || !Array.isArray(value.questions)) return value;
  return {
    ...value,
    questions: value.questions.map((question) => {
      if (!isRecord(question)) return question;
      if (Array.isArray(question.starOutlineParts)) {
        const normalized = { ...question };
        const parts = question.starOutlineParts;
        delete normalized.starOutlineParts;
        if (parts.length === 0) return { ...normalized, starOutline: null };
        if (parts.length < 3) return { ...normalized, starOutline: parts };
        const starOutline = {
          situation: typeof parts[0] === "string" && parts[0].trim() ? parts[0] : null,
          task: typeof parts[1] === "string" && parts[1].trim() ? parts[1] : null,
          action: parts.slice(2, -1).filter((item): item is string => typeof item === "string" && Boolean(item.trim())),
          result: typeof parts.at(-1) === "string" && parts.at(-1)?.trim() ? parts.at(-1) : null,
        };
        return { ...normalized, starOutline: isEmptyStarOutline(starOutline) ? null : starOutline };
      }
      return isEmptyStarOutline(question.starOutline) ? { ...question, starOutline: null } : question;
    }),
  };
}

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
    console.error("[interview-preparation] upstream-diagnostics", JSON.stringify(createSafeProviderDiagnostics(error)));
    throw new PreparationUpstreamError();
  }
  const choice = completion.choices[0];
  const content = choice?.message?.content;
  if (!content) throw new PreparationEmptyOutputError();
  if (choice.finish_reason === "length") throw new PreparationTruncatedOutputError();
  let value: unknown;
  try { value = JSON.parse(normalizeStructuredJson(content)); } catch { throw new PreparationInvalidJsonError(); }
  const parsed = InterviewPreparationSchema.safeParse(normalizePreparationStarOutlines(value));
  if (!parsed.success) throw new PreparationInvalidOutputError();
  return parsed.data;
}
