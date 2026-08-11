export function LoadingAnalysis() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-teal-200 bg-teal-50 p-5 text-teal-950"
    >
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
        <p className="font-medium">Analyzing Resume and Job Description...</p>
      </div>
    </div>
  );
}
