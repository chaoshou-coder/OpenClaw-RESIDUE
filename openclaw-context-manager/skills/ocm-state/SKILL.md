---
name: ocm-state
description: "查询 OpenClaw 上下文管理器的当前状态（Hard State + 最新 Assertions）。调用 GET /state 或 ocm state / ocm assertions。"
---

# OCM State Skill

当用户希望**查看当前目标、约束、或已记录的决策/待办/事实**时使用本 Skill。

## 行为

1. 若已配置 OCM HTTP 服务（默认 `http://127.0.0.1:7799`），则请求 `GET /state`，返回 `{ state, assertions }`。
2. 否则在 bot 工作目录执行 `ocm state` 与 `ocm assertions --limit 20`，合并展示。
3. 用自然语言概括：目标、约束、最近决策、待办、事实。

## 使用条件

- 用户问「当前目标是什么」「我们定了哪些决策」「有什么待办」
- 用户要求「看一下当前状态」

## 调用示例

- 用户：「当前状态是什么」
- 用户：「我们有哪些决策和待办」
- 用户：「目标与约束是什么」
