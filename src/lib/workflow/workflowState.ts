export type WorkflowStep = 1 | 2 | 3 | 4;

export function getStepAvailability(input: { hasStructuredResume: boolean; analysisStarted: boolean; hasAnalysis: boolean }): Record<WorkflowStep, boolean> {
  return { 1: true, 2: input.hasStructuredResume, 3: input.hasStructuredResume && input.analysisStarted, 4: input.hasAnalysis };
}

export function inputsAreDisabled(input: { analysisLoading: boolean; preparationLoading: boolean }): boolean {
  return input.analysisLoading || input.preparationLoading;
}

export function stepAfterAnalysisCompletes(current: WorkflowStep): WorkflowStep {
  return current;
}

export function createRequestGuard() {
  let active = false;
  return { tryStart: () => { if (active) return false; active = true; return true; }, finish: () => { active = false; } };
}
