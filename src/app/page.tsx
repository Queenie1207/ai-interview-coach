"use client";

import { FormEvent, useState } from "react";
import { AnalysisResultPanel } from "@/components/AnalysisResultPanel";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { Header } from "@/components/Header";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResumeParseResult } from "@/components/ResumeParseResult";
import { ResumeUploader } from "@/components/ResumeUploader";
import { mockAnalysisResult } from "@/data/mockAnalysis";
import type { AnalysisResult, AnalysisStatus } from "@/types/analysis";
import type { ParsedResume, ResumeParseResponse } from "@/types/resumeParse";
import { validateResumeFile } from "@/utils/fileValidation";

type FormErrors = {
  resume?: string;
  jobDescription?: string;
};

type JobInputs = {
  companyName: string;
  positionName: string;
  jobDescription: string;
};

const MIN_JOB_DESCRIPTION_LENGTH = 50;

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobInputs, setJobInputs] = useState<JobInputs>({
    companyName: "",
    positionName: "",
    jobDescription: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);

  const isLoading = status === "loading";

  function handleResumeSelect(file: File) {
    const fileError = validateResumeFile(file);

    if (fileError) {
      setErrors((currentErrors) => ({ ...currentErrors, resume: fileError }));
      return;
    }

    setResumeFile(file);
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setStatus("idle");
    setErrors((currentErrors) => ({ ...currentErrors, resume: undefined }));
  }

  function handleResumeRemove() {
    setResumeFile(null);
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setStatus("idle");
    setErrors((currentErrors) => ({ ...currentErrors, resume: undefined }));
  }

  function updateJobInput(field: keyof JobInputs, value: string) {
    setJobInputs((currentInputs) => ({ ...currentInputs, [field]: value }));

    if (field === "jobDescription" && value.trim().length >= MIN_JOB_DESCRIPTION_LENGTH) {
      setErrors((currentErrors) => ({ ...currentErrors, jobDescription: undefined }));
    }
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {};
    const trimmedJobDescription = jobInputs.jobDescription.trim();

    if (!resumeFile) {
      nextErrors.resume = "Resume PDF is required.";
    }

    if (!trimmedJobDescription) {
      nextErrors.jobDescription = "Job Description is required.";
    } else if (trimmedJobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) {
      nextErrors.jobDescription = `Job Description must be at least ${MIN_JOB_DESCRIPTION_LENGTH} characters.`;
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (nextErrors.resume || nextErrors.jobDescription) {
      return;
    }

    if (!resumeFile) {
      return;
    }

    setAnalysisResult(null);
    setParsedResume(null);
    setResumeParseError(null);
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      const responseBody = (await response.json()) as ResumeParseResponse;

      if (!responseBody.success) {
        setResumeParseError(responseBody.error.message);
        setStatus("idle");
        return;
      }

      setParsedResume(responseBody.data);
      setAnalysisResult(mockAnalysisResult);
      setStatus("success");
    } catch {
      setResumeParseError("We could not parse this resume. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-6 sm:px-8 sm:py-8">
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ResumeUploader
              resumeFile={resumeFile}
              error={errors.resume}
              disabled={isLoading}
              onFileSelect={handleResumeSelect}
              onRemove={handleResumeRemove}
            />
            <JobDescriptionForm
              companyName={jobInputs.companyName}
              positionName={jobInputs.positionName}
              jobDescription={jobInputs.jobDescription}
              jobDescriptionError={errors.jobDescription}
              disabled={isLoading}
              onCompanyNameChange={(value) => updateJobInput("companyName", value)}
              onPositionNameChange={(value) => updateJobInput("positionName", value)}
              onJobDescriptionChange={(value) => updateJobInput("jobDescription", value)}
            />
          </div>

          <AnalyzeButton disabled={isLoading} />
        </form>

        {isLoading ? <LoadingAnalysis message="Parsing resume PDF..." /> : null}
        <ResumeParseResult parsedResume={parsedResume} error={resumeParseError} />
        {status === "success" && analysisResult ? (
          <AnalysisResultPanel result={analysisResult} />
        ) : null}
      </main>
    </div>
  );
}
