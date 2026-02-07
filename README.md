# OpenClaw-RESIDUE

一种轻量上下文管理方案，适用于在小型VPS中部署的openclaw agent

## 仓库结构

| 路径 | 说明 |
|------|------|
| **openclaw-context-manager/** | 独立 npm 包：核心库 + CLI（`ocm`）+ HTTP API + OpenClaw Skills |
| **docs/** | 使用说明 |

## 快速开始

1. **安装并初始化上下文管理器**
   ```bash
   cd openclaw-context-manager
   npm install
   npm run build
   node dist/bin/ocm.js init
   ```

2. **文档**
   - [使用说明（安装、配置、CLI、API、集成）](docs/USAGE.md)

## 主要能力

- **Hard State**：目标、约束、能力等不可丢失状态（YAML 持久化）
- **Assertions**：决策 / 待办 / 否定 / 事实等可推导断言（JSON append-only）
- **Prompt 构建**：Turn 级拼接 Hard State + 最近 N 条断言 + 用户输入
- **自动抽取**：从模型输出中按规则抽取 decision / todo / rejection / fact
- **阶段感知**：setup → planning → execution → review 状态机
- **HTTP API**：`GET /state`、`POST /assertion`、`POST /review`，便于 bot 或脚本调用
- **OpenClaw Skills**：`ocm-state`、`ocm-review` 可直接复制到 `~/.openclaw/skills/`

