import type { Phase } from "../types.js";

const TRIGGERS: Record<Phase, string[]> = {
  setup: ["目标", "需求", "goal", "想要", "希望", "开始"],
  planning: ["计划", "方案", "步骤", "plan", "方案", "如何做"],
  execution: ["执行", "实现", "做", "implement", "开发", "写代码"],
  review: ["回顾", "总结", "review", "完成", "总结一下", "汇总"],
};

/**
 * Detect phase from text (e.g. user input or model output).
 * Returns the first matching phase in order: setup -> planning -> execution -> review.
 */
export function detectPhase(text: string): Phase {
  const lower = text.toLowerCase().trim();
  if (lower.length === 0) return "setup";
  for (const phase of ["review", "execution", "planning", "setup"] as Phase[]) {
    for (const kw of TRIGGERS[phase]) {
      if (lower.includes(kw.toLowerCase())) return phase;
    }
  }
  return "setup";
}

/**
 * State machine: advance phase (optional). For now we only allow advancing or staying.
 */
export function nextPhase(current: Phase, detected: Phase): Phase {
  const order: Phase[] = ["setup", "planning", "execution", "review"];
  const ci = order.indexOf(current);
  const di = order.indexOf(detected);
  return di >= ci ? detected : current;
}
