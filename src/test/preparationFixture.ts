import type { InterviewPreparation } from "@/types/preparation";

const question: InterviewPreparation["questions"][number] = {
  category: "technical", difficulty: "intermediate", question: "How did you apply Swift?", whyAsked: "Swift is required.", relatedRequirement: "Strong Swift skills", resumeEvidence: ["Swift"], jdEvidence: ["Strong Swift skills"], answerOutline: ["Describe the context", "Explain your contribution"], starOutline: null, followUps: ["What trade-offs did you consider?"],
};
export const validPreparation: InterviewPreparation = {
  questions: Array.from({ length: 5 }, (_, index) => ({ ...question, question: `${question.question} ${index + 1}` })),
  reviewTopics: [{ topic: "Swift", reason: "Core requirement", priority: "high", relatedQuestions: ["How did you apply Swift? 1"] }],
};
