import type { InterviewAnalysis } from "@/types/analysis";

const labels = { strong: "Strong match", moderate: "Moderate match", weak: "Weak match" } as const;

function Evidence({ resume, jd }: { resume: string[]; jd?: string[] }) {
  return <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-600">
    <p><span className="font-semibold text-zinc-700">Resume evidence:</span> {resume.length ? resume.join(" · ") : "No direct evidence found."}</p>
    {jd ? <p><span className="font-semibold text-zinc-700">JD evidence:</span> {jd.join(" · ")}</p> : null}
  </div>;
}

export function AnalysisResultPanel({ result }: { result: InterviewAnalysis }) {
  return <section className="grid min-w-0 gap-4">
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Interview analysis</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-lg font-semibold">Overall Match Score</h2><p className="mt-2 text-5xl font-semibold">{result.matchScore}</p></div>
        <p className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">{labels[result.matchLevel]}</p>
      </div>
      <p className="mt-4 break-words text-sm leading-6 text-zinc-700">{result.summary}</p>
    </article>
    <div className="grid min-w-0 gap-4 lg:grid-cols-3">
      <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h3 className="font-semibold">Strengths</h3><div className="mt-4 grid gap-4">{result.strengths.map((item, index) => <div key={`${item.title}-${index}`} className="min-w-0 border-t border-zinc-100 pt-3 first:border-0 first:pt-0"><h4 className="font-medium break-words">{item.title}</h4><p className="mt-1 break-words text-sm leading-6 text-zinc-700">{item.explanation}</p><Evidence resume={item.evidence.resumeEvidence} jd={item.evidence.jdEvidence} /></div>)}</div></article>
      <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h3 className="font-semibold">Potential Gaps</h3><div className="mt-4 grid gap-4">{result.gaps.length ? result.gaps.map((item, index) => <div key={`${item.requirement}-${index}`} className="min-w-0 border-t border-zinc-100 pt-3 first:border-0 first:pt-0"><div className="flex flex-wrap gap-2"><h4 className="font-medium break-words">{item.requirement}</h4><span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{item.status}</span></div><p className="mt-1 break-words text-sm leading-6 text-zinc-700">{item.explanation}</p><Evidence resume={item.resumeEvidence} jd={item.jdEvidence} /><p className="mt-2 break-words text-xs leading-5 text-zinc-600"><span className="font-semibold">Prepare:</span> {item.recommendation}</p></div>) : <p className="text-sm text-zinc-600">No material gaps identified.</p>}</div></article>
      <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h3 className="font-semibold">Interview Focus</h3><div className="mt-4 grid gap-4">{result.interviewFocus.map((item, index) => <div key={`${item.topic}-${index}`} className="min-w-0 border-t border-zinc-100 pt-3 first:border-0 first:pt-0"><h4 className="font-medium break-words">{item.topic}</h4><p className="mt-1 break-words text-sm leading-6 text-zinc-700">{item.reason}</p><p className="mt-2 break-words text-xs text-zinc-600"><span className="font-semibold">Requirement:</span> {item.relatedRequirement}</p><Evidence resume={item.resumeEvidence} /></div>)}</div></article>
    </div>
  </section>;
}
