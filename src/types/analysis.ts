export type AnalysisResult = {
  matchScore: number;
  matchLevel: string;
  strengths: string[];
  potentialGaps: string[];
  interviewFocus: string[];
};

export type AnalysisStatus = "idle" | "loading" | "success";
