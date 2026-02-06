/**
 * Phase of the session (affects extractor behavior).
 */
export type Phase = "setup" | "planning" | "execution" | "review";

/**
 * Hard State — persisted, must not be lost.
 */
export interface HardState {
  goal: string;
  constraints: string[];
  system_prompt?: string;
  capabilities: string[];
  session_metadata?: Record<string, unknown>;
}

/**
 * Assertion source.
 */
export type AssertionSource = "auto-extract" | "manual" | "review";

/**
 * Assertion status.
 */
export type AssertionStatus = "pending" | "confirmed";

/**
 * Assertion type for extractor rules.
 */
export type AssertionType = "fact" | "decision" | "rejection" | "todo";

/**
 * Assertion — derivable claim, append-only store.
 */
export interface Assertion {
  id: string;
  type: AssertionType;
  content: string;
  source: AssertionSource;
  status: AssertionStatus;
  time: string; // ISO 8601
  phase?: Phase;
}
