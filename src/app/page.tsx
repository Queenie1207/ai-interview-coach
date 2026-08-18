"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnalysisResultPanel } from "@/components/AnalysisResultPanel";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { Header } from "@/components/Header";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResumeParseResult } from "@/components/ResumeParseResult";
import { ResumeUploader } from "@/components/ResumeUploader";
import { StructuredResumeResult } from "@/components/StructuredResumeResult";
import { StepNavigation, type WorkflowStep } from "@/components/StepNavigation";
import { InterviewPreparationPanel } from "@/components/InterviewPreparationPanel";
import { InterviewPracticePanel } from "@/components/InterviewPracticePanel";
import { mockAnswerEvaluations } from "@/data/mockAnswerEvaluations";
import { validatePracticeAnswer } from "@/lib/practice/answerValidation";
import { createPracticeEvaluationTimer } from "@/lib/practice/practiceEvaluationTimer";
import { getPracticeLocaleChangeStrategy } from "@/lib/practice/practiceLocalePolicy";
import type { AnalysisStatus, InterviewAnalysis, InterviewAnalysisResponse } from "@/types/analysis";
import type { ParsedResume, ResumeParseResponse } from "@/types/resumeParse";
import type { ResumeData, ResumeStructureResponse } from "@/types/resume";
import { validateResumeFile } from "@/utils/fileValidation";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, resolveInitialLocale, type SupportedLocale } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import type { InterviewPreparation, InterviewPreparationResponse, MoreInterviewQuestionsResponse } from "@/types/preparation";
import type { MockAnswerEvaluation } from "@/types/practice";
import { createRequestGuard, getStepAvailability, inputsAreDisabled, stepAfterAnalysisCompletes } from "@/lib/workflow/workflowState";

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
  const [activeStep, setActiveStep] = useState<WorkflowStep>(1);
  const [preparation, setPreparation] = useState<InterviewPreparation | null>(null);
  const [preparationLoading, setPreparationLoading] = useState(false);
  const [preparationError, setPreparationError] = useState<string | null>(null);
  const [moreQuestionsLoading, setMoreQuestionsLoading] = useState(false);
  const [moreQuestionsError, setMoreQuestionsError] = useState<string | null>(null);
  const [moreQuestionsStatus, setMoreQuestionsStatus] = useState<string | null>(null);
  const [analysisAttempted, setAnalysisAttempted] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<"idle" | "parsing" | "structuring" | "analyzing">("idle");
  const [selectedPracticeQuestion, setSelectedPracticeQuestion] = useState<{ question: InterviewPreparation["questions"][number]; index: number } | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [practiceEvaluation, setPracticeEvaluation] = useState<MockAnswerEvaluation | null>(null);
  const practiceRequestId = useRef(0);
  const lastPracticedQuestion = useRef<InterviewPreparation["questions"][number] | null>(null);
  const practiceLocale = useRef<SupportedLocale>(DEFAULT_LOCALE);
  const practiceTimer = useRef(createPracticeEvaluationTimer());
  const analysisGuard = useRef(createRequestGuard());
  const preparationGuard = useRef(createRequestGuard());
  const moreQuestionsGuard = useRef(createRequestGuard());

  const analysisLoading = status === "loading";
  const inputDisabled = inputsAreDisabled({ analysisLoading, preparationLoading }) || moreQuestionsLoading;

  useEffect(() => {
    const evaluationTimer = practiceTimer.current;
    const timer = window.setTimeout(() => {
      const initialLocale = resolveInitialLocale(localStorage.getItem(LOCALE_STORAGE_KEY), navigator.language);
      practiceLocale.current = initialLocale;
      setLocale(initialLocale);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      evaluationTimer.cancel();
    };
  }, []);

  function localizedApiError(code: string, fallback: MessageKey): string {
    const keys: Record<string, MessageKey> = {
      FILE_REQUIRED: "resumeRequired", INVALID_FILE_TYPE: "invalidPdf", FILE_TOO_LARGE: "pdfTooLarge",
      AI_NOT_CONFIGURED: "aiNotConfigured", AI_AUTHENTICATION_ERROR: "aiAuthentication", AI_RATE_LIMITED: "aiRateLimited",
      AI_UPSTREAM_ERROR: "aiUpstream", AI_EMPTY_OUTPUT: "aiInvalidOutput", AI_INVALID_JSON: "aiInvalidOutput", AI_OUTPUT_TRUNCATED: "aiOutputTruncated", AI_INVALID_OUTPUT: "aiInvalidOutput",
    };
    return translate(locale, keys[code] ?? fallback);
  }

  function handleLocaleChange(nextLocale: SupportedLocale) {
    if (inputDisabled || nextLocale === locale) return;
    setLocale(nextLocale);
    practiceLocale.current = nextLocale;
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setErrors({});
    const localeStrategy = getPracticeLocaleChangeStrategy({ hasActivePractice: Boolean(selectedPracticeQuestion), hasAnalysisState: Boolean(analysisResult || preparation || analysisAttempted) });
    if (localeStrategy === "preserve-practice") {
      if (practiceEvaluation) setPracticeEvaluation(mockAnswerEvaluations[nextLocale]);
      return;
    }
    if (localeStrategy === "reset-analysis-and-practice") { resetPractice(); setAnalysisResult(null); setPreparation(null); setAnalysisError(null); setPreparationError(null); setMoreQuestionsError(null); setMoreQuestionsStatus(null); setAnalysisAttempted(false); setAnalysisStage("idle"); setStatus("idle"); setActiveStep(1); setLanguageChangeNotice(true); }
  }

  function cancelPracticeSubmission() {
    practiceRequestId.current += 1;
    practiceTimer.current.cancel();
    setPracticeSubmitting(false);
  }

  function resetPractice() {
    cancelPracticeSubmission();
    lastPracticedQuestion.current = null;
    setSelectedPracticeQuestion(null); setPracticeAnswer(""); setPracticeError(null); setPracticeEvaluation(null);
  }

  function startPractice(question: InterviewPreparation["questions"][number], index: number) {
    if (lastPracticedQuestion.current === question) {
      setSelectedPracticeQuestion({ question, index });
      return;
    }
    cancelPracticeSubmission();
    lastPracticedQuestion.current = question;
    setSelectedPracticeQuestion({ question, index }); setPracticeAnswer(""); setPracticeError(null); setPracticeEvaluation(null);
  }

  function returnToQuestionList() {
    cancelPracticeSubmission();
    setSelectedPracticeQuestion(null);
  }

  function updatePracticeAnswer(answer: string) {
    setPracticeAnswer(answer);
    if (practiceError) setPracticeError(null);
  }

  function submitPracticeAnswer() {
    if (practiceSubmitting || practiceTimer.current.hasPending()) return;
    const validationError = validatePracticeAnswer(practiceAnswer);
    if (validationError) {
      const key = validationError === "required" ? "answerRequired" : validationError === "tooShort" ? "answerTooShort" : "answerTooLong";
      setPracticeError(translate(locale, key));
      return;
    }
    const requestId = ++practiceRequestId.current;
    setPracticeError(null); setPracticeSubmitting(true);
    practiceTimer.current.cancel();
    practiceTimer.current.start(() => {
      if (practiceRequestId.current !== requestId) return;
      setPracticeEvaluation(mockAnswerEvaluations[practiceLocale.current]); setPracticeSubmitting(false);
    });
  }

  function handleResumeSelect(file: File) {
    const fileError = validateResumeFile(file);

    if (fileError) {
      const message = file.size > 10 * 1024 * 1024 ? "pdfTooLarge" : "invalidPdf";
      setErrors((currentErrors) => ({ ...currentErrors, resume: translate(locale, message) }));
      return;
    }

    setResumeFile(file);
    resetPractice();
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setPreparation(null);
    setPreparationError(null);
    setMoreQuestionsError(null); setMoreQuestionsStatus(null);
    setStructuredResume(null);
    setStructureError(null);
    setAnalysisError(null);
    setLanguageChangeNotice(false);
    setStatus("idle");
    setAnalysisAttempted(false);
    setAnalysisStage("idle");
    setActiveStep(1);
    setErrors((currentErrors) => ({ ...currentErrors, resume: undefined }));
  }

  function handleResumeRemove() {
    resetPractice();
    setResumeFile(null);
    setParsedResume(null);
    setResumeParseError(null);
    setAnalysisResult(null);
    setPreparation(null);
    setPreparationError(null);
    setMoreQuestionsError(null); setMoreQuestionsStatus(null);
    setStructuredResume(null);
    setStructureError(null);
    setAnalysisError(null);
    setStatus("idle");
    setAnalysisAttempted(false);
    setAnalysisStage("idle");
    setActiveStep(1);
    setErrors((currentErrors) => ({ ...currentErrors, resume: undefined }));
  }

  function updateJobInput(field: keyof JobInputs, value: string) {
    resetPractice();
    setJobInputs((currentInputs) => ({ ...currentInputs, [field]: value }));
    setAnalysisResult(null);
    setPreparation(null);
    setAnalysisError(null);
    setPreparationError(null);
    setMoreQuestionsError(null); setMoreQuestionsStatus(null);
    setLanguageChangeNotice(false);
    setStatus("idle");
    setAnalysisAttempted(false);
    setAnalysisStage("idle");
    setActiveStep(1);

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
    if (!analysisGuard.current.tryStart()) return;

    resetPractice();

    setAnalysisResult(null);
    setPreparation(null);
    setPreparationError(null);
    setAnalysisError(null);
    setResumeParseError(null);
    setStructureError(null);
    setStatus("loading");

    try {
      let resumeForAnalysis = structuredResume;

      if (!resumeForAnalysis) {
      let extractedText: string;
      try {
        setParsedResume(null);
        setAnalysisStage("parsing");
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
          setStatus("idle"); setAnalysisStage("idle");
          return;
        }

        setParsedResume(responseBody.data);
        extractedText = responseBody.data.text;
      } catch {
        setResumeParseError(translate(locale, "parseUnknown"));
        setStatus("idle"); setAnalysisStage("idle");
        return;
      }

      try {
        setLoadingMessage(translate(locale, "structuringResume"));
        setAnalysisStage("structuring");
        const structureResponse = await fetch("/api/resume/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedText }),
        });
        const structureBody = (await structureResponse.json()) as ResumeStructureResponse;
        if (!structureBody.success) {
          setStructureError(localizedApiError(structureBody.error.code, "structureUnknown"));
          setStatus("idle"); setAnalysisStage("idle");
          return;
        }
        setStructuredResume(structureBody.data);
        resumeForAnalysis = structureBody.data;
      } catch {
        setStructureError(translate(locale, "structureUnknown"));
        setStatus("idle"); setAnalysisStage("idle");
        return;
      }
      }

      try {
      setAnalysisAttempted(true);
      setAnalysisStage("analyzing");
      setLoadingMessage(translate(locale, "comparingRequirements"));
      const response = await fetch("/api/interview/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeForAnalysis, ...jobInputs, jobDescription: jobInputs.jobDescription.trim(), outputLanguage: locale }) });
      const body = (await response.json()) as InterviewAnalysisResponse;
      if (!body.success) { setAnalysisError(localizedApiError(body.error.code, "analysisUnknown")); setStatus("idle"); setAnalysisStage("idle"); return; }
      setAnalysisResult(body.data);
      setActiveStep(stepAfterAnalysisCompletes);
      setStatus("success");
      setAnalysisStage("idle");
    } catch {
      setAnalysisError(translate(locale, "analysisUnknown"));
      setStatus("idle");
      setAnalysisStage("idle");
    }
    } finally {
      analysisGuard.current.finish();
    }
  }

  async function retryAnalysis() {
    if (!structuredResume || !analysisGuard.current.tryStart()) return;
    setAnalysisResult(null); setPreparation(null); setAnalysisError(null); setPreparationError(null); setAnalysisAttempted(true); setAnalysisStage("analyzing"); setLoadingMessage(translate(locale, "comparingRequirements")); setStatus("loading");
    try {
      const response = await fetch("/api/interview/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: structuredResume, ...jobInputs, jobDescription: jobInputs.jobDescription.trim(), outputLanguage: locale }) });
      const body = (await response.json()) as InterviewAnalysisResponse;
      if (!body.success) { setAnalysisError(localizedApiError(body.error.code, "analysisUnknown")); return; }
      setAnalysisResult(body.data);
      setActiveStep(stepAfterAnalysisCompletes);
    } catch { setAnalysisError(translate(locale, "analysisUnknown")); }
    finally { setStatus("idle"); setAnalysisStage("idle"); analysisGuard.current.finish(); }
  }

  async function handlePrepare() {
    if (!structuredResume || !analysisResult || !preparationGuard.current.tryStart()) return;
    setPreparation(null); setPreparationError(null); setLoadingMessage(translate(locale, "generatingPreparation")); setPreparationLoading(true); setActiveStep(4);
    try {
      const response = await fetch("/api/interview/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: structuredResume, jobDescription: jobInputs.jobDescription.trim(), analysis: analysisResult, companyName: jobInputs.companyName, positionName: jobInputs.positionName, outputLanguage: locale }) });
      const body = (await response.json()) as InterviewPreparationResponse;
      if (!body.success) { setPreparationError(localizedApiError(body.error.code, "preparationUnknown")); return; }
      setPreparation(body.data);
    } catch { setPreparationError(translate(locale, "preparationUnknown")); }
    finally { setPreparationLoading(false); preparationGuard.current.finish(); }
  }

  async function handleGenerateMoreQuestions() {
    if (!structuredResume || !analysisResult || !preparation || preparation.questions.length >= 20 || !moreQuestionsGuard.current.tryStart()) return;
    const count = Math.min(5, 20 - preparation.questions.length);
    setMoreQuestionsError(null); setMoreQuestionsStatus(null); setMoreQuestionsLoading(true);
    try {
      const response = await fetch("/api/interview/prepare/more", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: structuredResume, jobDescription: jobInputs.jobDescription.trim(), analysis: analysisResult, outputLanguage: locale, companyName: jobInputs.companyName, positionName: jobInputs.positionName, excludedQuestions: preparation.questions.map(({ question, followUps }) => ({ question, followUps })), count }) });
      const body = (await response.json()) as MoreInterviewQuestionsResponse;
      if (!body.success) { setMoreQuestionsError(localizedApiError(body.error.code, "moreQuestionsFailed")); return; }
      const added = body.data.questions.slice(0, count);
      if (added.length === 0) { setMoreQuestionsStatus(translate(locale, "noDistinctQuestions")); return; }
      setPreparation((current) => current ? { ...current, questions: [...current.questions, ...added].slice(0, 20) } : current);
      setMoreQuestionsStatus(translate(locale, "questionsAdded").replace("{count}", String(added.length)));
    } catch { setMoreQuestionsError(translate(locale, "moreQuestionsFailed")); }
    finally { setMoreQuestionsLoading(false); moreQuestionsGuard.current.finish(); }
  }

  const enabled = getStepAvailability({ hasStructuredResume: Boolean(structuredResume), analysisStarted: analysisAttempted, hasAnalysis: Boolean(analysisResult) });
  const completed: Record<WorkflowStep, boolean> = { 1: Boolean(structuredResume), 2: Boolean(structuredResume), 3: Boolean(analysisResult), 4: Boolean(preparation) };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <Header locale={locale} disabled={inputDisabled} onLocaleChange={handleLocaleChange} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-6 sm:px-8 sm:py-8">
        <StepNavigation locale={locale} active={activeStep} enabled={enabled} completed={completed} onChange={setActiveStep} />
        {activeStep === 1 ? <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ResumeUploader
              locale={locale}
              resumeFile={resumeFile}
              error={errors.resume}
              disabled={inputDisabled}
              onFileSelect={handleResumeSelect}
              onRemove={handleResumeRemove}
            />
            <JobDescriptionForm
              locale={locale}
              companyName={jobInputs.companyName}
              positionName={jobInputs.positionName}
              jobDescription={jobInputs.jobDescription}
              jobDescriptionError={errors.jobDescription}
              disabled={inputDisabled}
              onCompanyNameChange={(value) => updateJobInput("companyName", value)}
              onPositionNameChange={(value) => updateJobInput("positionName", value)}
              onJobDescriptionChange={(value) => updateJobInput("jobDescription", value)}
            />
          </div>

          <AnalyzeButton disabled={inputDisabled} label={translate(locale, "startAnalysis")} />
        </form> : null}

        {activeStep === 1 && analysisLoading ? <LoadingAnalysis message={loadingMessage} /> : null}
        {activeStep === 1 && languageChangeNotice ? <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">{translate(locale, "analysisLanguageChanged")}</div> : null}
        {activeStep === 1 && (resumeParseError || structureError || analysisError) ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-800">{resumeParseError ?? structureError ?? analysisError}</div> : null}
        {activeStep === 2 ? <><ResumeParseResult locale={locale} parsedResume={parsedResume} error={resumeParseError} /><StructuredResumeResult locale={locale} resume={structuredResume} error={structureError} /></> : null}
        {activeStep === 3 && analysisStage === "analyzing" ? <LoadingAnalysis message={translate(locale, "comparingRequirements")} /> : null}
        {activeStep === 3 && analysisError ? <div className="rounded-lg border border-red-200 bg-red-50 p-5"><p role="alert" className="text-sm font-medium text-red-800">{analysisError}</p><button type="button" disabled={inputDisabled} onClick={retryAnalysis} className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{translate(locale, "retryAnalysis")}</button></div> : null}
        {activeStep === 3 && analysisResult ? (
          <AnalysisResultPanel locale={locale} result={analysisResult} />
        ) : null}
        {activeStep === 4 && analysisResult && selectedPracticeQuestion ? <InterviewPracticePanel locale={locale} question={selectedPracticeQuestion.question} number={selectedPracticeQuestion.index + 1} answer={practiceAnswer} submitting={practiceSubmitting} error={practiceError} evaluation={practiceEvaluation} onAnswerChange={updatePracticeAnswer} onSubmit={submitPracticeAnswer} onBack={returnToQuestionList} /> : null}
        {activeStep === 4 && analysisResult && !selectedPracticeQuestion ? <InterviewPreparationPanel locale={locale} preparation={preparation} loading={preparationLoading} error={preparationError} onGenerate={handlePrepare} moreLoading={moreQuestionsLoading} moreError={moreQuestionsError} moreStatus={moreQuestionsStatus} onGenerateMore={handleGenerateMoreQuestions} onPractice={startPractice} /> : null}
      </main>
    </div>
  );
}
