import type { SupportedLocale } from "./locales";

const en = {
  phase: "Phase 3A", title: "AI Interview Coach", description: "Upload a resume PDF and compare its structured information with a job description.", language: "Language",
  resumePdf: "Resume PDF", acceptedFormat: "Accepted format: PDF, max 10 MB.", choosePdf: "Choose or drop PDF", browserState: "The file stays in browser state.", change: "Change", remove: "Remove",
  jobDescription: "Job Description", companyName: "Company Name", positionName: "Position Name", optional: "Optional", characters: "characters", jdPlaceholder: "Paste the job description here...",
  startAnalysis: "Start Analysis", readingPdf: "Reading resume PDF...", structuringResume: "Structuring resume with AI...", comparingRequirements: "Comparing resume with job requirements...",
  resumeRequired: "Resume PDF is required.", invalidPdf: "Please choose a PDF file.", pdfTooLarge: "Resume PDF must be 10 MB or smaller.", jdRequired: "Job Description is required.", jdTooShort: "Job Description must be at least 50 characters.",
  parseFailed: "Resume parsing failed", parseUnknown: "We could not parse this resume. Please try again.", structureFailed: "Resume structuring failed", structureUnknown: "We could not complete resume structuring. Please try again.", analysisUnknown: "We could not complete the interview analysis. Please try again.",
  aiNotConfigured: "Interview analysis is not configured on the server.", aiAuthentication: "The interview analysis service could not authenticate.", aiRateLimited: "The interview analysis service is busy. Please try again later.", aiUpstream: "The interview analysis service is temporarily unavailable. Please try again.", aiInvalidOutput: "The interview analysis returned invalid data. Please try again.", aiOutputTruncated: "The interview preparation output was incomplete. Please try again.",
  parsedSuccessfully: "Resume parsed successfully", pdfFile: "PDF file", extractedCharacters: "Extracted characters", showPreview: "Show Preview", hidePreview: "Hide Preview", structuredResume: "Structured Resume", structuredOutput: "LLM structured output",
  profile: "Profile", skills: "Skills", languages: "Languages", experience: "Experience", education: "Education", projects: "Projects", activities: "Activities", certifications: "Certifications", additionalSections: "Additional Sections",
  interviewAnalysis: "Interview Analysis", overallMatchScore: "Overall Match Score", strengths: "Strengths", potentialGaps: "Potential Gaps", interviewFocus: "Interview Focus", resumeEvidence: "Resume evidence", jdEvidence: "JD evidence", prepare: "Prepare", requirement: "Requirement", noEvidence: "No direct evidence found.", noGaps: "No material gaps identified.",
  strong: "Strong match", moderate: "Moderate match", weak: "Weak match", partial: "Partial", missing: "Missing", analysisLanguageChanged: "The analysis language has changed. Please run the analysis again.",
  stepResumeJob: "Resume & Job", stepStructuredResume: "Structured Resume", stepMatchAnalysis: "Match Analysis", stepPreparation: "Interview Preparation", completed: "Completed", unavailable: "Unavailable",
  preparationIntro: "Create personalized interview questions and review priorities from your resume, job description, and match analysis.", generatePreparation: "Generate Interview Preparation", generatingPreparation: "Generating interview preparation…", preparationUnknown: "We could not generate interview preparation. Please try again.", retryAnalysis: "Retry Analysis", retryPreparation: "Retry Preparation",
  interviewQuestions: "Interview Questions", reviewTopics: "Review Topics", whyAsked: "Why this may be asked", relatedRequirement: "Related requirement", answerOutline: "Answer outline", starOutline: "STAR outline", situation: "Situation", task: "Task", action: "Action", result: "Result", followUps: "Follow-up questions", difficulty: "Difficulty", priority: "Priority", relatedQuestions: "Related questions", high: "High", medium: "Medium", low: "Low", basic: "Basic", intermediate: "Intermediate", advanced: "Advanced",
  categoryIntroduction: "Introduction", categoryResume: "Resume", categoryProject: "Project", categoryTechnical: "Technical", categoryBehavioral: "Behavioral", categoryGap: "Gap", categorySituational: "Situational",
} as const;

