import "server-only";
import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Groq is not configured.");
    this.name = "AiNotConfiguredError";
  }
}

export function getGroqConfiguration() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim();
  if (!apiKey || !model) throw new AiNotConfiguredError();
  return { client: new OpenAI({ apiKey, baseURL: GROQ_BASE_URL }), model };
}
