type AnalyzeButtonProps = {
  disabled: boolean;
  label: string;
};

export function AnalyzeButton({ disabled, label }: AnalyzeButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-md bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-500"
    >
      {label}
    </button>
  );
}
