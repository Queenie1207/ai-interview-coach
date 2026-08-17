import { InterviewQuestionCard } from "@/components/InterviewQuestionCard";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { InterviewPreparation } from "@/types/preparation";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";

export function InterviewPreparationPanel({ locale, preparation, loading, error, onGenerate }: { locale: SupportedLocale; preparation: InterviewPreparation | null; loading: boolean; error: string | null; onGenerate: () => void }) {
  return <section className="grid gap-6">
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">{translate(locale, "stepPreparation")}</h2><p className="mt-2 text-zinc-600">{translate(locale, "preparationIntro")}</p>{!preparation ? <button type="button" disabled={loading} onClick={onGenerate} className="mt-5 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">{translate(locale, loading ? "generatingPreparation" : error ? "retryPreparation" : "generatePreparation")}</button> : null}{error ? <p role="alert" className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}</div>
    {loading ? <LoadingAnalysis message={translate(locale, "generatingPreparation")} /> : null}
    {preparation ? <><section><h3 className="mb-3 text-lg font-semibold">{translate(locale, "interviewQuestions")}</h3><div className="grid gap-3">{preparation.questions.map((question, index) => <InterviewQuestionCard key={`${question.question}-${index}`} locale={locale} question={question} number={index + 1} initiallyOpen={index === 0} />)}</div></section>
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">{translate(locale, "reviewTopics")}</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{preparation.reviewTopics.map((topic, index) => <article key={`${topic.topic}-${index}`} className="rounded-md bg-zinc-50 p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-semibold">{topic.topic}</h4><span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-900">{translate(locale, topic.priority as MessageKey)}</span></div><p className="mt-2 text-sm text-zinc-700">{topic.reason}</p>{topic.relatedQuestions.length ? <><h5 className="mt-3 text-sm font-semibold">{translate(locale, "relatedQuestions")}</h5><ul className="mt-1 list-disc pl-5 text-sm">{topic.relatedQuestions.map((value, itemIndex) => <li key={`${value}-${itemIndex}`}>{value}</li>)}</ul></> : null}</article>)}</div></section></> : null}
  </section>;
}
