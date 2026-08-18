export type MockAnswerEvaluation = {
  overallScore: number;
  relevanceScore: number;
  evidenceScore: number;
  structureScore: number;
  clarityScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingPoints: string[];
  suggestedOutline: string[];
  improvedAnswer: string;
  needsFollowUp: boolean;
  suggestedFollowUp: string | null;
};
