import type { AnalysisResult } from "@/types/analysis";

export const mockAnalysisResult: AnalysisResult = {
  matchScore: 82,
  matchLevel: "Strong Match",
  strengths: [
    "2 years of commercial iOS experience",
    "Swift and MVVM",
    "REST API integration",
    "Payment-flow development",
  ],
  potentialGaps: [
    "SwiftUI is not mentioned",
    "Unit testing experience is unclear",
    "Combine experience is not shown",
  ],
  interviewFocus: [
    "ARC and memory management",
    "GCD and asynchronous programming",
    "MVVM architecture",
    "API error handling",
    "Payment-flow design",
  ],
};
