import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

type ConnectionTestSuccess = {
  success: true;
  data: {
    connected: true;
    message: "Groq connection successful";
  };
};

type ConnectionTestError = {
  success: false;
  connected: false;
  error: {
    code: "AI_NOT_CONFIGURED" | "AI_UPSTREAM_ERROR";
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
  console.error("[groq-connection-test] failure", {
    stage,
    errorType: error instanceof Error ? error.name : "UnknownError",
    summary,
  });
}

export async function POST() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim();

  if (!apiKey || !model) {
    return errorResponse(
      "AI_NOT_CONFIGURED",
      "Groq connection is not configured on the server.",
      503,
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
  });

  let stage: FailureStage = "request";

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: "Reply with only this exact text: GROQ_CONNECTION_OK",
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
        "Groq connection test failed. Please try again later.",
        502,
      );
    }

    stage = "serialization";
    return NextResponse.json<ConnectionTestSuccess>({
      success: true,
      data: {
        connected: true,
        message: "Groq connection successful",
      },
    });
  } catch (error) {
    logSafeFailure(stage, "The Groq connection test could not complete.", error);
    return errorResponse(
      "AI_UPSTREAM_ERROR",
      "Groq connection test failed. Please try again later.",
      502,
    );
  }
}
