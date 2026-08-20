import type { FormEvent } from "react";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

export function PracticeFollowUpPanel({ locale, question, originalAnswer, answer, open, submitting, error, completed, onOpen, onCancel, onAnswerChange, onSubmit }: { locale: SupportedLocale; question: string; originalAnswer: string; answer: string; open: boolean; submitting: boolean; error: string | null; completed: boolean; onOpen: () => void; onCancel: () => void; onAnswerChange: (value: string) => void; onSubmit: () => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit(); }
  return <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
    <h3 className="font-semibold text-amber-950">{translate(locale, "suggestedFollowUp")}</h3>
    <p className="mt-2 leading-7 text-amber-950">{question}</p>
    <section className="mt-4 rounded-md bg-white p-4"><h4 className="text-sm font-semibold text-zinc-600">{translate(locale, "originalAnswer")}</h4><p className="mt-2 whitespace-pre-wrap break-words text-zinc-800">{originalAnswer}</p></section>
    {completed ? <section className="mt-4 rounded-md bg-white p-4"><h4 className="text-sm font-semibold text-zinc-600">{translate(locale, "yourFollowUpAnswer")}</h4><p className="mt-2 whitespace-pre-wrap break-words text-zinc-800">{answer}</p></section> : null}
    {!open && !completed ? <button type="button" onClick={onOpen} className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">{translate(locale, "answerFollowUp")}</button> : null}
    {open && !completed ? <form onSubmit={submit} noValidate className="mt-4">
      <label htmlFor="practice-follow-up-answer" className="font-semibold">{translate(locale, "yourFollowUpAnswer")}</label>
      <textarea id="practice-follow-up-answer" value={answer} disabled={submitting} aria-invalid={Boolean(error)} onChange={(event) => onAnswerChange(event.target.value)} placeholder={translate(locale, "followUpAnswerPlaceholder")} className="mt-2 min-h-40 w-full resize-y rounded-md border border-zinc-300 bg-white p-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-zinc-100" />
      <div className="mt-2 flex justify-between gap-3 text-sm">{error ? <p role="alert" className="font-medium text-red-700">{error}</p> : <span />}<span className="text-zinc-600">{answer.length} / 3000</span></div>
      <div className="mt-4 flex flex-wrap gap-3"><button type="submit" disabled={submitting} className="rounded-md bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{translate(locale, submitting ? "evaluatingFinalAnswer" : "submitFollowUp")}</button><button type="button" disabled={submitting} onClick={onCancel} className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-semibold">{translate(locale, "cancelFollowUp")}</button></div>
      {submitting ? <p role="status" className="mt-3 text-sm font-medium">{translate(locale, "evaluatingFinalAnswer")}</p> : null}
    </form> : null}
  </section>;
}
