import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { MockAnswerEvaluation } from "@/types/practice";

function List({ values }: { values: string[] }) { return <ul className="mt-2 list-disc space-y-1 pl-5">{values.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}</ul>; }

export function MockAnswerEvaluationPanel({ locale, evaluation }: { locale: SupportedLocale; evaluation: MockAnswerEvaluation }) {
  const scores: Array<[MessageKey, number]> = [["relevanceScore", evaluation.relevanceScore], ["evidenceScore", evaluation.evidenceScore], ["structureScore", evaluation.structureScore], ["clarityScore", evaluation.clarityScore]];
  const sections: Array<[MessageKey, string[]]> = [["evaluationStrengths", evaluation.strengths], ["evaluationImprovements", evaluation.improvements], ["missingPoints", evaluation.missingPoints], ["suggestedOutline", evaluation.suggestedOutline]];
  return <section aria-live="polite" className="grid gap-5 rounded-lg border-2 border-dashed border-teal-300 bg-teal-50/40 p-5">
    <div><p className="text-sm font-bold uppercase tracking-wide text-teal-800">{translate(locale, "mockEvaluationPreview")}</p><p className="mt-1 text-sm text-zinc-700">{translate(locale, "mockEvaluationDisclaimer")}</p></div>
    <div className="rounded-lg bg-white p-5 text-center shadow-sm"><h3 className="font-semibold">{translate(locale, "overallScore")}</h3><p className="mt-2 text-4xl font-bold text-teal-800">{evaluation.overallScore} <span className="text-lg text-zinc-500">/ 100</span></p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{scores.map(([key, score]) => <div key={key} className="rounded-lg bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-zinc-600">{translate(locale, key)}</p><p className="mt-1 text-2xl font-bold">{score} / 100</p></div>)}</div>
    <section className="rounded-lg bg-white p-5 shadow-sm"><h3 className="font-semibold">{translate(locale, "overallFeedback")}</h3><p className="mt-2 leading-7 text-zinc-700">{evaluation.summary}</p></section>
    <div className="grid gap-4 md:grid-cols-2">{sections.map(([key, values]) => <section key={key} className="rounded-lg bg-white p-5 shadow-sm"><h3 className="font-semibold">{translate(locale, key)}</h3><List values={values} /></section>)}</div>
    <section className="rounded-lg bg-white p-5 shadow-sm"><h3 className="font-semibold">{translate(locale, "improvedAnswer")}</h3><p className="mt-1 text-xs font-medium text-amber-800">{translate(locale, "mockExampleLabel")}</p><p className="mt-3 whitespace-pre-wrap break-words leading-7 text-zinc-700">{evaluation.improvedAnswer}</p></section>
    {evaluation.needsFollowUp && evaluation.suggestedFollowUp ? <section className="rounded-lg bg-white p-5 shadow-sm"><h3 className="font-semibold">{translate(locale, "suggestedFollowUp")}</h3><p className="mt-2 leading-7 text-zinc-700">{evaluation.suggestedFollowUp}</p></section> : null}
  </section>;
}
