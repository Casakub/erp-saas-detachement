import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const backendRoot = resolve(__dirname, "..", "..", "..");

function assertDirectory(path: string): void {
  assert.ok(existsSync(path), `missing directory: ${path}`);
  assert.ok(statSync(path).isDirectory(), `expected directory: ${path}`);
}

test("substrate gate: required backend directories exist", () => {
  const requiredDirectories = [
    "modules",
    "shared",
    "migrations",
    "runbooks",
    "tests",
    "src"
  ];

  for (const rel of requiredDirectories) {
    assertDirectory(join(backendRoot, rel));
  }
});

test("substrate gate: required runbooks exist", () => {
  const requiredRunbooks = ["bootstrap_local.md", "rollback_migrations.md"];

  for (const runbook of requiredRunbooks) {
    const absolutePath = join(backendRoot, "runbooks", runbook);
    assert.ok(existsSync(absolutePath), `missing runbook: ${absolutePath}`);
  }
});
