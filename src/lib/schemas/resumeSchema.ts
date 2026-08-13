import { z } from "zod";

const nullableString = z.string().nullable();

export const ResumeSchema = z
  .object({
    profile: z
      .object({
        name: nullableString,
        title: nullableString,
        summary: nullableString,
        email: nullableString,
        phone: nullableString,
        location: nullableString,
        links: z.array(z.string()),
      })
      .strict(),
    skills: z.array(z.string()),
    languages: z.array(
      z.object({ name: z.string(), proficiency: nullableString }).strict(),
    ),
    experience: z.array(
      z
        .object({
          company: z.string(),
          role: z.string(),
          location: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          highlights: z.array(z.string()),
          technologies: z.array(z.string()),
        })
        .strict(),
    ),
    education: z.array(
      z
        .object({
          school: z.string(),
          degree: nullableString,
          field: nullableString,
          location: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          highlights: z.array(z.string()),
        })
        .strict(),
    ),
    projects: z.array(
      z
        .object({
          name: z.string(),
          description: nullableString,
          role: nullableString,
          technologies: z.array(z.string()),
          highlights: z.array(z.string()),
          link: nullableString,
        })
        .strict(),
    ),
    activities: z.array(
      z
        .object({
          title: z.string(),
          organization: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          highlights: z.array(z.string()),
        })
        .strict(),
    ),
    certifications: z.array(
      z.object({ name: z.string(), issuer: nullableString, date: nullableString }).strict(),
    ),
    additionalSections: z.array(
      z.object({ originalHeading: z.string(), items: z.array(z.string()) }).strict(),
    ),
  })
  .strict();

export type ResumeData = z.infer<typeof ResumeSchema>;
