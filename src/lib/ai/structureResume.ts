import "server-only";
import { getGroqConfiguration } from "@/lib/ai/groqClient";
import { RESUME_STRUCTURE_SYSTEM_PROMPT } from "@/lib/prompts/resumeStructurePrompt";
import { ResumeSchema, type ResumeData } from "@/lib/schemas/resumeSchema";
import { normalizeResumeData } from "@/lib/resume/normalizeResumeData";

export class AiUpstreamError extends Error {}
export class AiInvalidOutputError extends Error {}

export const resumeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["profile", "skills", "languages", "experience", "education", "projects", "activities", "certifications", "additionalSections"],
  properties: {
    profile: object({ name: nullable(), title: nullable(), summary: nullable(), email: nullable(), phone: nullable(), location: nullable(), links: array(string()) }),
    skills: array(string()),
    languages: array(object({ name: string(), proficiency: nullable() })),
    experience: array(object({ company: string(), role: string(), location: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()), technologies: array(string()) })),
    education: array(object({ school: string(), degree: nullable(), field: nullable(), location: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()) })),
    projects: array(object({ name: string(), description: nullable(), role: nullable(), technologies: array(string()), highlights: array(string()), link: nullable() })),
    activities: array(object({ title: string(), organization: nullable(), startDate: nullable(), endDate: nullable(), highlights: array(string()) })),
    certifications: array(object({ name: string(), issuer: nullable(), date: nullable() })),
    additionalSections: array(object({ originalHeading: string(), items: array(string()) })),
  },
} as const;

function string() { return { type: "string" } as const; }
function nullable() { return { type: ["string", "null"] } as const; }
function array(items: object) { return { type: "array", items } as const; }
function object(properties: Record<string, object>) {
  return { type: "object", additionalProperties: false, properties, required: Object.keys(properties) } as const;
}

export async function structureResume(extractedText: string): Promise<ResumeData> {
  const { client, model } = getGroqConfiguration();
  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: RESUME_STRUCTURE_SYSTEM_PROMPT },
        { role: "user", content: extractedText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "resume_data", strict: true, schema: resumeJsonSchema },
      },
    });
  } catch {
    throw new AiUpstreamError("The AI provider request failed.");
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new AiInvalidOutputError("The AI response was empty.");
  let value: unknown;
  try { value = JSON.parse(content); } catch { throw new AiInvalidOutputError("The AI response was not JSON."); }
  const parsed = ResumeSchema.safeParse(value);
  if (!parsed.success) throw new AiInvalidOutputError("The AI response did not match ResumeSchema.");
  return normalizeResumeData(parsed.data);
}
