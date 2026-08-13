import type { ResumeData } from "@/lib/schemas/resumeSchema";

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/gu, " ");
}

export function normalizeResumeData(data: ResumeData): ResumeData {
  const certificationNames = new Set(
    data.certifications.map((certification) => normalizeName(certification.name)),
  );

  return {
    ...data,
    activities: data.activities.filter(
      (activity) => !certificationNames.has(normalizeName(activity.title)),
    ),
  };
}
