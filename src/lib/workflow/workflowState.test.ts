import { describe, expect, it } from "vitest";
import { createRequestGuard, getStepAvailability, inputsAreDisabled, stepAfterAnalysisCompletes } from "./workflowState";

describe("workflow state", () => {
  it("allows only step 1 without ResumeData", () => expect(getStepAvailability({ hasStructuredResume: false, analysisStarted: false, hasAnalysis: false })).toEqual({ 1: true, 2: false, 3: false, 4: false }));
  it("unlocks step 2 after structure", () => expect(getStepAvailability({ hasStructuredResume: true, analysisStarted: false, hasAnalysis: false })).toEqual({ 1: true, 2: true, 3: false, 4: false }));
  it("allows steps 1-3 while analysis runs", () => expect(getStepAvailability({ hasStructuredResume: true, analysisStarted: true, hasAnalysis: false })).toEqual({ 1: true, 2: true, 3: true, 4: false }));
  it("unlocks step 4 after analysis", () => expect(getStepAvailability({ hasStructuredResume: true, analysisStarted: true, hasAnalysis: true })[4]).toBe(true));
  it("allows all steps while preparation runs", () => expect(getStepAvailability({ hasStructuredResume: true, analysisStarted: true, hasAnalysis: true })).toEqual({ 1: true, 2: true, 3: true, 4: true }));
  it("disables inputs during analysis or preparation", () => { expect(inputsAreDisabled({ analysisLoading: true, preparationLoading: false })).toBe(true); expect(inputsAreDisabled({ analysisLoading: false, preparationLoading: true })).toBe(true); });
  it("does not move a user away when analysis completes", () => { expect(stepAfterAnalysisCompletes(2)).toBe(2); expect(stepAfterAnalysisCompletes(3)).toBe(3); });
  it("blocks rapid duplicate requests until finished", () => { const guard = createRequestGuard(); expect(guard.tryStart()).toBe(true); expect(guard.tryStart()).toBe(false); guard.finish(); expect(guard.tryStart()).toBe(true); });
});
