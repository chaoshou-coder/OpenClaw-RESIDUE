# OpenClaw 上下文管理器 — 使用说明

本文档为 **openclaw-context-manager** 的详细使用说明，包括安装、配置、CLI、HTTP API、OpenClaw 集成与常见问题。

---

## 1. 安装

### 1.1 环境要求

- **Node.js** >= 18  
- （可选）TypeScript 5.x，用于本地开发与测试  

### 1.2 安装方式

**全局安装（推荐用于 CLI）**

```bash
npm install -g openclaw-context-manager
```

安装后可直接使用 `ocm` 命令。

**项目内安装（用于库 + CLI）**

```bash
npm install openclaw-context-manager
```

- 使用库：`import { getConfig, loadHardState, buildPrompt, ... } from 'openclaw-context-manager'`  
- 使用 CLI：`npx ocm <command>` 或配置 scripts 调用  

**从本仓库安装（开发/未发布时）**

```bash
cd /path/to/RESIDUE/openclaw-context-manager
npm install
npm run build
# 使用：node dist/bin/ocm.js <command> 或 npm link 后使用 ocm
```

---

## 2. 配置

### 2.1 配置文件

在**运行 ocm 时的当前工作目录**下放置 `ocm.config.json`（或 `ocm.config.yaml`），用于覆盖默认配置。

**示例 ocm.config.json**

```json
{
  "dataDir": "./data/openclaw",
  "assertions": {
    "maxActive": 100,
    "defaultLimit": 10
  },
  "extractor": {
    "enabled": true,
    "customRules": []
  },
  "server": {
    "port": 7799
  },
  "phase": {
    "autoDetect": true
  }
}
```

| 字段 | 说明 | 默认 |
|------|------|------|
| dataDir | 数据根目录（state、temp、logs 所在） | ./data/openclaw |
| assertions.maxActive | 断言数量上限（逻辑限制） | 100 |
| assertions.defaultLimit | 默认取最近多少条断言参与 prompt | 10 |
| extractor.enabled | 是否在 turn 时自动抽取断言 | true |
| extractor.customRules | 自定义规则（type + pattern） | [] |
| server.port | HTTP 服务端口 | 7799 |
| phase.autoDetect | 是否自动检测阶段 | true |

### 2.2 环境变量

- **OCM_DATA_DIR**：覆盖 `dataDir`（如 `export OCM_DATA_DIR=/var/lib/ocm`）  
- **OCM_SERVER_PORT**：覆盖 `server.port`（如 `export OCM_SERVER_PORT=8800`）  

---

## 3. CLI 使用

所有命令均在「当前工作目录」下解析配置与数据目录；`dataDir` 为相对路径时相对该目录。

### 3.1 初始化

```bash
ocm init [--data-dir <path>]
```

- 创建 `dataDir` 下的 `state/`、`temp/`、`logs/`、`state/history/`。  
- 若不存在 `state/current_state.yaml`，则从包内模板复制。  
- `--data-dir` 可指定本次初始化的数据目录（覆盖配置文件中的 dataDir）。  

**示例**

```bash
cd /path/to/my-bot
ocm init
# 或指定目录
ocm init --data-dir ./my-data
```

### 3.2 查看状态

```bash
ocm state
```

输出当前 Hard State 的 JSON（goal、constraints、capabilities、system_prompt、session_metadata 等）。

```bash
ocm assertions [--limit <n>] [--type <fact|decision|rejection|todo>]
```

输出断言列表（默认最近 20 条）；`--limit` 限制条数，`--type` 按类型过滤。

### 3.3 手动添加断言

```bash
ocm assert --type <fact|decision|rejection|todo> --content "<内容>"
```

向 `assertions.json` 追加一条 `source: "manual"` 的断言。

### 3.4 执行一次 Turn

```bash
echo "用户输入内容" | ocm turn --model-output "模型输出内容"
```

- **stdin**：当前轮次的用户输入。  
- **--model-output**：可选；若提供，则会对模型输出做规则抽取并追加断言（source: auto-extract）。  
- **输出**：单行 JSON `{"prompt":"...","phase":"..."}`，其中 `prompt` 为 Hard State + 最近 N 条断言 + 用户输入拼接结果。  

**示例（PowerShell）**

```powershell
"请实现登录" | node dist/bin/ocm.js turn --model-output "我们决定采用 JWT。下一步实现 token 刷新。"
```

### 3.5 触发 Review

```bash
ocm review
```

将当前阶段设为 `review`，便于后续 prompt 或流程做汇总。输出：`Phase set to: review`。

