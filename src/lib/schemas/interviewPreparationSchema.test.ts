import { describe, expect, it } from "vitest";
import { InterviewPreparationSchema } from "./interviewPreparationSchema";
import { validPreparation } from "@/test/preparationFixture";

describe("InterviewPreparationSchema", () => {
  it("accepts valid data and null STAR", () => expect(InterviewPreparationSchema.safeParse(validPreparation).success).toBe(true));
  it("rejects fewer than five questions", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: validPreparation.questions.slice(0, 4) }).success).toBe(false));
  it("rejects more than ten questions", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: Array(11).fill(validPreparation.questions[0]) }).success).toBe(false));
  it.each([["category", "other"], ["difficulty", "expert"]])("rejects invalid %s", (field, value) => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: [{ ...validPreparation.questions[0], [field]: value }, ...validPreparation.questions.slice(1)] }).success).toBe(false));
  it("rejects invalid priority", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, reviewTopics: [{ ...validPreparation.reviewTopics[0], priority: "urgent" }] }).success).toBe(false));
  it("rejects unknown nested fields", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: [{ ...validPreparation.questions[0], secret: true }, ...validPreparation.questions.slice(1)] }).success).toBe(false));
  it("accepts null result", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: [{ ...validPreparation.questions[0], starOutline: { situation: null, task: null, action: [], result: null } }, ...validPreparation.questions.slice(1)] }).success).toBe(true));
  it("rejects incorrect evidence type", () => expect(InterviewPreparationSchema.safeParse({ ...validPreparation, questions: [{ ...validPreparation.questions[0], resumeEvidence: "Swift" }, ...validPreparation.questions.slice(1)] }).success).toBe(false));
});
