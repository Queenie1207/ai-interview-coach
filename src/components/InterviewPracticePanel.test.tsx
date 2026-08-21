import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { validFinalEvaluation } from "@/test/followUpEvaluationFixture";
import { validPracticeEvaluation } from "@/test/practiceEvaluationFixture";
import { validPreparation } from "@/test/preparationFixture";
import { InterviewPracticePanel } from "./InterviewPracticePanel";

const handlers = { onAnswerChange: vi.fn(), onSubmit: vi.fn(), onBack: vi.fn(), onFollowUpAnswerChange: vi.fn(), onFollowUpSubmit: vi.fn(), onFollowUpFinish: vi.fn() };

describe("InterviewPracticePanel", () => {
  it("renders a pending follow-up with history", () => {
    const html = renderToStaticMarkup(<InterviewPracticePanel locale="en" question={validPreparation.questions[0]} number={1} answer="A sufficiently detailed original answer." submitting={false} error={null} evaluation={validPracticeEvaluation} evaluationCurrent followUpHistory={[{ round: 1, question: "First question?", answer: "First detailed answer." }]} pendingFollowUpQuestion="Second question?" followUpAnswer="" followUpSubmitting={false} followUpError={null} finalEvaluation={null} stopReason={null} {...handlers} />);
    expect(html).toContain("Initial evaluation"); expect(html).toContain("First detailed answer."); expect(html).toContain("Second question?");
  });
  it("renders the final evaluation and localized stop reason without another input", () => {
    const html = renderToStaticMarkup(<InterviewPracticePanel locale="en" question={validPreparation.questions[0]} number={1} answer="A sufficiently detailed original answer." submitting={false} error={null} evaluation={validPracticeEvaluation} evaluationCurrent followUpHistory={[{ round: 1, question: "First question?", answer: "First detailed answer." }]} pendingFollowUpQuestion={null} followUpAnswer="" followUpSubmitting={false} followUpError={null} finalEvaluation={validFinalEvaluation} stopReason="user_ended" {...handlers} />);
    expect(html).toContain("Final evaluation"); expect(html).toContain("You ended this question."); expect(html).not.toContain("Finish question");
  });
});
