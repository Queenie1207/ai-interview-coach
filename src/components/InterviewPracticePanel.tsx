import { AnswerEvaluationPanel } from "@/components/AnswerEvaluationPanel";
import { PracticeAnswerForm } from "@/components/PracticeAnswerForm";
import { PracticeFollowUpPanel } from "@/components/PracticeFollowUpPanel";
import { categoryMessageKeys } from "@/components/InterviewQuestionCard";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { InterviewPreparation } from "@/types/preparation";
import type { FollowUpStopReason, FollowUpTurn, InterviewAnswerEvaluation } from "@/types/practice";

type Question = InterviewPreparation["questions"][number];

type InterviewPracticePanelProps = {
  locale: SupportedLocale;
  question: Question;
  number: number;
  answer: string;
  submitting: boolean;
  error: string | null;
  evaluation: InterviewAnswerEvaluation | null;
  evaluationCurrent: boolean;
  followUpHistory: FollowUpTurn[];
  pendingFollowUpQuestion: string | null;
  followUpAnswer: string;
  followUpSubmitting: boolean;
  followUpError: string | null;
  finalEvaluation: InterviewAnswerEvaluation | null;
  stopReason: FollowUpStopReason | null;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onFollowUpAnswerChange: (answer: string) => void;
  onFollowUpSubmit: () => void;
  onFollowUpFinish: () => void;
};

const stopReasonKeys: Record<FollowUpStopReason, MessageKey> = {
  answer_complete: "followUpStopAnswerComplete",
  max_rounds_reached: "followUpStopMaxRounds",
  user_ended: "followUpStopUserEnded",
  no_material_gap: "followUpStopNoMaterialGap",
  duplicate_follow_up: "followUpStopDuplicate",
};

export function InterviewPracticePanel(props: InterviewPracticePanelProps) {
  const { locale, question, number, answer, submitting, error, evaluation, evaluationCurrent, followUpHistory, pendingFollowUpQuestion, followUpAnswer, followUpSubmitting, followUpError, finalEvaluation, stopReason, onAnswerChange, onSubmit, onBack, onFollowUpAnswerChange, onFollowUpSubmit, onFollowUpFinish } = props;

  return <section className="grid min-w-0 gap-6">
    <button type="button" onClick={onBack} className="w-fit rounded-md border border-zinc-300 bg-white px-4 py-2 font-semibold">← {translate(locale, "backToQuestions")}</button>
    <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700"><span>#{number}</span><span>{translate(locale, categoryMessageKeys[question.category])}</span><span>{translate(locale, question.difficulty as MessageKey)}</span></div>
      <h2 className="mt-3 break-words text-xl font-semibold leading-8">{question.question}</h2>
    </article>
    <PracticeAnswerForm locale={locale} answer={answer} submitting={submitting} error={error} hasEvaluation={Boolean(evaluation)} onAnswerChange={onAnswerChange} onSubmit={onSubmit} />
    {evaluation && !evaluationCurrent ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4">{translate(locale, "answerChangedEvaluationStale")}</p> : null}
    {evaluation && evaluationCurrent ? <AnswerEvaluationPanel locale={locale} evaluation={evaluation} titleKey="initialEvaluation" showFollowUp={false} /> : null}
    {evaluationCurrent && (followUpHistory.length > 0 || pendingFollowUpQuestion) ? <PracticeFollowUpPanel locale={locale} history={followUpHistory} pendingQuestion={pendingFollowUpQuestion} answer={followUpAnswer} submitting={followUpSubmitting} error={followUpError} onAnswerChange={onFollowUpAnswerChange} onSubmit={onFollowUpSubmit} onFinish={onFollowUpFinish} /> : null}
    {finalEvaluation && evaluationCurrent ? <section className="grid gap-3"><AnswerEvaluationPanel locale={locale} evaluation={finalEvaluation} titleKey="finalEvaluation" showFollowUp={false} />{stopReason ? <p role="status" className="rounded-lg border border-teal-200 bg-teal-50 p-4 font-medium text-teal-950">{translate(locale, stopReasonKeys[stopReason])}</p> : null}</section> : null}
  </section>;
}
