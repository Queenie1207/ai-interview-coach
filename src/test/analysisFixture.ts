import type { InterviewAnalysis } from "@/types/analysis";

export const validAnalysis: InterviewAnalysis = {
  matchScore: 82, matchLevel: "strong", summary: "The candidate directly matches several core mobile requirements.",
  strengths: [{ title: "Swift experience", explanation: "The resume shows direct Swift experience.", evidence: { resumeEvidence: ["Swift"], jdEvidence: ["Strong Swift skills required"] } }],
  gaps: [{ requirement: "Unit testing", status: "missing", explanation: "No testing evidence appears.", jdEvidence: ["Experience with unit testing"], resumeEvidence: [], recommendation: "Prepare examples or acknowledge the gap." }],
  interviewFocus: [{ topic: "Swift architecture", reason: "This is a core requirement.", relatedRequirement: "Strong Swift skills required", resumeEvidence: ["Swift"] }],
};
