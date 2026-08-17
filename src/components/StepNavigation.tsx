import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";

import type { WorkflowStep } from "@/lib/workflow/workflowState";
export type { WorkflowStep } from "@/lib/workflow/workflowState";
const labels: MessageKey[] = ["stepResumeJob", "stepStructuredResume", "stepMatchAnalysis", "stepPreparation"];

export function StepNavigation({ locale, active, enabled, completed, onChange }: { locale: SupportedLocale; active: WorkflowStep; enabled: Record<WorkflowStep, boolean>; completed: Record<WorkflowStep, boolean>; onChange: (step: WorkflowStep) => void }) {
  return <nav aria-label="Workflow" className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
    <ol className="grid min-w-[42rem] grid-cols-4 gap-2">
      {labels.map((key, index) => { const step = (index + 1) as WorkflowStep; const unavailable = !enabled[step]; const current = active === step; return <li key={step}>
        <button type="button" disabled={unavailable} aria-current={current ? "step" : undefined} onClick={() => onChange(step)} className={`w-full rounded-md px-3 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${current ? "bg-teal-700 text-white" : completed[step] ? "bg-teal-50 text-teal-900" : "bg-zinc-50 text-zinc-600"} disabled:cursor-not-allowed disabled:opacity-45`}>
          <span className="block text-xs font-semibold opacity-75">{step}</span><span className="font-medium">{translate(locale, key)}</span><span className="sr-only"> {translate(locale, completed[step] ? "completed" : "unavailable")}</span>
        </button>
      </li>; })}
    </ol>
  </nav>;
}
