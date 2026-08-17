import { SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

const localeNames: Record<SupportedLocale, string> = { "zh-TW": "繁體中文", "zh-CN": "简体中文", en: "English" };

export function Header({ locale, disabled, onLocaleChange }: { locale: SupportedLocale; disabled: boolean; onLocaleChange: (locale: SupportedLocale) => void }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-6 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
            {translate(locale, "phase")}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-950 sm:text-4xl">
            {translate(locale, "title")}
          </h1>
        </div>
        <div className="grid min-w-0 gap-3 md:justify-items-end">
          <p className="max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">{translate(locale, "description")}</p>
          <label className="flex max-w-full items-center gap-2 text-sm font-medium text-zinc-700">
            <span>{translate(locale, "language")}</span>
            <select aria-label={translate(locale, "language")} value={locale} disabled={disabled} onChange={(event) => onLocaleChange(event.target.value as SupportedLocale)} className="max-w-full rounded-md border border-zinc-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-zinc-100">
              {SUPPORTED_LOCALES.map((value) => <option key={value} value={value}>{localeNames[value]}</option>)}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
