import "server-only";

const JSON_CODE_FENCE = /^```json[\t ]*(?:\r?\n)?([\s\S]*?)(?:\r?\n)?```$/i;

export function normalizeStructuredJson(content: string): string {
  const withoutBom = content.startsWith("\uFEFF") ? content.slice(1) : content;
  const trimmed = withoutBom.trim();
  const fenced = JSON_CODE_FENCE.exec(trimmed);
  return fenced ? fenced[1].trim() : trimmed;
}
