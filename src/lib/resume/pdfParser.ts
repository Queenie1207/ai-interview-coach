import { PDFParse } from "pdf-parse";

export class EmptyPdfTextError extends Error {
  constructor() {
    super("No readable text was found in this PDF. It may be a scanned document.");
    this.name = "EmptyPdfTextError";
  }
}

function cleanPageText(pageText: string): string {
  const normalizedLines = pageText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim());

  const compactLines: string[] = [];

  for (const line of normalizedLines) {
    const previousLine = compactLines.at(-1);

    if (!line && !previousLine) {
      continue;
    }

    compactLines.push(line);
  }

  return compactLines.join("\n").trim();
}

export function cleanExtractedResumeText(pageTexts: string[]): string {
  return pageTexts
    .map(cleanPageText)
    .filter((pageText) => pageText.length > 0)
    .join("\n\n")
    .trim();
}

export async function extractResumeTextFromPdf(data: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const pageTexts =
      result.pages.length > 0 ? result.pages.map((page) => page.text) : [result.text];
    const text = cleanExtractedResumeText(pageTexts);

    if (!text) {
      throw new EmptyPdfTextError();
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
