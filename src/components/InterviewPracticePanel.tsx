import { AnswerEvaluationPanel } from "@/components/AnswerEvaluationPanel";
import { PracticeAnswerForm } from "@/components/PracticeAnswerForm";
import { categoryMessageKeys } from "@/components/InterviewQuestionCard";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { InterviewPreparation } from "@/types/preparation";
import type { InterviewAnswerEvaluation } from "@/types/practice";

type Question = InterviewPreparation["questions"][number];

export function InterviewPracticePanel({ locale, question, number, answer, submitting, error, evaluation, evaluationCurrent, onAnswerChange, onSubmit, onBack }: { locale: SupportedLocale; question: Question; number: number; answer: string; submitting: boolean; error: string | null; evaluation: InterviewAnswerEvaluation | null; evaluationCurrent: boolean; onAnswerChange: (answer: string) => void; onSubmit: () => void; onBack: () => void }) {
  return <section className="grid gap-6">
    <button type="button" onClick={onBack} className="w-fit rounded-md border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-50">← {translate(locale, "backToQuestions")}</button>
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700"><span>#{number}</span><span>{translate(locale, categoryMessageKeys[question.category])}</span><span>{translate(locale, question.difficulty as MessageKey)}</span></div>
      <h2 className="mt-3 text-xl font-semibold leading-8">{question.question}</h2>
      <div className="mt-5 grid gap-4 text-sm leading-6 md:grid-cols-2"><section><h3 className="font-semibold text-zinc-950">{translate(locale, "whyAsked")}</h3><p className="mt-1 text-zinc-700">{question.whyAsked}</p></section><section><h3 className="font-semibold text-zinc-950">{translate(locale, "relatedRequirement")}</h3><p className="mt-1 text-zinc-700">{question.relatedRequirement ?? translate(locale, "noEvidence")}</p></section></div>
    </article>
    <PracticeAnswerForm locale={locale} answer={answer} submitting={submitting} error={error} hasEvaluation={Boolean(evaluation)} onAnswerChange={onAnswerChange} onSubmit={onSubmit} />
    {evaluation && !evaluationCurrent ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-medium text-amber-900">{translate(locale, "answerChangedEvaluationStale")}</p> : null}
    {evaluation && evaluationCurrent ? <AnswerEvaluationPanel locale={locale} evaluation={evaluation} /> : null}
  </section>;
}
