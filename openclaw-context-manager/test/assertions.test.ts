import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadAssertions, appendAssertion, getLatestAssertions, filterByType } from "../src/state/assertions.js";

describe("assertions", () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "ocm-"));
  });
  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("loadAssertions returns [] when file missing", () => {
    expect(loadAssertions(dataDir)).toEqual([]);
  });

  it("appendAssertion creates file and adds id/time", () => {
    const a = appendAssertion(dataDir, { type: "decision", content: "选A" });
    expect(a.id).toBeDefined();
    expect(a.time).toBeDefined();
    expect(a.type).toBe("decision");
    expect(a.content).toBe("选A");
    expect(a.source).toBe("manual");
    expect(a.status).toBe("pending");
  });

  it("getLatestAssertions returns last N", () => {
    appendAssertion(dataDir, { type: "fact", content: "1" });
    appendAssertion(dataDir, { type: "fact", content: "2" });
    appendAssertion(dataDir, { type: "fact", content: "3" });
    const latest = getLatestAssertions(dataDir, 2);
    expect(latest.length).toBe(2);
    expect(latest.map((x) => x.content)).toEqual(["2", "3"]);
  });

  it("filterByType filters by type", () => {
    const list = [
      { id: "1", type: "decision" as const, content: "a", source: "manual" as const, status: "pending" as const, time: "" },
      { id: "2", type: "todo" as const, content: "b", source: "manual" as const, status: "pending" as const, time: "" },
    ];
    expect(filterByType(list, "decision").map((x) => x.id)).toEqual(["1"]);
  });
});
