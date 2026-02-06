#!/usr/bin/env node
import { program } from "commander";
import { resolve } from "node:path";
import { mkdirSync, existsSync, copyFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { getConfig } from "../src/config.js";
import { loadHardState } from "../src/state/hard-state.js";
import { appendAssertion, getLatestAssertions, filterByType } from "../src/state/assertions.js";
import { SessionManager } from "../src/session/manager.js";
import { startServer } from "../src/server/index.js";
import type { AssertionType } from "../src/types.js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin });
    const lines: string[] = [];
    rl.on("line", (line) => lines.push(line));
    rl.on("close", () => resolve(lines.join("\n")));
  });
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..", "..");

program
  .name("ocm")
  .description("OpenClaw Context Manager — Hard State + Assertions CLI")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize data directory and config")
  .option("--data-dir <path>", "Data directory path")
  .action((opts) => {
    const config = getConfig();
    const dataDir = resolve(process.cwd(), opts.dataDir ?? config.dataDir);
    const stateDir = resolve(dataDir, "state");
    const tempDir = resolve(dataDir, "temp");
    const logsDir = resolve(dataDir, "logs");
    const historyDir = resolve(stateDir, "history");
    for (const d of [stateDir, tempDir, logsDir, historyDir]) {
      if (!existsSync(d)) {
        mkdirSync(d, { recursive: true });
        console.log("Created:", d);
      }
    }
    const statePath = resolve(stateDir, "current_state.yaml");
    if (!existsSync(statePath)) {
      const template = resolve(PKG_ROOT, "templates", "current_state.yaml");
      copyFileSync(template, statePath);
      console.log("Created:", statePath, "(from template)");
    }
    console.log("Data dir:", dataDir);
  });

program
  .command("state")
  .description("Show current Hard State")
  .action(() => {
    const config = getConfig();
    const dataDir = resolve(process.cwd(), config.dataDir);
    const state = loadHardState(dataDir);
    console.log(JSON.stringify(state, null, 2));
  });

program
  .command("assertions")
  .description("List assertions")
  .option("--limit <n>", "Max items", "20")
  .option("--type <type>", "Filter by type: fact|decision|rejection|todo")
  .action((opts) => {
    const config = getConfig();
    const dataDir = resolve(process.cwd(), config.dataDir);
    const limit = parseInt(opts.limit, 10) || 20;
    let list = getLatestAssertions(dataDir, limit);
    if (opts.type) {
      const t = opts.type as AssertionType;
      if (["fact", "decision", "rejection", "todo"].includes(t)) {
        list = filterByType(list, t);
      }
    }
    console.log(JSON.stringify(list, null, 2));
  });

program
  .command("assert")
  .description("Manually add an assertion")
  .requiredOption("--type <type>", "fact|decision|rejection|todo")
  .requiredOption("--content <text>", "Assertion content")
  .action((opts) => {
    const config = getConfig();
    const dataDir = resolve(process.cwd(), config.dataDir);
    const type = opts.type as AssertionType;
    const a = appendAssertion(dataDir, {
      type,
      content: opts.content,
      source: "manual",
    });
    console.log("Added:", a.id, a.type, a.content);
  });

program
  .command("turn")
  .description("Run one turn (pipe user input, pass --model-output)")
  .option("--model-output <text>", "Model output for extraction")
  .action(async (opts) => {
    const userInput = await readStdin();
    const mgr = new SessionManager();
    const result = mgr.turn(userInput.trim(), opts.modelOutput);
    console.log(JSON.stringify({ prompt: result.prompt, phase: result.phase }));
  });

program
  .command("review")
  .description("Trigger review summarization")
  .action(() => {
    const mgr = new SessionManager();
    const phase = mgr.review();
    console.log("Phase set to:", phase);
  });

program
  .command("serve")
  .description("Start HTTP API server")
  .option("--port <port>", "Port", "7799")
  .action(async (opts) => {
    const port = parseInt(opts.port, 10) || 7799;
    const { url, close } = await startServer({ port });
    console.log("Server at", url);
    process.on("SIGINT", () => close().then(() => process.exit(0)));
  });

program
  .command("export")
  .description("Export/backup state")
  .option("--output <path>", "Output path", "backup.tar.gz")
  .action((opts) => {
    console.log("Export: output =", opts.output);
  });

program.parse();