export type MessageKey = keyof typeof en;
type Messages = { [K in MessageKey]: string };

const zhTW: Messages = {
  phase: "階段 3A", title: "AI 面試教練", description: "上傳履歷 PDF，將結構化履歷與職缺說明進行比較。", language: "語言",
  resumePdf: "履歷 PDF", acceptedFormat: "接受格式：PDF，最大 10 MB。", choosePdf: "選擇或拖放 PDF", browserState: "檔案只會保留在瀏覽器狀態中。", change: "更換", remove: "移除",
  jobDescription: "職缺說明", companyName: "公司名稱", positionName: "職位名稱", optional: "選填", characters: "字元", jdPlaceholder: "在此貼上職缺說明……",
  startAnalysis: "開始分析", readingPdf: "正在讀取履歷 PDF……", structuringResume: "正在結構化履歷……", comparingRequirements: "正在比較職缺需求……",
  resumeRequired: "請提供履歷 PDF。", invalidPdf: "請選擇 PDF 檔案。", pdfTooLarge: "履歷 PDF 不得超過 10 MB。", jdRequired: "請填寫職缺說明。", jdTooShort: "職缺說明至少需要 50 個字元。",
  parseFailed: "履歷解析失敗", parseUnknown: "無法解析此履歷，請再試一次。", structureFailed: "履歷結構化失敗", structureUnknown: "無法完成履歷結構化，請再試一次。", analysisUnknown: "無法完成面試分析，請再試一次。",
  aiNotConfigured: "伺服器尚未設定面試分析服務。", aiAuthentication: "面試分析服務驗證失敗。", aiRateLimited: "面試分析服務忙碌中，請稍後再試。", aiUpstream: "面試分析服務暫時無法使用，請再試一次。", aiInvalidOutput: "面試分析傳回無效資料，請再試一次。", aiOutputTruncated: "面試準備輸出不完整，請再試一次。",
  parsedSuccessfully: "履歷解析成功", pdfFile: "PDF 檔案", extractedCharacters: "擷取字元數", showPreview: "顯示預覽", hidePreview: "隱藏預覽", structuredResume: "結構化履歷", structuredOutput: "LLM 結構化輸出",
  profile: "個人資料", skills: "技能", languages: "語言能力", experience: "工作經歷", education: "學歷", projects: "專案", activities: "活動", certifications: "證照", additionalSections: "其他區段",
  interviewAnalysis: "面試分析", overallMatchScore: "整體匹配分數", strengths: "優勢", potentialGaps: "潛在落差", interviewFocus: "面試重點", resumeEvidence: "履歷證據", jdEvidence: "JD 證據", prepare: "準備建議", requirement: "需求", noEvidence: "未找到直接證據。", noGaps: "未發現重大落差。",
  strong: "匹配度高", moderate: "匹配度中等", weak: "匹配度較低", partial: "部分匹配", missing: "缺少", analysisLanguageChanged: "分析語言已變更，請重新分析。",
  stepResumeJob: "履歷與職位", stepStructuredResume: "結構化履歷", stepMatchAnalysis: "匹配分析", stepPreparation: "面試準備", completed: "已完成", unavailable: "尚未開放",
  preparationIntro: "根據履歷、職位說明與匹配分析，產生個人化面試題和複習重點。", generatePreparation: "產生面試準備", generatingPreparation: "正在產生面試準備……", preparationUnknown: "無法產生面試準備，請再試一次。", retryAnalysis: "重試分析", retryPreparation: "重試產生",
  interviewQuestions: "面試題目", reviewTopics: "複習主題", whyAsked: "為何可能被問", relatedRequirement: "對應需求", answerOutline: "回答大綱", starOutline: "STAR 大綱", situation: "情境", task: "任務", action: "行動", result: "結果", followUps: "追問題", difficulty: "難度", priority: "優先度", relatedQuestions: "相關題目", high: "高優先", medium: "中優先", low: "低優先", basic: "基礎", intermediate: "中等", advanced: "進階",
  categoryIntroduction: "自我介紹", categoryResume: "履歷", categoryProject: "專案", categoryTechnical: "技術", categoryBehavioral: "行為", categoryGap: "缺口", categorySituational: "情境",
};

