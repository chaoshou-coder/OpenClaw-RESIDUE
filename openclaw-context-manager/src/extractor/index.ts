import { nanoid } from "nanoid";
import type { Assertion, AssertionType, Phase } from "../types.js";
import { DEFAULT_RULES, matchRule, type ExtractorRule } from "./rules.js";

export interface ExtractorOptions {
  rules?: ExtractorRule[];
  /** Split model output into sentences/lines for extraction */
  splitSentences?: boolean;
  phase?: Phase;
}

/**
 * Extract assertions from model output using rule chain.
 * Returns new assertions (source: auto-extract, status: pending).
 */
export function extractAssertions(
  modelOutput: string,
  options: ExtractorOptions = {}
): Omit<Assertion, "id" | "time">[] {
  const rules = options.rules ?? DEFAULT_RULES;
  const split = options.splitSentences !== false;
  const phase = options.phase;
  const chunks = split ? modelOutput.split(/\n+|(?<=[。.!?])\s*/).map((s) => s.trim()).filter(Boolean) : [modelOutput];
  const result: Omit<Assertion, "id" | "time">[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    if (chunk.length < 2) continue;
    for (const rule of rules) {
      if (matchRule(chunk, rule)) {
        const key = `${rule.type}:${chunk}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
          type: rule.type as AssertionType,
          content: chunk.slice(0, 500),
          source: "auto-extract",
          status: "pending",
          phase,
        });
        break;
      }
    }
  }
  return result;
}
