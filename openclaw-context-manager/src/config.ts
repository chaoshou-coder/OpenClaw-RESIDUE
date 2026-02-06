import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export interface AssertionsConfig {
  maxActive: number;
  defaultLimit: number;
}

export interface ExtractorConfig {
  enabled: boolean;
  customRules: Array<{ type: string; pattern: string; flags?: string }>;
}

export interface ServerConfig {
  port: number;
}

export interface PhaseConfig {
  autoDetect: boolean;
}

export interface OcmConfig {
  dataDir: string;
  assertions: AssertionsConfig;
  extractor: ExtractorConfig;
  server: ServerConfig;
  phase: PhaseConfig;
}

const DEFAULT_CONFIG: OcmConfig = {
  dataDir: "./data/openclaw",
  assertions: {
    maxActive: 100,
    defaultLimit: 10,
  },
  extractor: {
    enabled: true,
    customRules: [],
  },
  server: {
    port: 7799,
  },
  phase: {
    autoDetect: true,
  },
};

function loadConfig(cwd: string): OcmConfig {
  const paths = [
    resolve(cwd, "ocm.config.json"),
    resolve(cwd, "ocm.config.yaml"),
  ];
  let yamlParse: ((s: string) => unknown) | null = null;
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      const raw = readFileSync(p, "utf-8");
      const data = p.endsWith(".json")
        ? JSON.parse(raw)
        : (yamlParse ??= require("yaml").parse)(raw);
      return deepMerge(
        DEFAULT_CONFIG as unknown as Record<string, unknown>,
        data as Record<string, unknown>
      ) as unknown as OcmConfig;
    } catch {
      // ignore parse errors, fall back to default
    }
  }
  return { ...DEFAULT_CONFIG };
}

function deepMerge(base: Record<string, unknown>, over: Record<string, unknown>): Record<string, unknown> {
  const out = { ...base };
  for (const k of Object.keys(over)) {
    const v = over[k];
    if (v == null) continue;
    const b = base[k];
    if (typeof v === "object" && !Array.isArray(v) && typeof b === "object" && b != null && !Array.isArray(b)) {
      out[k] = deepMerge(b as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

let cachedConfig: OcmConfig | null = null;
let cachedCwd: string | null = null;

/**
 * Get config: default + user ocm.config.json (from cwd) + env.
 * Env: OCM_DATA_DIR, OCM_SERVER_PORT, etc.
 */
export function getConfig(cwd: string = process.cwd()): OcmConfig {
  if (cachedConfig && cachedCwd === cwd) return cachedConfig;
  cachedCwd = cwd;
  cachedConfig = loadConfig(cwd);
  if (process.env.OCM_DATA_DIR) cachedConfig.dataDir = process.env.OCM_DATA_DIR;
  if (process.env.OCM_SERVER_PORT) {
    const p = parseInt(process.env.OCM_SERVER_PORT, 10);
    if (!Number.isNaN(p)) cachedConfig.server.port = p;
  }
  return cachedConfig;
}

export function resetConfigCache(): void {
  cachedConfig = null;
  cachedCwd = null;
}
