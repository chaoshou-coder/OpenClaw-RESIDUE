import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { HardState } from "../types.js";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

/**
 * Resolve path to current_state.yaml under dataDir.
 */
export function getStatePath(dataDir: string): string {
  return resolve(dataDir, "state", "current_state.yaml");
}

/**
 * Load Hard State from YAML file. Returns default state if file missing.
 */
export function loadHardState(dataDir: string): HardState {
  const path = getStatePath(dataDir);
  if (!existsSync(path)) {
    return getDefaultHardState();
  }
  const raw = readFileSync(path, "utf-8");
  const data = yamlParse(raw) as Partial<HardState>;
  return mergeWithDefault(data);
}

/**
 * Save Hard State to YAML file. Creates state dir if needed.
 */
export function saveHardState(dataDir: string, state: HardState): void {
  const path = getStatePath(dataDir);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const out = yamlStringify(state, { lineWidth: 0 });
  writeFileSync(path, out, "utf-8");
}

/**
 * Append current state to history (append-only). Filename: current_state_<iso>.yaml
 */
export function appendHistory(dataDir: string, state: HardState): void {
  const historyDir = resolve(dataDir, "state", "history");
  if (!existsSync(historyDir)) mkdirSync(historyDir, { recursive: true });
  const name = `current_state_${new Date().toISOString().replace(/[:.]/g, "-")}.yaml`;
  const path = resolve(historyDir, name);
  writeFileSync(path, yamlStringify(state, { lineWidth: 0 }), "utf-8");
}

function getDefaultHardState(): HardState {
  return {
    goal: "",
    constraints: [],
    capabilities: [],
  };
}

function mergeWithDefault(partial: Partial<HardState>): HardState {
  const def = getDefaultHardState();
  return {
    goal: partial.goal ?? def.goal,
    constraints: Array.isArray(partial.constraints) ? partial.constraints : def.constraints,
    system_prompt: partial.system_prompt,
    capabilities: Array.isArray(partial.capabilities) ? partial.capabilities : def.capabilities,
    session_metadata: partial.session_metadata,
  };
}

export { getDefaultHardState };
