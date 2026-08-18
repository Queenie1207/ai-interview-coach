import type { FormEvent } from "react";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

export function PracticeAnswerForm({ locale, answer, submitting, error, hasEvaluation, onAnswerChange, onSubmit }: { locale: SupportedLocale; answer: string; submitting: boolean; error: string | null; hasEvaluation: boolean; onAnswerChange: (answer: string) => void; onSubmit: () => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(); }
  return <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
    <label htmlFor="practice-answer" className="text-lg font-semibold">{translate(locale, "yourAnswer")}</label>
    <textarea id="practice-answer" value={answer} disabled={submitting} aria-invalid={Boolean(error)} aria-describedby={error ? "practice-answer-error practice-answer-count" : "practice-answer-count"} onChange={(event) => onAnswerChange(event.target.value)} placeholder={translate(locale, "practiceAnswerPlaceholder")} className="mt-3 min-h-56 w-full resize-y rounded-md border border-zinc-300 p-3 leading-6 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-wait disabled:bg-zinc-100" />
    <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-sm"><div>{error ? <p id="practice-answer-error" role="alert" className="font-medium text-red-700">{error}</p> : null}</div><p id="practice-answer-count" className="ml-auto text-zinc-600">{answer.length} / 5000</p></div>
    <button type="submit" disabled={submitting} className="mt-4 w-full rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{translate(locale, submitting ? "evaluatingAnswer" : hasEvaluation ? "evaluateAgain" : "submitAnswer")}</button>
    {submitting ? <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-zinc-700">{translate(locale, "evaluatingAnswer")}</p> : null}
  </form>;
}
