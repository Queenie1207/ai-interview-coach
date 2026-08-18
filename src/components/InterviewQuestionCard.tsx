"use client";
import { useState } from "react";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { InterviewPreparation } from "@/types/preparation";

type Question = InterviewPreparation["questions"][number];
export const categoryMessageKeys: Record<Question["category"], MessageKey> = { introduction: "categoryIntroduction", resume: "categoryResume", project: "categoryProject", technical: "categoryTechnical", behavioral: "categoryBehavioral", gap: "categoryGap", situational: "categorySituational" };
function List({ values, empty }: { values: string[]; empty?: string }) { return values.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{values.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}</ul> : <p className="mt-2 text-zinc-500">{empty}</p>; }

export function InterviewQuestionCard({ locale, question, number, initiallyOpen, onPractice }: { locale: SupportedLocale; question: Question; number: number; initiallyOpen: boolean; onPractice: () => void }) {
  const [open, setOpen] = useState(initiallyOpen); const panelId = `question-${number}-details`;
  return <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
    <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)} className="flex w-full items-start justify-between gap-4 p-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500">
      <span><span className="mb-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-teal-700"><span>#{number}</span><span>{translate(locale, categoryMessageKeys[question.category])}</span><span>{translate(locale, question.difficulty as MessageKey)}</span></span><span className="font-semibold text-zinc-950">{question.question}</span></span><span aria-hidden="true" className="text-xl">{open ? "−" : "+"}</span>
    </button>
    {open ? <div id={panelId} className="grid gap-5 border-t border-zinc-200 p-5 text-sm leading-6 text-zinc-700">
      <section><h4 className="font-semibold text-zinc-950">{translate(locale, "whyAsked")}</h4><p className="mt-1">{question.whyAsked}</p></section>
      {question.relatedRequirement ? <section><h4 className="font-semibold text-zinc-950">{translate(locale, "relatedRequirement")}</h4><p className="mt-1">{question.relatedRequirement}</p></section> : null}
      <section><h4 className="font-semibold text-zinc-950">{translate(locale, "resumeEvidence")}</h4><List values={question.resumeEvidence} empty={translate(locale, "noEvidence")} /></section>
      <section><h4 className="font-semibold text-zinc-950">{translate(locale, "jdEvidence")}</h4><List values={question.jdEvidence} empty={translate(locale, "noEvidence")} /></section>
      <section><h4 className="font-semibold text-zinc-950">{translate(locale, "answerOutline")}</h4><List values={question.answerOutline} /></section>
      {question.starOutline ? <section><h4 className="font-semibold text-zinc-950">{translate(locale, "starOutline")}</h4><dl className="mt-2 grid gap-2"><div><dt className="font-medium">{translate(locale, "situation")}</dt><dd>{question.starOutline.situation ?? translate(locale, "noEvidence")}</dd></div><div><dt className="font-medium">{translate(locale, "task")}</dt><dd>{question.starOutline.task ?? translate(locale, "noEvidence")}</dd></div><div><dt className="font-medium">{translate(locale, "action")}</dt><dd><List values={question.starOutline.action} empty={translate(locale, "noEvidence")} /></dd></div><div><dt className="font-medium">{translate(locale, "result")}</dt><dd>{question.starOutline.result ?? translate(locale, "noEvidence")}</dd></div></dl></section> : null}
      <section><h4 className="font-semibold text-zinc-950">{translate(locale, "followUps")}</h4><List values={question.followUps} /></section>
      <button type="button" onClick={onPractice} className="w-full rounded-md bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 sm:w-fit">{translate(locale, "practiceQuestion")}</button>
    </div> : null}
  </article>;
}
