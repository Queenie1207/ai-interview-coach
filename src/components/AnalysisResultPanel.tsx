import type { AnalysisResult } from "@/types/analysis";

type AnalysisResultPanelProps = {
  result: AnalysisResult;
};

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function AnalysisResultPanel({ result }: AnalysisResultPanelProps) {
  return (
    <section className="grid gap-4">
      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Overall Match Score
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-5xl font-semibold text-zinc-950">{result.matchScore}</p>
          <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
            {result.matchLevel}
          </p>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        <ResultList title="Strengths" items={result.strengths} />
        <ResultList title="Potential Gaps" items={result.potentialGaps} />
        <ResultList title="Likely Interview Focus" items={result.interviewFocus} />
      </div>
    </section>
  );
}
