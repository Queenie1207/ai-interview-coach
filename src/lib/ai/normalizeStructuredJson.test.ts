import { describe, expect, it } from "vitest";
import { normalizeStructuredJson } from "./normalizeStructuredJson";

describe("normalizeStructuredJson", () => {
  it("removes a UTF-8 BOM", () => expect(normalizeStructuredJson('\uFEFF{"ok":true}')).toBe('{"ok":true}'));
  it("trims surrounding whitespace", () => expect(normalizeStructuredJson('  \n {"ok":true} \t ')).toBe('{"ok":true}'));
  it("unwraps a complete JSON code fence", () => expect(normalizeStructuredJson('```json\n{"ok":true}\n```')).toBe('{"ok":true}'));
  it("does not extract JSON from arbitrary text", () => {
    const normalized = normalizeStructuredJson('Result: {"ok":true}');
    expect(normalized).toBe('Result: {"ok":true}');
    expect(() => JSON.parse(normalized)).toThrow();
  });
  it("does not unwrap an incomplete code fence", () => expect(normalizeStructuredJson('```json\n{"ok":true}')).toBe('```json\n{"ok":true}'));
});
