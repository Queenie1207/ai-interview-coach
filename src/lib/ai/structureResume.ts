import "server-only";
import OpenAI from "openai";
import { getGeminiConfiguration } from "@/lib/ai/geminiClient";
import { RESUME_STRUCTURE_SYSTEM_PROMPT } from "@/lib/prompts/resumeStructurePrompt";
import { ResumeSchema, type ResumeData } from "@/lib/schemas/resumeSchema";
import { normalizeResumeData } from "@/lib/resume/normalizeResumeData";

export class AiAuthenticationError extends Error {}
export class AiRateLimitedError extends Error {}
export class AiUpstreamError extends Error {}
export class AiEmptyOutputError extends Error {}
export class AiInvalidJsonError extends Error {}
export class AiInvalidOutputError extends Error {}

export const RESUME_STRUCTURE_REASONING_EFFORT = "low" as const;

type InvalidJsonDiagnosticsInput = {
  content: string;
  finishReason: string | null | undefined;
  requestId: string | null | undefined;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type InvalidJsonDiagnostics = {
  finishReason: string;
  requestId: string;
  outputCharacters: number;
  beginsWithJsonObject: boolean;
  endsWithJsonObject: boolean;
  containsMarkdownCodeFence: boolean;
  tokenUsage: { prompt?: number; completion?: number; total?: number };
};

export function createInvalidJsonDiagnostics(input: InvalidJsonDiagnosticsInput): InvalidJsonDiagnostics {
  const trimmedContent = input.content.trim();
  return {
    finishReason: input.finishReason ?? "unavailable",
    requestId: input.requestId ?? "unavailable",
    outputCharacters: input.content.length,
    beginsWithJsonObject: trimmedContent.startsWith("{"),
    endsWithJsonObject: trimmedContent.endsWith("}"),
    containsMarkdownCodeFence: trimmedContent.includes("```"),
    tokenUsage: {
      prompt: input.promptTokens,
      completion: input.completionTokens,
      total: input.totalTokens,
    },
  };
}

export const resumeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["profile", "skills", "languages", "experience", "education", "projects", "activities", "certifications", "additionalSections"],
  properties: {
    profile: object({ name: nullable(), title: nullable(), summary: nullable(), email: nullable(), phone: nullable(), location: nullable(), links: array(string()) }),
    skills: array(string()),
    languages: array(object({ name: string(), proficiency: nullable() })),
    experience: array(object({ company: string(), role: string(), location: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()), technologies: array(string()) })),
    education: array(object({ school: string(), degree: nullable(), field: nullable(), location: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()) })),
    projects: array(object({ name: string(), description: nullable(), role: nullable(), technologies: array(string()), highlights: array(string()), link: nullable() })),
    activities: array(object({ title: string(), organization: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()) })),
    certifications: array(object({ name: string(), issuer: nullable(), date: nullable() })),
    additionalSections: array(object({ originalHeading: string(), items: array(string()) })),
  },
} as const;

function string() { return { type: "string" } as const; }
function nullable() { return { type: ["string", "null"] } as const; }
function array(items: object) { return { type: "array", items } as const; }
function object(properties: Record<string, object>) {
  return { type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const;
}

export async function structureResume(extractedText: string): Promise<ResumeData> {
  const { client, model } = getGeminiConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0,
      // Let Gemini apply its provider/model output-token limit.
      // max_completion_tokens: 8192,
      reasoning_effort: RESUME_STRUCTURE_REASONING_EFFORT,
      messages: [
        { role: "system", content: RESUME_STRUCTURE_SYSTEM_PROMPT },
        { role: "user", content: extractedText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "resume_data", strict: true, schema: resumeJsonSchema },
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      throw new AiAuthenticationError("The AI provider rejected authentication.");
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new AiRateLimitedError("The AI provider rate limit was reached.");
    }
    throw new AiUpstreamError("The AI provider request failed.");
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new AiEmptyOutputError("The AI response was empty.");
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    const diagnostics = createInvalidJsonDiagnostics({
      content,
      finishReason: completion.choices[0]?.finish_reason,
      requestId: completion._request_id,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      totalTokens: completion.usage?.total_tokens,
    });
    console.error("[resume-structure] invalid-json-diagnostics", JSON.stringify(diagnostics));
    throw new AiInvalidJsonError("The AI response was not JSON.");
  }
  const parsed = ResumeSchema.safeParse(value);
  if (!parsed.success) throw new AiInvalidOutputError("The AI response did not match ResumeSchema.");

  if (process.env.NODE_ENV === "development") {
    console.info("[resume-structure] success", {
      provider: "gemini",
      model,
      status: "success",
      requestId: completion._request_id ?? "unavailable",
      tokenUsage: completion.usage
        ? {
            prompt: completion.usage.prompt_tokens,
            completion: completion.usage.completion_tokens,
            total: completion.usage.total_tokens,
          }
        : "unavailable",
    });
  }

  return normalizeResumeData(parsed.data);
}
