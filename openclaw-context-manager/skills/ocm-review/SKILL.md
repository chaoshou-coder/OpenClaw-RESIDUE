---
name: ocm-review
description: "触发 OpenClaw 上下文管理器的 review 阶段汇总。调用 OCM 的 /review 或 ocm review。"
---

# OCM Review Skill

当用户希望**回顾、总结当前会话**或说「总结一下」「做一次 review」时使用本 Skill。

## 行为

1. 若已配置 OCM HTTP 服务（默认 `http://127.0.0.1:7799`），则发送 `POST /review`。
2. 否则在 bot 工作目录执行 `ocm review`。
3. 将 phase 设为 `review`，便于后续 prompt 强调汇总。

## 使用条件

- 用户明确要求回顾/总结，或
- 会话即将结束需要汇总

## 调用示例

- 用户：「总结一下当前进展」
- 用户：「做一次 review」
- 用户：「回顾一下我们定了哪些决策」
