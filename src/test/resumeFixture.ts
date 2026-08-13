import type { ResumeData } from "@/types/resume";

export const validResume: ResumeData = {
  profile: { name: "Example Candidate", title: "iOS Developer", summary: null, email: null, phone: null, location: null, links: [] },
  skills: ["Swift", "UIKit", "React Native"],
  languages: [{ name: "English", proficiency: "TOEIC 850" }],
  experience: [{ company: "Example Company", role: "Mobile Developer", location: null, startDate: "2022", endDate: "2024", highlights: ["Built payment and booking features."], technologies: [] }],
  education: [{ school: "Example University", degree: "Master", field: "Information Technology", location: null, startDate: null, endDate: null, highlights: [] }],
  projects: [], activities: [], certifications: [], additionalSections: [],
};
