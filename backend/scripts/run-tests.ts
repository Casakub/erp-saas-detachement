import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

function collectTestFiles(rootDir: string, acc: string[]): void {
  if (!existsSync(rootDir)) {
    return;
  }

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      collectTestFiles(fullPath, acc);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.js")) {
      acc.push(fullPath);
    }
  }
}

const candidates: string[] = [];
collectTestFiles(resolve("dist/tests"), candidates);
collectTestFiles(resolve("dist/modules"), candidates);

if (candidates.length === 0) {
  console.error("No compiled tests found under dist/tests or dist/modules.");
  process.exit(1);
}

candidates.sort();

const result = spawnSync(process.execPath, ["--test", ...candidates], { stdio: "inherit" });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
