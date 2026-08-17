import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import { buildInterviewAnalysisSystemPrompt } from "@/lib/prompts/interviewAnalysisPrompt";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { InterviewAnalysisSchema, type InterviewAnalysis } from "@/lib/schemas/interviewAnalysisSchema";
import type { ResumeData } from "@/lib/schemas/resumeSchema";

export class AnalysisAuthenticationError extends Error {}
export class AnalysisRateLimitedError extends Error {}
export class AnalysisUpstreamError extends Error {}
export class AnalysisEmptyOutputError extends Error {}
export class AnalysisInvalidJsonError extends Error {}
export class AnalysisInvalidOutputError extends Error {}

const string = () => ({ type: "string" } as const);
const array = (items: object) => ({ type: "array", items } as const);
const object = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const);

export const interviewAnalysisJsonSchema = object({
  matchScore: { type: "integer", minimum: 0, maximum: 100 },
  matchLevel: { type: "string", enum: ["strong", "moderate", "weak"] },
  summary: string(),
  strengths: array(object({ title: string(), explanation: string(), evidence: object({ resumeEvidence: array(string()), jdEvidence: array(string()) }) })),
  gaps: array(object({ requirement: string(), status: { type: "string", enum: ["partial", "missing"] }, explanation: string(), jdEvidence: array(string()), resumeEvidence: array(string()), recommendation: string() })),
  interviewFocus: array(object({ topic: string(), reason: string(), relatedRequirement: string(), resumeEvidence: array(string()) })),
});

type AnalysisInput = { resume: ResumeData; jobDescription: string; companyName?: string; positionName?: string; outputLanguage: SupportedLocale };

export async function analyzeInterview(input: AnalysisInput): Promise<InterviewAnalysis> {
  const { client, model } = getGeminiConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({
      model, temperature: 0, max_completion_tokens: 8192, reasoning_effort: "low",
      messages: [
        { role: "system", content: buildInterviewAnalysisSystemPrompt(input.outputLanguage) },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "interview_analysis", strict: true, schema: interviewAnalysisJsonSchema } },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) throw new AnalysisAuthenticationError();
    if (error instanceof OpenAI.RateLimitError) throw new AnalysisRateLimitedError();
    throw new AnalysisUpstreamError();
  }
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new AnalysisEmptyOutputError();
  let value: unknown;
  try { value = JSON.parse(content); } catch { throw new AnalysisInvalidJsonError(); }
  const parsed = InterviewAnalysisSchema.safeParse(value);
  if (!parsed.success) throw new AnalysisInvalidOutputError();
  return parsed.data;
}
