import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import { normalizeStructuredJson } from "@/lib/ai/normalizeStructuredJson";
import { buildInterviewAnswerEvaluationSystemPrompt } from "@/lib/prompts/interviewAnswerEvaluationPrompt";
import { isStarApplicableCategory, SCORE_MAX, SCORE_MIN } from "@/lib/practice/questionEvaluationRules";
import { InterviewAnswerEvaluationSchema, type InterviewAnswerEvaluation } from "@/lib/schemas/interviewAnswerEvaluationSchema";
import type { InterviewAnswerEvaluationRequest } from "@/lib/schemas/interviewAnswerEvaluationRequestSchema";

export class AnswerEvaluationAuthenticationError extends Error {}
export class AnswerEvaluationRateLimitedError extends Error {}
export class AnswerEvaluationUpstreamError extends Error {}
export class AnswerEvaluationEmptyOutputError extends Error {}
export class AnswerEvaluationInvalidJsonError extends Error {}
export class AnswerEvaluationInvalidOutputError extends Error {}

const string = () => ({ type: "string" } as const);
const nullableString = () => ({ type: ["string", "null"] } as const);
const array = (items: object) => ({ type: "array", items } as const);
const object = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const);
const score = () => ({ type: "integer", minimum: SCORE_MIN, maximum: SCORE_MAX } as const);
const dimension = () => object({ score: score(), feedback: string() });

export const interviewAnswerEvaluationJsonSchema = object({
  overallScore: score(), summary: string(), strengths: array(string()), improvements: array(string()), missingPoints: array(string()), improvedAnswer: string(),
  needsFollowUp: { type: "boolean" }, suggestedFollowUpQuestion: nullableString(),
  dimensions: object({ relevance: dimension(), evidence: dimension(), structure: dimension(), clarity: dimension() }),
  starEvaluation: { ...object({ situation: nullableString(), task: nullableString(), action: nullableString(), result: nullableString(), feedback: string() }), type: ["object", "null"] },
});

export function parseInterviewAnswerEvaluationContent(content: string, category: InterviewAnswerEvaluationRequest["category"]): InterviewAnswerEvaluation {
  let value: unknown;
  try { value = JSON.parse(normalizeStructuredJson(content)); } catch { throw new AnswerEvaluationInvalidJsonError(); }
  const parsed = InterviewAnswerEvaluationSchema.safeParse(value);
  if (!parsed.success) throw new AnswerEvaluationInvalidOutputError();
  if (!isStarApplicableCategory(category) && parsed.data.starEvaluation !== null) throw new AnswerEvaluationInvalidOutputError();
  return parsed.data;
}

export async function evaluateInterviewAnswer(input: InterviewAnswerEvaluationRequest): Promise<InterviewAnswerEvaluation> {
  const { client, model } = getGeminiConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({
      model, temperature: 0, max_completion_tokens: 4096, reasoning_effort: "low",
      messages: [{ role: "system", content: buildInterviewAnswerEvaluationSystemPrompt(input.outputLanguage) }, { role: "user", content: JSON.stringify(input) }],
      response_format: { type: "json_schema", json_schema: { name: "interview_answer_evaluation", strict: true, schema: interviewAnswerEvaluationJsonSchema } },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) throw new AnswerEvaluationAuthenticationError();
    if (error instanceof OpenAI.RateLimitError) throw new AnswerEvaluationRateLimitedError();
    throw new AnswerEvaluationUpstreamError();
  }
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new AnswerEvaluationEmptyOutputError();
  return parseInterviewAnswerEvaluationContent(content, input.category);
}
