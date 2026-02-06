import { describe, it, expect } from "vitest";
import { extractAssertions } from "../src/extractor/index.js";

describe("extractAssertions", () => {
  it("extracts decision", () => {
    const out = extractAssertions("我们决定采用方案A。");
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(out.some((a) => a.type === "decision" && a.content.includes("方案A"))).toBe(true);
  });

  it("extracts todo", () => {
    const out = extractAssertions("下一步需要实现登录功能。");
    expect(out.some((a) => a.type === "todo")).toBe(true);
  });

  it("extracts rejection", () => {
    const out = extractAssertions("不要直接修改生产数据库。");
    expect(out.some((a) => a.type === "rejection")).toBe(true);
  });

  it("extracts fact", () => {
    const out = extractAssertions("已经完成了接口开发。");
    expect(out.some((a) => a.type === "fact")).toBe(true);
  });

  it("returns auto-extract source and pending status", () => {
    const out = extractAssertions("决定使用 TypeScript。");
    expect(out[0].source).toBe("auto-extract");
    expect(out[0].status).toBe("pending");
  });

  it("dedupes by type+content", () => {
    const text = "决定选A。\n决定选A。";
    const out = extractAssertions(text);
    const decisions = out.filter((a) => a.type === "decision" && a.content.includes("选A"));
    expect(decisions.length).toBe(1);
  });
});
