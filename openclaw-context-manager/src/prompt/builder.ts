import type { HardState, Assertion } from "../types.js";

export interface BuildPromptOptions {
  /** Latest N assertions to include (default 10) */
  assertionLimit?: number;
  /** Optional section separator */
  separator?: string;
}

const DEFAULT_SEP = "\n---\n";

/**
 * Build turn-level prompt: HardState + latest N assertions + user input.
 */
export function buildPrompt(
  hardState: HardState,
  assertions: Assertion[],
  userInput: string,
  options: BuildPromptOptions = {}
): string {
  const limit = options.assertionLimit ?? 10;
  const sep = options.separator ?? DEFAULT_SEP;
  const slice = assertions.slice(-limit);
  const parts: string[] = [];

  parts.push("# Hard State (Goal & Constraints)");
  parts.push(`Goal: ${hardState.goal || "(none)"}`);
  if (hardState.constraints.length > 0) {
    parts.push("Constraints:");
    hardState.constraints.forEach((c) => parts.push(`- ${c}`));
  }
  if (hardState.system_prompt) {
    parts.push("System: " + hardState.system_prompt);
  }
  if (hardState.capabilities.length > 0) {
    parts.push("Capabilities:");
    hardState.capabilities.forEach((c) => parts.push(`- ${c}`));
  }

  if (slice.length > 0) {
    parts.push("");
    parts.push("# Recent Assertions");
    slice.forEach((a) => {
      parts.push(`[${a.type}] ${a.content}`);
    });
  }

  parts.push("");
  parts.push("# Current User Input");
  parts.push(userInput.trim() || "(empty)");

  return parts.join("\n").trim();
}
