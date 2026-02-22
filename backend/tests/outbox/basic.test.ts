import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const backendRoot = resolve(__dirname, "..", "..", "..");
const repoRoot = resolve(backendRoot, "..");

test("substrate gate: supabase migrations are wired to backend/migrations", () => {
  const supabaseConfigPath = join(repoRoot, "supabase", "config.toml");
  const content = readFileSync(supabaseConfigPath, "utf8");

  assert.match(content, /\[db\.migrations\]/);
  assert.match(content, /backend\/migrations\/\*\.sql/);
});
