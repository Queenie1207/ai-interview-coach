import "server-only";
import OpenAI from "openai";

export const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/";
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Gemini is not configured.");
    this.name = "AiNotConfiguredError";
  }
}

export function getGeminiConfiguration() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new AiNotConfiguredError();
  }

  return {
    client: new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL }),
    model,
  };
}