### 3.6 启动 HTTP 服务

```bash
ocm serve [--port <port>]
```

在指定端口（默认 7799）启动 API 服务；Ctrl+C 停止。

### 3.7 导出（占位）

```bash
ocm export [--output <path>]
```

当前为占位实现，可按需后续扩展为打包 state + assertions 等。

---

## 4. HTTP API

在运行 `ocm serve` 后，可对以下端点进行请求。

### 4.1 健康检查

- **GET /health**  
- 响应：`{"ok":true}`  

### 4.2 获取状态

- **GET /state**  
- 响应：`{ "state": <HardState>, "assertions": <Assertion[]> }`  
- `assertions` 为最近 `defaultLimit` 条。  

### 4.3 新增断言

- **POST /assertion**  
- Content-Type: `application/json`  
- Body：`{ "type": "decision"|"fact"|"rejection"|"todo", "content": "内容" }`  
- 成功：200，返回新创建的断言对象（含 id、time 等）。  
- 错误：400，缺少 type/content 或 type 非法时返回错误信息。  

### 4.4 触发 Review

- **POST /review**  
- 将内部 phase 设为 `review`。  
- 响应：`{"phase":"review"}`  

---

## 5. OpenClaw 集成

### 5.1 复制 Skills

将包内 skills 复制到 OpenClaw 的 skills 目录（路径以实际 OpenClaw 配置为准）：

```bash
# Linux/macOS
cp -r node_modules/openclaw-context-manager/skills/* ~/.openclaw/skills/

# Windows PowerShell（在项目目录下）
Copy-Item -Recurse node_modules\openclaw-context-manager\skills\* ~/.openclaw/skills/
```

### 5.2 提供的 Skills

- **ocm-state**：当用户询问「当前状态」「目标与约束」「有哪些决策/待办」时，可调用 GET /state 或执行 `ocm state` + `ocm assertions`，并概括展示。  
- **ocm-review**：当用户要求「总结」「做一次 review」时，可调用 POST /review 或执行 `ocm review`，并将 phase 设为 review。  

使用方式以 OpenClaw 的 Skill 加载与调用约定为准（如 slash 命令或自然语言触发）。  

---

## 6. 库接口摘要

在 Node/TS 项目中：

```ts
import {
  getConfig,
  loadHardState,
  saveHardState,
  loadAssertions,
  appendAssertion,
  getLatestAssertions,
  buildPrompt,
  extractAssertions,
  SessionManager,
  detectPhase,
  startServer,
} from 'openclaw-context-manager';
```

- **getConfig(cwd?)**：获取合并后的配置。  
- **loadHardState(dataDir)** / **saveHardState(dataDir, state)**：读写 Hard State。  
- **loadAssertions(dataDir)** / **appendAssertion(dataDir, assertion)** / **getLatestAssertions(dataDir, limit)**：断言读写与最近 N 条。  
- **buildPrompt(hardState, assertions, userInput, options?)**：生成 turn 级 prompt。  
- **extractAssertions(modelOutput, options?)**：从模型输出抽取断言（不写盘，需自行 append）。  
- **SessionManager**：start、turn、review、end。  
- **detectPhase(text)** / **nextPhase(current, detected)**：阶段检测与推进。  
- **startServer(options?)**：启动 Fastify 服务，返回 `{ url, close }`。  

更细的类型与选项见包内 `dist/index.d.ts` 或源码。  

---

## 7. 常见问题

**Q：CLI 找不到 ocm？**  
- 全局安装后请确认 npm global bin 在 PATH 中（如 `npm config get prefix` 对应目录下的 bin）。  
- 或使用 `npx ocm` / `node node_modules/openclaw-context-manager/dist/bin/ocm.js`。  

**Q：数据目录在哪里？**  
- 默认是当前工作目录下的 `./data/openclaw`；可通过 `ocm.config.json` 的 `dataDir` 或环境变量 `OCM_DATA_DIR` 修改。  

**Q：中文在终端乱码？**  
- 多为 Windows 控制台编码问题；API 返回的 JSON 编码正确，可优先通过 API 或脚本使用。  

**Q：如何只使用库、不启动 HTTP？**  
- 仅 `import` 所需函数与类即可；不调用 `startServer` 或执行 `ocm serve` 即不会启动服务。  

---

更多实现细节见 [openclaw-context-manager/README.md](../openclaw-context-manager/README.md) 与 [DOCUMENTATION.md](DOCUMENTATION.md)。
