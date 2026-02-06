import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { nanoid } from "nanoid";
import type { Assertion, AssertionType, AssertionSource } from "../types.js";

const DEFAULT_SOURCE: AssertionSource = "manual";
const DEFAULT_STATUS = "pending" as const;

/**
 * Resolve path to assertions.json under dataDir.
 */
export function getAssertionsPath(dataDir: string): string {
  return resolve(dataDir, "state", "assertions.json");
}

/**
 * Load all assertions from JSON file (append-only store). Returns [] if missing.
 */
export function loadAssertions(dataDir: string): Assertion[] {
  const path = getAssertionsPath(dataDir);
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Append one assertion and persist. Does not dedupe; ID is generated.
 */
export function appendAssertion(
  dataDir: string,
  assertion: Pick<Assertion, "type" | "content"> & Partial<Omit<Assertion, "id" | "time" | "type" | "content">> & { id?: string; time?: string }
): Assertion {
  const path = getAssertionsPath(dataDir);
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const list = existsSync(path) ? loadAssertions(dataDir) : [];
  const full: Assertion = {
    id: assertion.id ?? nanoid(),
    type: assertion.type,
    content: assertion.content,
    source: assertion.source ?? DEFAULT_SOURCE,
    status: assertion.status ?? DEFAULT_STATUS,
    time: assertion.time ?? new Date().toISOString(),
    phase: assertion.phase,
  };
  list.push(full);
  writeFileSync(path, JSON.stringify(list, null, 2), "utf-8");
  return full;
}

/**
 * Get latest N assertions (most recent last in array = tail).
 */
export function getLatestAssertions(dataDir: string, limit: number): Assertion[] {
  const list = loadAssertions(dataDir);
  if (list.length <= limit) return list;
  return list.slice(-limit);
}

/**
 * Filter assertions by type.
 */
export function filterByType(assertions: Assertion[], type: AssertionType): Assertion[] {
  return assertions.filter((a) => a.type === type);
}
