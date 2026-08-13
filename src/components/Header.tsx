export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-6 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            Phase 2B
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-950 sm:text-4xl">
            AI Interview Coach
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
          Upload a resume PDF and review the structured information extracted by AI. JD matching remains a future phase.
        </p>
      </div>
    </header>
  );
}