const zhCN: Messages = {
  ...zhTW,
  phase: "阶段 3A", title: "AI 面试教练", description: "上传简历 PDF，将结构化简历与职位描述进行比较。", language: "语言",
  resumePdf: "简历 PDF", acceptedFormat: "接受格式：PDF，最大 10 MB。", choosePdf: "选择或拖放 PDF", browserState: "文件只会保留在浏览器状态中。", change: "更换", remove: "移除",
  jobDescription: "职位描述", companyName: "公司名称", positionName: "职位名称", optional: "选填", characters: "字符", jdPlaceholder: "在此粘贴职位描述……",
  startAnalysis: "开始分析", readingPdf: "正在读取简历 PDF……", structuringResume: "正在结构化简历……", comparingRequirements: "正在比较职位要求……",
  resumeRequired: "请提供简历 PDF。", invalidPdf: "请选择 PDF 文件。", pdfTooLarge: "简历 PDF 不得超过 10 MB。", jdRequired: "请填写职位描述。", jdTooShort: "职位描述至少需要 50 个字符。",
  parseFailed: "简历解析失败", parseUnknown: "无法解析此简历，请重试。", structureFailed: "简历结构化失败", structureUnknown: "无法完成简历结构化，请重试。", analysisUnknown: "无法完成面试分析，请重试。",
  aiNotConfigured: "服务器尚未配置面试分析服务。", aiAuthentication: "面试分析服务身份验证失败。", aiRateLimited: "面试分析服务繁忙，请稍后重试。", aiUpstream: "面试分析服务暂时不可用，请重试。", aiInvalidOutput: "面试分析返回无效数据，请重试。", aiOutputTruncated: "面试准备输出不完整，请重试。",
  parsedSuccessfully: "简历解析成功", pdfFile: "PDF 文件", extractedCharacters: "提取字符数", showPreview: "显示预览", hidePreview: "隐藏预览", structuredResume: "结构化简历", structuredOutput: "LLM 结构化输出",
  profile: "个人资料", skills: "技能", languages: "语言能力", experience: "工作经历", education: "教育经历", projects: "项目", activities: "活动", certifications: "证书", additionalSections: "其他部分",
  interviewAnalysis: "面试分析", overallMatchScore: "整体匹配分数", strengths: "优势", potentialGaps: "潜在差距", interviewFocus: "面试重点", resumeEvidence: "简历证据", jdEvidence: "JD 证据", prepare: "准备建议", requirement: "要求", noEvidence: "未找到直接证据。", noGaps: "未发现重大差距。",
  strong: "匹配度高", moderate: "匹配度中等", weak: "匹配度较低", partial: "部分匹配", missing: "缺少", analysisLanguageChanged: "分析语言已更改，请重新分析。",
  stepResumeJob: "履历与职位", stepStructuredResume: "结构化履历", stepMatchAnalysis: "匹配分析", stepPreparation: "面试准备", completed: "已完成", unavailable: "尚未开放",
  preparationIntro: "根据履历、职位说明与匹配分析，生成个人化面试题和复习重点。", generatePreparation: "生成面试准备", generatingPreparation: "正在生成面试准备……", preparationUnknown: "无法生成面试准备，请重试。", retryAnalysis: "重试分析", retryPreparation: "重试生成",
  interviewQuestions: "面试题目", reviewTopics: "复习主题", whyAsked: "为何可能被问", relatedRequirement: "对应要求", answerOutline: "回答大纲", starOutline: "STAR 大纲", situation: "情境", task: "任务", action: "行动", result: "结果", followUps: "追问", difficulty: "难度", priority: "优先级", relatedQuestions: "相关题目", high: "高优先", medium: "中优先", low: "低优先", basic: "基础", intermediate: "中等", advanced: "进阶",
  categoryIntroduction: "自我介绍", categoryResume: "简历", categoryProject: "项目", categoryTechnical: "技术", categoryBehavioral: "行为", categoryGap: "差距", categorySituational: "情境",
};

export const messages: Record<SupportedLocale, Messages> = { "zh-TW": zhTW, "zh-CN": zhCN, en };
export function translate(locale: SupportedLocale, key: MessageKey): string { return messages[locale][key]; }
