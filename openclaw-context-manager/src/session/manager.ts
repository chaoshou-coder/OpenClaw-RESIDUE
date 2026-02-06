import { getConfig } from "../config.js";
import { loadHardState, saveHardState } from "../state/hard-state.js";
import {
  loadAssertions,
  appendAssertion,
  getLatestAssertions,
} from "../state/assertions.js";
import { buildPrompt } from "../prompt/builder.js";
import { extractAssertions } from "../extractor/index.js";
import { detectPhase, nextPhase } from "../phase/detector.js";
import type { HardState, Assertion, Phase } from "../types.js";
import { resolve } from "node:path";

export interface SessionManagerOptions {
  dataDir?: string;
  assertionLimit?: number;
  extractorEnabled?: boolean;
}

export class SessionManager {
  private dataDir: string;
  private assertionLimit: number;
  private extractorEnabled: boolean;
  private _phase: Phase = "setup";

  constructor(options: SessionManagerOptions = {}) {
    const config = getConfig();
    this.dataDir = resolve(process.cwd(), options.dataDir ?? config.dataDir);
    this.assertionLimit = options.assertionLimit ?? config.assertions.defaultLimit;
    this.extractorEnabled = options.extractorEnabled ?? config.extractor.enabled;
  }

  get phase(): Phase {
    return this._phase;
  }

  /** Load HardState + Assertions, init phase. */
  start(): { state: HardState; assertions: Assertion[] } {
    const state = loadHardState(this.dataDir);
    const assertions = loadAssertions(this.dataDir);
    this._phase = "setup";
    return { state, assertions };
  }

  /**
   * One turn: build prompt for user input, optionally run extractor on model output and append assertions.
   */
  turn(userInput: string, modelOutput?: string): { prompt: string; state: HardState; assertions: Assertion[]; phase: Phase } {
    const state = loadHardState(this.dataDir);
    let assertions = loadAssertions(this.dataDir);
    const detected = detectPhase(userInput + " " + (modelOutput ?? ""));
    this._phase = nextPhase(this._phase, detected);

    const prompt = buildPrompt(state, assertions, userInput, {
      assertionLimit: this.assertionLimit,
    });

    if (this.extractorEnabled && modelOutput && modelOutput.trim()) {
      const extracted = extractAssertions(modelOutput, { phase: this._phase });
      for (const e of extracted) {
        appendAssertion(this.dataDir, { ...e });
      }
      assertions = loadAssertions(this.dataDir);
    }

    return { prompt, state, assertions, phase: this._phase };
  }

  /** Trigger review: advance phase to review. */
  review(): Phase {
    this._phase = "review";
    return this._phase;
  }

  /** End session (optional cleanup). */
  end(): void {
    // Optional: write session_tmp cleanup, audit log, etc.
  }
}
