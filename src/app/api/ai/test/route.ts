import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  AiNotConfiguredError,
  getGeminiConfiguration,
} from "@/lib/ai/geminiClient";

export const runtime = "nodejs";

type ConnectionTestSuccess = {
  success: true;
  data: {
    connected: true;
    provider: "gemini";
    model: string;
  };
};

type ConnectionTestError = {
  success: false;
  connected: false;
  error: {
    code:
      | "AI_NOT_CONFIGURED"
      | "AI_AUTHENTICATION_ERROR"
      | "AI_RATE_LIMITED"
      | "AI_UPSTREAM_ERROR";
    message: string;
  };
};

function errorResponse(
  code: ConnectionTestError["error"]["code"],
  message: string,
  status: number,
) {
  return NextResponse.json<ConnectionTestError>(
    {
      success: false,
      connected: false,
      error: { code, message },
    },
    { status },
  );
}

type FailureStage = "request" | "response extraction" | "validation" | "serialization";

function logSafeFailure(stage: FailureStage, summary: string, error?: unknown) {
  console.error("[gemini-connection-test] failure", {
    provider: "gemini",
    stage,
    errorType: error instanceof Error ? error.name : "UnknownError",
    summary,
  });
}

export async function POST() {
  let configuration;
  try {
    configuration = getGeminiConfiguration();
  } catch (error) {
    if (!(error instanceof AiNotConfiguredError)) {
      throw error;
    }
    return errorResponse(
      "AI_NOT_CONFIGURED",
      "Gemini connection is not configured on the server.",
      503,
    );
  }
  const { client, model } = configuration;

  let stage: FailureStage = "request";

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: "Reply with only this exact text: GEMINI_CONNECTION_OK",
        },
      ],
      temperature: 0,
    });

    stage = "response extraction";
    const outputText = completion.choices[0]?.message?.content;

    stage = "validation";
    if (typeof outputText !== "string" || outputText.trim().length === 0) {
      logSafeFailure(stage, "The upstream response did not contain non-empty text.");
      return errorResponse(
        "AI_UPSTREAM_ERROR",
        "Gemini connection test failed. Please try again later.",
        502,
      );
    }

    stage = "serialization";
    return NextResponse.json<ConnectionTestSuccess>({
      success: true,
      data: {
        connected: true,
        provider: "gemini",
        model,
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      logSafeFailure(stage, "Gemini authentication failed.", error);
      return errorResponse(
        "AI_AUTHENTICATION_ERROR",
        "Gemini connection test could not authenticate.",
        502,
      );
    }
    if (error instanceof OpenAI.RateLimitError) {
      logSafeFailure(stage, "Gemini rate limit was reached.", error);
      return errorResponse(
        "AI_RATE_LIMITED",
        "Gemini connection test is rate limited. Please try again later.",
        429,
      );
    }
    logSafeFailure(stage, "The Gemini connection test could not complete.", error);
    return errorResponse(
      "AI_UPSTREAM_ERROR",
      "Gemini connection test failed. Please try again later.",
      502,
    );
  }
}
