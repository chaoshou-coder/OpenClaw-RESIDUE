import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadHardState, saveHardState, getDefaultHardState } from "../src/state/hard-state.js";

describe("hard-state", () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "ocm-"));
  });
  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("getDefaultHardState returns empty goal and arrays", () => {
    const def = getDefaultHardState();
    expect(def.goal).toBe("");
    expect(def.constraints).toEqual([]);
    expect(def.capabilities).toEqual([]);
  });

  it("loadHardState returns default when file missing", () => {
    const state = loadHardState(dataDir);
    expect(state.goal).toBe("");
  });

  it("saveHardState creates file and loadHardState reads it", () => {
    const state = { goal: "test goal", constraints: ["c1"], capabilities: [] };
    saveHardState(dataDir, state);
    const path = join(dataDir, "state", "current_state.yaml");
    expect(existsSync(path)).toBe(true);
    const loaded = loadHardState(dataDir);
    expect(loaded.goal).toBe("test goal");
    expect(loaded.constraints).toEqual(["c1"]);
  });
});
