import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { createSafeProviderDiagnostics } from "./prepareInterview";

describe("interview preparation provider diagnostics", () => {
  it("keeps only safe API error metadata", () => {
    const error = new OpenAI.APIError(
      400,
      { message: "Sensitive Candidate resume and full JD", secret: "API_KEY_VALUE" },
      "Sensitive prompt and provider response",
      new Headers({ "x-request-id": "request-123" }),
    );
    const diagnostics = createSafeProviderDiagnostics(error);

    expect(diagnostics).toEqual({
      errorClass: "APIError",
      status: 400,
      reason: "invalid_argument",
      code: "unavailable",
      type: "unavailable",
      param: "unavailable",
      requestId: "request-123",
    });
    const serialized = JSON.stringify(diagnostics);
    expect(serialized).not.toContain("Sensitive");
    expect(serialized).not.toContain("API_KEY_VALUE");
  });

  it("does not copy arbitrary error fields", () => {
    const diagnostics = createSafeProviderDiagnostics({ message: "private resume", code: "secret code" });
    expect(diagnostics).toEqual({ errorClass: "UnknownError", status: "unavailable", reason: "unavailable", code: "unavailable", type: "unavailable", param: "unavailable", requestId: "unavailable" });
    expect(JSON.stringify(diagnostics)).not.toContain("private resume");
  });

  it.each([
    ["Request contains an invalid response schema", "invalid_schema"],
    ["max_completion_tokens is not supported", "invalid_max_tokens"],
    ["reasoning_effort is not supported", "invalid_reasoning_effort"],
    ["request too large", "request_too_large"],
  ] as const)("classifies %s without retaining the message", (message, reason) => {
    const diagnostics = createSafeProviderDiagnostics(new OpenAI.APIError(400, undefined, message, new Headers()));
    expect(diagnostics.reason).toBe(reason);
    expect(JSON.stringify(diagnostics)).not.toContain(message);
  });
});
