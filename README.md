# OpenClaw-RESIDUE

本仓库为 **OpenClaw 上下文管理系统** 的落地实现与配套工具，基于计划 [上下文管理系统落地](.cursor/plans/上下文管理系统落地_33f7a842.plan.md) 完成开发与验收。

## 仓库结构

| 路径 | 说明 |
|------|------|
| **openclaw-context-manager/** | 独立 npm 包：核心库 + CLI（`ocm`）+ HTTP API + OpenClaw Skills |
| **simplerig/** | SimpleRig 多阶段开发工作流（本项目的开发流程工具） |
| **docs/** | 详细结束文档与使用说明 |
| **.cursor/plans/** | 开发计划与规划文档 |

## 快速开始

1. **安装并初始化上下文管理器**
   ```bash
   cd openclaw-context-manager
   npm install
   npm run build
   node dist/bin/ocm.js init
   ```

2. **查看完整文档**
   - [详细结束文档（项目总结与交付清单）](docs/DOCUMENTATION.md)
   - [使用说明（安装、配置、CLI、API、集成）](docs/USAGE.md)
   - [openclaw-context-manager 包说明](openclaw-context-manager/README.md)

## 主要能力

- **Hard State**：目标、约束、能力等不可丢失状态（YAML 持久化）
- **Assertions**：决策 / 待办 / 否定 / 事实等可推导断言（JSON append-only）
- **Prompt 构建**：Turn 级拼接 Hard State + 最近 N 条断言 + 用户输入
- **自动抽取**：从模型输出中按规则抽取 decision / todo / rejection / fact
- **阶段感知**：setup → planning → execution → review 状态机
- **HTTP API**：`GET /state`、`POST /assertion`、`POST /review`，便于 bot 或脚本调用
- **OpenClaw Skills**：`ocm-state`、`ocm-review` 可直接复制到 `~/.openclaw/skills/`

## 许可证

MIT（见各子项目说明）
