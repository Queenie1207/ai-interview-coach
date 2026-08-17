"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnalysisResultPanel } from "@/components/AnalysisResultPanel";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { Header } from "@/components/Header";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResumeParseResult } from "@/components/ResumeParseResult";
import { ResumeUploader } from "@/components/ResumeUploader";
import { StructuredResumeResult } from "@/components/StructuredResumeResult";
import type { AnalysisStatus, InterviewAnalysis, InterviewAnalysisResponse } from "@/types/analysis";
import type { ParsedResume, ResumeParseResponse } from "@/types/resumeParse";
import type { ResumeData, ResumeStructureResponse } from "@/types/resume";
import { validateResumeFile } from "@/utils/fileValidation";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, resolveInitialLocale, type SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";

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
  const [analysisResult, setAnalysisResult] = useState<InterviewAnalysis | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);
  const [structuredResume, setStructuredResume] = useState<ResumeData | null>(null);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Parsing resume PDF...");
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [languageChangeNotice, setLanguageChangeNotice] = useState(false);

  const isLoading = status === "loading";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLocale(resolveInitialLocale(localStorage.getItem(LOCALE_STORAGE_KEY), navigator.language));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function localizedApiError(code: string, fallback: MessageKey): string {
    const keys: Record<string, MessageKey> = {
      FILE_REQUIRED: "resumeRequired", INVALID_FILE_TYPE: "invalidPdf", FILE_TOO_LARGE: "pdfTooLarge",
      AI_NOT_CONFIGURED: "aiNotConfigured", AI_AUTHENTICATION_ERROR: "aiAuthentication", AI_RATE_LIMITED: "aiRateLimited",
      AI_UPSTREAM_ERROR: "aiUpstream", AI_EMPTY_OUTPUT: "aiInvalidOutput", AI_INVALID_JSON: "aiInvalidOutput", AI_INVALID_OUTPUT: "aiInvalidOutput",
    };
    return translate(locale, keys[code] ?? fallback);
  }

  function handleLocaleChange(nextLocale: SupportedLocale) {
    if (isLoading || nextLocale === locale) return;
    setLocale(nextLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setErrors({});
    if (analysisResult) { setAnalysisResult(null); setStatus("idle"); setLanguageChangeNotice(true); }
  }

  function handleResumeSelect(file: File) {
    const fileError = validateResumeFile(file);

    if (fileError) {
      const message = file.size > 10 * 1024 * 1024 ? "pdfTooLarge" : "invalidPdf";
      setErrors((currentErrors) => ({ ...currentErrors, resume: translate(locale, message) }));
      return;
    }

    setResumeFile(file);
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setStructuredResume(null);
    setStructureError(null);
    setAnalysisError(null);
    setLanguageChangeNotice(false);
    setStatus("idle");
    setErrors((currentErrors) => ({ ...currentErrors, resume: undefined }));
  }

  function handleResumeRemove() {
    setResumeFile(null);
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setStructuredResume(null);
    setStructureError(null);
    setAnalysisError(null);
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
      nextErrors.resume = translate(locale, "resumeRequired");
    }

    if (!trimmedJobDescription) {
      nextErrors.jobDescription = translate(locale, "jdRequired");
    } else if (trimmedJobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) {
      nextErrors.jobDescription = translate(locale, "jdTooShort");
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
    setAnalysisError(null);
    setResumeParseError(null);
    setStructureError(null);
    setStatus("loading");

    let resumeForAnalysis = structuredResume;

    if (!resumeForAnalysis) {
      let extractedText: string;
      try {
        setParsedResume(null);
        setLoadingMessage(translate(locale, "readingPdf"));
        const formData = new FormData();
        formData.append("resume", resumeFile);

        const response = await fetch("/api/resume/parse", {
          method: "POST",
          body: formData,
        });
        const responseBody = (await response.json()) as ResumeParseResponse;

        if (!responseBody.success) {
          setResumeParseError(localizedApiError(responseBody.error.code, "parseUnknown"));
          setStatus("idle");
          return;
        }

        setParsedResume(responseBody.data);
        extractedText = responseBody.data.text;
      } catch {
        setResumeParseError(translate(locale, "parseUnknown"));
        setStatus("idle");
        return;
      }

      try {
        setLoadingMessage(translate(locale, "structuringResume"));
        const structureResponse = await fetch("/api/resume/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedText }),
        });
        const structureBody = (await structureResponse.json()) as ResumeStructureResponse;
        if (!structureBody.success) {
          setStructureError(localizedApiError(structureBody.error.code, "structureUnknown"));
          setStatus("idle");
          return;
        }
        setStructuredResume(structureBody.data);
        resumeForAnalysis = structureBody.data;
      } catch {
        setStructureError(translate(locale, "structureUnknown"));
        setStatus("idle");
        return;
      }
    }

    try {
      setLoadingMessage(translate(locale, "comparingRequirements"));
      const response = await fetch("/api/interview/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeForAnalysis, ...jobInputs, jobDescription: jobInputs.jobDescription.trim(), outputLanguage: locale }) });
      const body = (await response.json()) as InterviewAnalysisResponse;
      if (!body.success) { setAnalysisError(localizedApiError(body.error.code, "analysisUnknown")); setStatus("idle"); return; }
      setAnalysisResult(body.data);
      setStatus("success");
    } catch {
      setAnalysisError(translate(locale, "analysisUnknown"));
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <Header locale={locale} disabled={isLoading} onLocaleChange={handleLocaleChange} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-6 sm:px-8 sm:py-8">
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ResumeUploader
              locale={locale}
              resumeFile={resumeFile}
              error={errors.resume}
              disabled={isLoading}
              onFileSelect={handleResumeSelect}
              onRemove={handleResumeRemove}
            />
            <JobDescriptionForm
              locale={locale}
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

          <AnalyzeButton disabled={isLoading} label={translate(locale, "startAnalysis")} />
        </form>

        {isLoading ? <LoadingAnalysis message={loadingMessage} /> : null}
        <ResumeParseResult locale={locale} parsedResume={parsedResume} error={resumeParseError} />
        <StructuredResumeResult locale={locale} resume={structuredResume} error={structureError} />
        {languageChangeNotice ? <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">{translate(locale, "analysisLanguageChanged")}</div> : null}
        {analysisError ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-800">{analysisError}</div> : null}
        {status === "success" && analysisResult ? (
          <AnalysisResultPanel locale={locale} result={analysisResult} />
        ) : null}
      </main>
    </div>
  );
}
