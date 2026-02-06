# openclaw-context-manager

OpenClaw 上下文管理：Hard State + Assertions 的独立 npm 包，提供核心库、CLI（`ocm`）和轻量 HTTP API，可与 OpenClaw 通过 Skills 集成。

- **核心库** — 可在任意 Node.js/TS 项目中 `import` 使用
- **CLI** — `ocm` 命令行，支持脚本与手动操作
- **HTTP Server** — REST API：`GET /state`、`POST /assertion`、`POST /review`
- **OpenClaw Skill 目录** — 可复制到 `~/.openclaw/skills/` 做深度集成

## 要求

- Node.js >= 18
- TypeScript 5.x（开发）

## 安装

```bash
# 全局安装
npm install -g openclaw-context-manager

# 或在项目中
npm install openclaw-context-manager
```

## 快速开始

```bash
# 1. 在 bot 工作目录初始化
cd /path/to/my-bot
ocm init

# 2. 查看当前状态
ocm state
ocm assertions --limit 20

# 3. 手动添加断言
ocm assert --type decision --content "选择方案A"

# 4. 一次 turn（管道输入 + 模型输出用于抽取）
echo "用户输入" | ocm turn --model-output "模型输出文本"

# 5. 触发 review
ocm review

# 6. 启动 HTTP API（可选）
ocm serve --port 7799
```

## 配置文件

在项目根目录放置 `ocm.config.json`：

```json
{
  "dataDir": "./data/openclaw",
  "assertions": { "maxActive": 100, "defaultLimit": 10 },
  "extractor": { "enabled": true, "customRules": [] },
  "server": { "port": 7799 },
  "phase": { "autoDetect": true }
}
```

环境变量：`OCM_DATA_DIR`、`OCM_SERVER_PORT`。

## 数据目录结构

```
{dataDir}/
  state/
    current_state.yaml    # Hard State
    assertions.json       # Assertions（append-only）
    history/              # Hard State 历史
  temp/
  logs/
```

## HTTP API

默认端口 `7799`。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | /state | 返回 `{ state, assertions }` |
| POST | /assertion | Body: `{ type, content }`，新增断言 |
| POST | /review | 将 phase 设为 review |

## OpenClaw 集成

将包内 skills 复制到 OpenClaw 目录：

```bash
cp -r node_modules/openclaw-context-manager/skills/* ~/.openclaw/skills/
```

- **ocm-state** — 查询当前状态（/state）
- **ocm-review** — 触发 review 汇总（/review）

## 开发

```bash
git clone <repo>
cd openclaw-context-manager
npm install
npm run build
npm test
```

## License

MIT
