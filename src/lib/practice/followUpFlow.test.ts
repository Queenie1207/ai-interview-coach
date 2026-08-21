import { describe, expect, it } from "vitest";
import { isDuplicateFollowUpQuestion, MAX_FOLLOW_UP_ROUNDS, normalizeFollowUpQuestion, truncateFollowUpHistory } from "./followUpFlow";
describe("follow-up flow guards", () => {
  it("defines exactly three follow-up rounds", () => expect(MAX_FOLLOW_UP_ROUNDS).toBe(3));
  it("normalizes case, whitespace, Unicode and punctuation", () => { expect(normalizeFollowUpQuestion(" Ｗhat  RESULT？！ ")).toBe("whatresult"); expect(isDuplicateFollowUpQuestion("WHAT result?", ["What result！"])).toBe(true); });
  it("recognizes exact duplicates but not distinct questions", () => { expect(isDuplicateFollowUpQuestion("What happened?", ["What happened?"])).toBe(true); expect(isDuplicateFollowUpQuestion("Why did it happen?", ["What happened?"])).toBe(false); });
  it("truncates from the edited round", () => { const history = [1,2,3].map((round) => ({ round, question: `q${round}`, answer: `answer ${round}` })); expect(truncateFollowUpHistory(history, 1)).toEqual([]); expect(truncateFollowUpHistory(history, 2)).toEqual([history[0]]); expect(truncateFollowUpHistory(history, 3)).toEqual(history.slice(0, 2)); });
});
