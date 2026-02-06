import type { AssertionType } from "../types.js";

export interface ExtractorRule {
  type: AssertionType;
  /** Regex or keyword list; if string[], treated as keywords (word boundary). */
  patterns: RegExp[] | string[];
}

const decisionKeywords = [
  "决定", "选择", "采用", "确定", "确定使用", "采用方案", "决定采用",
  "decide", "decision", "choose", "chose", "select", "we will use", "we'll use",
];
const todoKeywords = [
  "需要", "TODO", "待办", "下一步", "将要", "计划", "打算",
  "todo", "need to", "next step", "will do", "should do", "pending",
];
const rejectionKeywords = [
  "不要", "不能", "禁止", "不得", "避免", "别", "勿",
  "don't", "do not", "avoid", "must not", "never", "reject",
];
const factKeywords = [
  "已经", "完成了", "结果是", "已", "完成", "结果", "当前状态",
  "done", "completed", "result is", "finished", "already",
];

function toRegexList(keywords: string[]): RegExp[] {
  return keywords.map((k) => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"));
}

export const DEFAULT_RULES: ExtractorRule[] = [
  { type: "decision", patterns: toRegexList(decisionKeywords) },
  { type: "todo", patterns: toRegexList(todoKeywords) },
  { type: "rejection", patterns: toRegexList(rejectionKeywords) },
  { type: "fact", patterns: toRegexList(factKeywords) },
];

/**
 * Match text against a single rule; returns type if any pattern matches.
 */
export function matchRule(text: string, rule: ExtractorRule): boolean {
  for (const p of rule.patterns) {
    if (p instanceof RegExp) {
      if (p.test(text)) return true;
    } else {
      const re = new RegExp("\\b" + String(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
      if (re.test(text)) return true;
    }
  }
  return false;
}
