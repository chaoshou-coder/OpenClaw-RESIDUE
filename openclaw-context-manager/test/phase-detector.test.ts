import { describe, it, expect } from "vitest";
import { detectPhase, nextPhase } from "../src/phase/detector.js";

describe("detectPhase", () => {
  it("returns setup for empty", () => {
    expect(detectPhase("")).toBe("setup");
  });
  it("returns planning for 计划", () => {
    expect(detectPhase("我们来看一下计划")).toBe("planning");
  });
  it("returns execution for 执行", () => {
    expect(detectPhase("开始执行")).toBe("execution");
  });
  it("returns review for 总结", () => {
    expect(detectPhase("总结一下")).toBe("review");
  });
});

describe("nextPhase", () => {
  it("advances to detected when later", () => {
    expect(nextPhase("setup", "execution")).toBe("execution");
  });
  it("keeps current when detected is earlier", () => {
    expect(nextPhase("review", "setup")).toBe("review");
  });
});
