import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

type JobDescriptionFormProps = {
  locale: SupportedLocale;
  companyName: string;
  positionName: string;
  jobDescription: string;
  jobDescriptionError?: string;
  disabled: boolean;
  onCompanyNameChange: (value: string) => void;
  onPositionNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
};

export function JobDescriptionForm({
  locale,
  companyName,
  positionName,
  jobDescription,
  jobDescriptionError,
  disabled,
  onCompanyNameChange,
  onPositionNameChange,
  onJobDescriptionChange,
}: JobDescriptionFormProps) {
  const characterCount = jobDescription.length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">{translate(locale, "jobDescription")}</h2>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">{translate(locale, "companyName")}</span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            disabled={disabled}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:bg-zinc-100"
            placeholder={translate(locale, "optional")}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-700">{translate(locale, "positionName")}</span>
          <input
            type="text"
            value={positionName}
            onChange={(event) => onPositionNameChange(event.target.value)}
            disabled={disabled}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:bg-zinc-100"
            placeholder={translate(locale, "optional")}
          />
        </label>

        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-4 text-sm font-medium text-zinc-700">
            <span>{translate(locale, "jobDescription")}</span>
            <span className="font-normal text-zinc-500">{characterCount} {translate(locale, "characters")}</span>
          </span>
          <textarea
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            disabled={disabled}
            rows={10}
            required
            aria-invalid={jobDescriptionError ? "true" : "false"}
            aria-describedby={jobDescriptionError ? "job-description-error" : undefined}
            className="min-h-64 resize-y rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:bg-zinc-100"
            placeholder={translate(locale, "jdPlaceholder")}
          />
        </label>

        {jobDescriptionError ? (
          <p id="job-description-error" className="text-sm font-medium text-red-700">
            {jobDescriptionError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
