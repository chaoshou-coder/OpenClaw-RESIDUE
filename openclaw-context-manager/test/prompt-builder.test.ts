import { describe, it, expect } from "vitest";
import { buildPrompt } from "../src/prompt/builder.js";
import type { HardState, Assertion } from "../src/types.js";

describe("buildPrompt", () => {
  const baseState: HardState = {
    goal: "完成需求A",
    constraints: ["不要删库"],
    capabilities: ["read", "write"],
  };

  it("includes goal and constraints", () => {
    const out = buildPrompt(baseState, [], "用户输入");
    expect(out).toContain("Goal: 完成需求A");
    expect(out).toContain("不要删库");
    expect(out).toContain("Current User Input");
    expect(out).toContain("用户输入");
  });

  it("limits assertions to default 10", () => {
    const many: Assertion[] = Array.from({ length: 20 }, (_, i) => ({
      id: `id-${i}`,
      type: "fact",
      content: `fact ${i}`,
      source: "manual",
      status: "pending",
      time: new Date().toISOString(),
    }));
    const out = buildPrompt(baseState, many, "input");
    expect(out).toContain("fact 10");
    expect(out).toContain("fact 19");
    expect(out).not.toContain("fact 0");
  });

  it("respects assertionLimit option", () => {
    const list: Assertion[] = [
      { id: "1", type: "decision", content: "选A", source: "manual", status: "pending", time: "" },
      { id: "2", type: "todo", content: "下一步做B", source: "manual", status: "pending", time: "" },
    ];
    const out = buildPrompt(baseState, list, "x", { assertionLimit: 1 });
    expect(out).toContain("下一步做B");
    expect(out).not.toContain("选A");
  });
});
