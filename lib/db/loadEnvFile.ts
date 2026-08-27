import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_CANDIDATES = [
  resolve(process.cwd(), "env"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
];

function parseEnvFile(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function loadWorkspaceEnv(): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const filePath of ENV_CANDIDATES) {
    if (!existsSync(filePath)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(filePath, "utf8")));
  }
  return merged;
}

export function readEnvValue(name: string, fallback = ""): string {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;
  const fromFile = loadWorkspaceEnv()[name]?.trim();
  return fromFile || fallback;
}
