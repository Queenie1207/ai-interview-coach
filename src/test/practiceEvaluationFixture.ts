import type { InterviewAnswerEvaluation, InterviewAnswerEvaluationRequest } from "@/types/practice";

export const validPracticeEvaluationRequest: InterviewAnswerEvaluationRequest = {
  question: "How did you apply Swift in a production project?", category: "technical", difficulty: "intermediate", whyAsked: "Swift is a core requirement.", relatedRequirement: "Strong Swift skills", resumeEvidence: ["Built an iOS application with Swift"], jdEvidence: ["Strong Swift skills"], answerOutline: ["Explain the context", "Describe the technical decision"], answer: "I used Swift to build typed networking and testable presentation layers for an iOS application.", outputLanguage: "en",
};

export const validPracticeEvaluation: InterviewAnswerEvaluation = {
  overallScore: 82, summary: "The answer is relevant and clear but would benefit from more concrete evidence.", strengths: ["Directly addresses Swift usage"], improvements: ["Explain a technical trade-off"], missingPoints: ["A concrete outcome"], improvedAnswer: "I used Swift to build typed networking and testable presentation layers. I would add the specific trade-off and outcome from the project.", needsFollowUp: true, suggestedFollowUpQuestion: "What technical trade-off did you make?",
  dimensions: { relevance: { score: 88, feedback: "Directly relevant." }, evidence: { score: 72, feedback: "Needs a concrete outcome." }, structure: { score: 84, feedback: "Easy to follow." }, clarity: { score: 85, feedback: "Clear and concise." } }, starEvaluation: null,
};
