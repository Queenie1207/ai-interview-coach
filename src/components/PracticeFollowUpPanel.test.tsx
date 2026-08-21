import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PracticeFollowUpPanel } from "./PracticeFollowUpPanel";

const handlers = { onAnswerChange: vi.fn(), onSubmit: vi.fn(), onFinish: vi.fn() };

describe("PracticeFollowUpPanel", () => {
  it("renders completed history and only the current pending round", () => {
    const html = renderToStaticMarkup(<PracticeFollowUpPanel locale="en" history={[{ round: 1, question: "First question?", answer: "First detailed answer." }]} pendingQuestion="Second question?" answer="draft answer" submitting={false} error={null} {...handlers} />);
    expect(html).toContain("Follow-up 1/3"); expect(html).toContain("First detailed answer."); expect(html).toContain("Follow-up 2/3"); expect(html).toContain("Finish question"); expect(html).not.toContain("Follow-up 3/3");
  });
  it("hides the input and finish action after completion", () => {
    const html = renderToStaticMarkup(<PracticeFollowUpPanel locale="en" history={[{ round: 1, question: "First question?", answer: "First detailed answer." }]} pendingQuestion={null} answer="" submitting={false} error={null} {...handlers} />);
    expect(html).not.toContain("textarea"); expect(html).not.toContain("Finish question");
  });
});
