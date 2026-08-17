import type { ResumeData } from "@/types/resume";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

type Props = { locale: SupportedLocale; resume: ResumeData | null; error: string | null };

function Tags({ items }: { items: string[] }) {
  return <div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800">{item}</span>)}</div>;
}

function Entries({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 grid gap-4">{children}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold text-zinc-950">{title}</h3>{children}</section>;
}

function Details({ values }: { values: Array<string | null> }) {
  const text = values.filter(Boolean).join(" · ");
  return text ? <p className="mt-1 text-sm text-zinc-600">{text}</p> : null;
}

function Bullets({ items }: { items: string[] }) {
  return items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">{items.map((item) => <li key={item}>{item}</li>)}</ul> : null;
}

export function StructuredResumeResult({ locale, resume, error }: Props) {
  if (error) return <section role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-950"><h2 className="font-semibold">{translate(locale, "structureFailed")}</h2><p className="mt-2 text-sm leading-6">{error}</p></section>;
  if (!resume) return null;
  const profileValues = [resume.profile.email, resume.profile.phone, resume.profile.location];

  return <section className="grid min-w-0 gap-4" aria-labelledby="structured-resume-title">
    <div><p className="text-sm font-medium uppercase tracking-wide text-teal-700">Phase 2B · {translate(locale, "structuredOutput")}</p><h2 id="structured-resume-title" className="mt-1 text-2xl font-semibold">{translate(locale, "structuredResume")}</h2></div>
    {(Object.values(resume.profile).some((value) => Array.isArray(value) ? value.length : value)) && <Section title={translate(locale, "profile")}><div className="mt-3"><p className="text-xl font-semibold">{resume.profile.name ?? translate(locale, "profile")}</p>{resume.profile.title && <p className="mt-1 text-zinc-700">{resume.profile.title}</p>}<Details values={profileValues} />{resume.profile.summary && <p className="mt-3 text-sm leading-6 text-zinc-700">{resume.profile.summary}</p>}<Tags items={resume.profile.links} /></div></Section>}
    {resume.skills.length > 0 && <Section title={translate(locale, "skills")}><Tags items={resume.skills} /></Section>}
    {resume.languages.length > 0 && <Section title={translate(locale, "languages")}><Entries>{resume.languages.map((item) => <div key={`${item.name}-${item.proficiency}`}><p className="font-semibold">{item.name}</p>{item.proficiency && <p className="text-sm text-zinc-600">{item.proficiency}</p>}</div>)}</Entries></Section>}
    {resume.experience.length > 0 && <Section title={translate(locale, "experience")}><Entries>{resume.experience.map((item, index) => <article key={`${item.company}-${item.role}-${index}`}><p className="font-semibold">{item.role} · {item.company}</p><Details values={[item.location, item.startDate, item.endDate]} /><Bullets items={item.highlights} /><Tags items={item.technologies} /></article>)}</Entries></Section>}
    {resume.education.length > 0 && <Section title={translate(locale, "education")}><Entries>{resume.education.map((item, index) => <article key={`${item.school}-${index}`}><p className="font-semibold">{item.school}</p><Details values={[item.degree, item.field, item.location, item.startDate, item.endDate]} /><Bullets items={item.highlights} /></article>)}</Entries></Section>}
    {resume.projects.length > 0 && <Section title={translate(locale, "projects")}><Entries>{resume.projects.map((item, index) => <article key={`${item.name}-${index}`}><p className="font-semibold">{item.name}</p><Details values={[item.role, item.link]} />{item.description && <p className="mt-2 text-sm leading-6 text-zinc-700">{item.description}</p>}<Bullets items={item.highlights} /><Tags items={item.technologies} /></article>)}</Entries></Section>}
    {resume.activities.length > 0 && <Section title={translate(locale, "activities")}><Entries>{resume.activities.map((item, index) => <article key={`${item.title}-${index}`}><p className="font-semibold">{item.title}</p><Details values={[item.organization, item.startDate, item.endDate]} /><Bullets items={item.highlights} /></article>)}</Entries></Section>}
    {resume.certifications.length > 0 && <Section title={translate(locale, "certifications")}><Entries>{resume.certifications.map((item, index) => <article key={`${item.name}-${index}`}><p className="font-semibold">{item.name}</p><Details values={[item.issuer, item.date]} /></article>)}</Entries></Section>}
    {resume.additionalSections.length > 0 && <Section title={translate(locale, "additionalSections")}><Entries>{resume.additionalSections.map((item, index) => <article key={`${item.originalHeading}-${index}`}><p className="font-semibold">{item.originalHeading}</p><Bullets items={item.items} /></article>)}</Entries></Section>}
  </section>;
}
