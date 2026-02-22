import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const backendRoot = resolve(__dirname, "..", "..", "..");
const migrationsRoot = join(backendRoot, "migrations");

const MIGRATION_NAME = /^[0-9]{14}__lot[0-9]+_m[0-9a-z]+_[0-9a-z_]+\.sql$/;

test("substrate gate: at least one SQL migration is present", () => {
  const entries = readdirSync(migrationsRoot).filter((entry) => entry.endsWith(".sql"));
  assert.ok(entries.length > 0, "expected at least one SQL migration under backend/migrations");

  for (const entry of entries) {
    assert.match(entry, MIGRATION_NAME);

    const migrationPath = join(migrationsRoot, entry);
    assert.ok(statSync(migrationPath).isFile(), `expected file: ${migrationPath}`);

    const body = readFileSync(migrationPath, "utf8").trim();
    assert.ok(body.length > 0, `migration should not be empty: ${entry}`);
  }
});
