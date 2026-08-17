"use client";

import { useState } from "react";
import type { ParsedResume } from "@/types/resumeParse";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

type ResumeParseResultProps = {
  locale: SupportedLocale;
  parsedResume: ParsedResume | null;
  error: string | null;
};

export function ResumeParseResult({ locale, parsedResume, error }: ResumeParseResultProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950"
      >
        <h2 className="text-base font-semibold">{translate(locale, "parseFailed")}</h2>
        <p className="mt-2 text-sm leading-6">{error}</p>
      </section>
    );
  }

  if (!parsedResume) {
    return null;
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-emerald-800">
            {translate(locale, "parsedSuccessfully")}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-zinc-950">{translate(locale, "pdfFile")}</dt>
              <dd className="break-words">{parsedResume.fileName}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-950">{translate(locale, "extractedCharacters")}</dt>
              <dd>{parsedResume.characterCount.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          onClick={() => setIsPreviewOpen((currentValue) => !currentValue)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          aria-expanded={isPreviewOpen}
        >
          {translate(locale, isPreviewOpen ? "hidePreview" : "showPreview")}
        </button>
      </div>

      {isPreviewOpen ? (
        <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          {parsedResume.text}
        </pre>
      ) : null}
    </section>
  );
}
