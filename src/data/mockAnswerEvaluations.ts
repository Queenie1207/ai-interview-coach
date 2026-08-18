import type { SupportedLocale } from "@/lib/i18n/locales";
import type { MockAnswerEvaluation } from "@/types/practice";

export const mockAnswerEvaluations: Record<SupportedLocale, MockAnswerEvaluation> = {
  en: {
    overallScore: 80, relevanceScore: 84, evidenceScore: 76, structureScore: 82, clarityScore: 80,
    summary: "The answer stays focused and presents a credible approach. A more specific result would make the impact easier to assess.",
    strengths: ["Addresses the main intent of the question", "Explains personal contribution in a clear sequence"],
    improvements: ["Add a measurable outcome", "Explain one important trade-off and why it was chosen"],
    missingPoints: ["A concrete success metric", "What was learned or changed afterward"],
    suggestedOutline: ["Set the context and goal", "Describe your responsibility", "Explain the key actions and decisions", "Close with the result and learning"],
    improvedAnswer: "Example only: I would briefly establish the situation and goal, identify my specific responsibility, explain the two most important actions and their trade-offs, then close with a measurable result and what I learned.",
    needsFollowUp: true, suggestedFollowUp: "What trade-off did you consider, and how did you decide?",
  },
  "zh-TW": {
    overallScore: 80, relevanceScore: 84, evidenceScore: 76, structureScore: 82, clarityScore: 80,
    summary: "回答聚焦於題目並呈現可信的處理方式；若補上更具體的結果，會更容易判斷實際影響。",
    strengths: ["有回應題目的主要意圖", "以清楚順序說明個人貢獻"],
    improvements: ["加入可衡量的成果", "說明一項重要取捨及選擇原因"],
    missingPoints: ["具體的成功指標", "事後的學習或調整"],
    suggestedOutline: ["交代情境與目標", "說明自己的責任", "解釋關鍵行動與決策", "以成果與學習收尾"],
    improvedAnswer: "僅供示例：我會先簡要交代情境與目標，指出自己的具體責任，說明兩項最重要的行動與取捨，最後補上可衡量的成果及學習。",
    needsFollowUp: true, suggestedFollowUp: "當時考量了哪些取捨？你如何做出決定？",
  },
  "zh-CN": {
    overallScore: 80, relevanceScore: 84, evidenceScore: 76, structureScore: 82, clarityScore: 80,
    summary: "回答聚焦于题目并呈现可信的处理方式；如果补充更具体的结果，会更容易判断实际影响。",
    strengths: ["回应了题目的主要意图", "按清晰顺序说明个人贡献"],
    improvements: ["加入可衡量的成果", "说明一项重要取舍及选择原因"],
    missingPoints: ["具体的成功指标", "事后的学习或调整"],
    suggestedOutline: ["交代情境与目标", "说明自己的责任", "解释关键行动与决策", "以成果与学习收尾"],
    improvedAnswer: "仅供示例：我会先简要交代情境与目标，指出自己的具体责任，说明两项最重要的行动与取舍，最后补充可衡量的成果及学习。",
    needsFollowUp: true, suggestedFollowUp: "当时考虑了哪些取舍？你如何做出决定？",
  },
};
