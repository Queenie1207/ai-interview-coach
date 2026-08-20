import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import { normalizeStructuredJson } from "@/lib/ai/normalizeStructuredJson";
import { buildInterviewFollowUpEvaluationSystemPrompt } from "@/lib/prompts/interviewFollowUpEvaluationPrompt";
import { isStarApplicableCategory, SCORE_MAX, SCORE_MIN } from "@/lib/practice/questionEvaluationRules";
import { InterviewFinalEvaluationSchema, type InterviewFinalEvaluation } from "@/lib/schemas/interviewFinalEvaluationSchema";
import type { InterviewFollowUpEvaluationRequest } from "@/lib/schemas/interviewFollowUpEvaluationRequestSchema";

export class FollowUpEvaluationAuthenticationError extends Error {}
export class FollowUpEvaluationRateLimitedError extends Error {}
export class FollowUpEvaluationUpstreamError extends Error {}
export class FollowUpEvaluationEmptyOutputError extends Error {}
export class FollowUpEvaluationInvalidJsonError extends Error {}
export class FollowUpEvaluationInvalidOutputError extends Error {}

const string = () => ({ type: "string" } as const);
const nullableString = () => ({ type: ["string", "null"] } as const);
const array = (items: object) => ({ type: "array", items } as const);
const object = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const);
const score = () => ({ type: "integer", minimum: SCORE_MIN, maximum: SCORE_MAX } as const);
const dimension = () => object({ score: score(), feedback: string() });

export const interviewFinalEvaluationJsonSchema = object({
  overallScore: score(), summary: string(), strengths: array(string()), improvements: array(string()), missingPoints: array(string()), improvedAnswer: string(),
  needsFollowUp: { type: "boolean", const: false }, suggestedFollowUpQuestion: { type: "null" },
  dimensions: object({ relevance: dimension(), evidence: dimension(), structure: dimension(), clarity: dimension() }),
  starEvaluation: { ...object({ situation: nullableString(), task: nullableString(), action: nullableString(), result: nullableString(), feedback: string() }), type: ["object", "null"] },
});

export function parseInterviewFinalEvaluationContent(content: string, category: InterviewFollowUpEvaluationRequest["category"]): InterviewFinalEvaluation {
  let value: unknown;
  try { value = JSON.parse(normalizeStructuredJson(content)); } catch { throw new FollowUpEvaluationInvalidJsonError(); }
  const parsed = InterviewFinalEvaluationSchema.safeParse(value);
  if (!parsed.success || (!isStarApplicableCategory(category) && parsed.data.starEvaluation !== null)) throw new FollowUpEvaluationInvalidOutputError();
  return parsed.data;
}

export async function evaluateInterviewFollowUp(input: InterviewFollowUpEvaluationRequest): Promise<InterviewFinalEvaluation> {
  const { client, model } = getGeminiConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({ model, temperature: 0, max_completion_tokens: 4096, reasoning_effort: "low", messages: [{ role: "system", content: buildInterviewFollowUpEvaluationSystemPrompt(input.outputLanguage) }, { role: "user", content: JSON.stringify(input) }], response_format: { type: "json_schema", json_schema: { name: "interview_final_evaluation", strict: true, schema: interviewFinalEvaluationJsonSchema } } });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) throw new FollowUpEvaluationAuthenticationError();
    if (error instanceof OpenAI.RateLimitError) throw new FollowUpEvaluationRateLimitedError();
    throw new FollowUpEvaluationUpstreamError();
  }
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new FollowUpEvaluationEmptyOutputError();
  return parseInterviewFinalEvaluationContent(content, input.category);
}
