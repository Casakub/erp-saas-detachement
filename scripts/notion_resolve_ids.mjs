#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const ROOT_PAGE_ID_32 = "308688d6a59680d8950feccf07ea2018";
const SECTION10_PAGE_ID_32 = "30b688d6a59680e6967cd98ee0aa6a50";
const ROOT_SCOPE_IDS = new Set([ROOT_PAGE_ID_32, SECTION10_PAGE_ID_32]);
const ID32_REGEX = /([0-9a-f]{32})/i;
const MAX_UNMAPPABLE_PREVIEW = 50;

function info(message) {
  console.log(`INFO: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function normalizePath(input) {
  return String(input || "").replaceAll("\\", "/");
}

function normalizePathForLockCheck(input) {
  return normalizePath(input).normalize("NFD").toLowerCase();
}

function isLockedPath(input) {
  const normalized = normalizePathForLockCheck(input);
  if (normalized.includes("(locked)")) {
    return true;
  }
  return normalized.includes("socle technique") && normalized.includes("locked");
}

function isMarkdownPath(input) {
  return normalizePath(input).toLowerCase().endsWith(".md");
}

function isOutOfScopePath(input) {
  const normalized = normalizePath(input).toLowerCase();
  return normalized.startsWith("backend/") || normalized.startsWith("supabase/");
}

function toPageId32(input) {
  const clean = String(input || "").replace(/-/g, "").trim().toLowerCase();
  return /^[0-9a-f]{32}$/.test(clean) ? clean : null;
}

function toCanonicalPageId(input) {
  const id32 = toPageId32(input);
  if (!id32) {
    return null;
  }
  return `${id32.slice(0, 8)}-${id32.slice(8, 12)}-${id32.slice(12, 16)}-${id32.slice(16, 20)}-${id32.slice(20)}`;
}

function extractId32FromPath(input) {
  const match = normalizePath(input).match(ID32_REGEX);
  return match ? match[1].toLowerCase() : null;
}

function basenameWithoutMd(filePath) {
  const base = path.posix.basename(normalizePath(filePath));
  return base.endsWith(".md") ? base.slice(0, -3) : base;
}

function normalizeTitleBasic(input) {
  return String(input || "")
    .normalize("NFC")
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitleFolded(input) {
  return normalizeTitleBasic(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(input) {
  return new Set(
    normalizeTitleFolded(input)
      .split(/[^a-z0-9]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
  );
}

function jaccard(aSet, bSet) {
  const a = new Set(aSet);
  const b = new Set(bSet);
  if (a.size === 0 && b.size === 0) {
    return 1;
  }

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function levenshteinDistance(aRaw, bRaw) {
  const a = String(aRaw || "");
  const b = String(bRaw || "");
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) {
    return bLen;
  }
  if (bLen === 0) {
    return aLen;
  }

  const dp = Array.from({ length: aLen + 1 }, () => new Array(bLen + 1).fill(0));
  for (let i = 0; i <= aLen; i += 1) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= bLen; j += 1) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= aLen; i += 1) {
    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[aLen][bLen];
}

function levenshteinRatio(a, b) {
  const maxLen = Math.max(String(a || "").length, String(b || "").length);
  if (maxLen === 0) {
    return 1;
  }
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function titleScore(baseTitle, candidateTitle) {
  const baseBasic = normalizeTitleBasic(baseTitle);
  const candBasic = normalizeTitleBasic(candidateTitle);
  const baseFolded = normalizeTitleFolded(baseTitle);
  const candFolded = normalizeTitleFolded(candidateTitle);

  const exactNormalized = baseBasic === candBasic;
  if (exactNormalized) {
    return { exactNormalized, baseScore: 1 };
  }

  const lev = levenshteinRatio(baseFolded, candFolded);
  const jac = jaccard(tokenize(baseFolded), tokenize(candFolded));
  const containsBonus =
    baseFolded.length > 0 && candFolded.length > 0 && (baseFolded.includes(candFolded) || candFolded.includes(baseFolded))
      ? 0.05
      : 0;

  const baseScore = Math.min(1, lev * 0.65 + jac * 0.35 + containsBonus);
  return { exactNormalized: false, baseScore };
}

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith("--")) {
      continue;
    }
    let k = raw;
    let v = "true";

    if (raw.includes("=")) {
      [k, v] = raw.split(/=(.*)/s, 2);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      v = argv[i + 1];
      i += 1;
    }

    args.set(k, v);
  }
  return args;
}

function getTrackedMarkdownFiles() {
  const out = execFileSync("git", ["-c", "core.quotepath=false", "ls-files", "*.md"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return out
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => isMarkdownPath(line));
}

function buildCandidates(trackedMdFiles) {
  const nonLocked = trackedMdFiles.filter((p) => !isLockedPath(p));
  const inScope = nonLocked.filter((p) => !isOutOfScopePath(p));
  const alreadyHasId = inScope.filter((p) => ID32_REGEX.test(normalizePath(p)));
  const candidatesToRename = inScope.filter((p) => !ID32_REGEX.test(normalizePath(p)));

  return {
    nonLocked,
    inScope,
    alreadyHasId,
    candidatesToRename
  };
}

async function notionRequest(token, method, endpoint, body) {
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${endpoint} failed (${response.status}): ${text.slice(0, 500)}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

function extractPageTitle(page) {
  if (!page || page.object !== "page") {
    return "";
  }

  if (Array.isArray(page.title)) {
    const title = page.title.map((t) => t?.plain_text || t?.text?.content || "").join("").trim();
    if (title.length > 0) {
      return title;
    }
  }

  const props = page.properties && typeof page.properties === "object" ? Object.values(page.properties) : [];
  for (const prop of props) {
    if (prop?.type === "title" && Array.isArray(prop.title)) {
      const title = prop.title.map((t) => t?.plain_text || t?.text?.content || "").join("").trim();
      if (title.length > 0) {
        return title;
      }
    }
  }

  return "";
}

function buildQueryVariants(baseTitle) {
  const variants = [
    baseTitle,
    baseTitle.replace(/\s+\([^)]*\)\s*$/, "").trim(),
    baseTitle.includes(" — ") ? baseTitle.split(" — ").slice(0, 2).join(" — ").trim() : baseTitle
  ];

  const seen = new Set();
  const unique = [];
  for (const variant of variants) {
    const normalized = normalizeTitleBasic(variant);
    if (normalized.length === 0) {
      continue;
    }
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(normalized.slice(0, 200));
    }
  }

  return unique;
}

async function searchNotionPages(token, query) {
  const results = [];
  let cursor = null;

  for (let page = 0; page < 3; page += 1) {
    const payload = {
      query,
      filter: { property: "object", value: "page" },
      page_size: 100
    };

    if (cursor) {
      payload.start_cursor = cursor;
    }

    const data = await notionRequest(token, "POST", "/search", payload);
    for (const item of data.results || []) {
      if (item?.object === "page") {
        results.push(item);
      }
    }

    if (!data.has_more || !data.next_cursor) {
      break;
    }
    cursor = data.next_cursor;
  }

  return results;
}

async function fetchParentObject(token, parentRef, cache) {
  if (!parentRef || typeof parentRef !== "object") {
    return null;
  }

  const type = parentRef.type;
  const rawId =
    type === "page_id"
      ? parentRef.page_id
      : type === "database_id"
        ? parentRef.database_id
        : type === "block_id"
          ? parentRef.block_id
          : null;

  const id32 = toPageId32(rawId);
  if (!type || !id32) {
    return null;
  }

  const cacheKey = `${type}:${id32}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  let endpoint = null;
  if (type === "page_id") {
    endpoint = `/pages/${toCanonicalPageId(id32)}`;
  } else if (type === "database_id") {
    endpoint = `/databases/${toCanonicalPageId(id32)}`;
  } else if (type === "block_id") {
    endpoint = `/blocks/${toCanonicalPageId(id32)}`;
  }

  if (!endpoint) {
    cache.set(cacheKey, null);
    return null;
  }

  try {
    const data = await notionRequest(token, "GET", endpoint);
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    warn(`parent fetch failed for ${cacheKey}: ${String(error.message || error)}`);
    cache.set(cacheKey, null);
    return null;
  }
}

async function isUnderExpectedTree(token, page, cache) {
  const currentId32 = toPageId32(page?.id);
  if (currentId32 && ROOT_SCOPE_IDS.has(currentId32)) {
    return true;
  }

  let parent = page?.parent ?? null;
  let hop = 0;
  while (parent && hop < 15) {
    hop += 1;

    if (parent.type === "workspace") {
      return false;
    }

    const parentId32 =
      parent.type === "page_id"
        ? toPageId32(parent.page_id)
        : parent.type === "database_id"
          ? toPageId32(parent.database_id)
          : parent.type === "block_id"
            ? toPageId32(parent.block_id)
            : null;

    if (parentId32 && ROOT_SCOPE_IDS.has(parentId32)) {
      return true;
    }

    const parentObject = await fetchParentObject(token, parent, cache);
    if (!parentObject || !parentObject.parent) {
      return false;
    }

    parent = parentObject.parent;
  }

  return false;
}

function computeDecision(best, secondBestScore) {
  if (!best) {
    return "SKIP_NOT_FOUND";
  }

  const hasStrongScore = best.score >= 0.92 || best.exactNormalized;
  const hasClearGap = best.score - secondBestScore >= 0.05;

  if (hasStrongScore && hasClearGap) {
    return "RENAME";
  }

  return "SKIP_AMBIGUOUS";
}

function makeRow(values) {
  return `| ${values.map((value) => String(value ?? "").replaceAll("|", "\\|")).join(" | ")} |`;
}

async function resolveCandidates(token, candidatesToRename) {
  const parentCache = new Map();
  const rows = [];

  for (const file of candidatesToRename) {
    const baseTitle = basenameWithoutMd(file);
    const queryVariants = buildQueryVariants(baseTitle);

    const pageById = new Map();
    for (const query of queryVariants) {
      const found = await searchNotionPages(token, query);
      for (const page of found) {
        const pageId32 = toPageId32(page.id);
        if (!pageId32) {
          continue;
        }
        if (!pageById.has(pageId32)) {
          pageById.set(pageId32, page);
        }
      }
    }

    const candidates = [];
    for (const page of pageById.values()) {
      const candidateTitle = extractPageTitle(page);
      if (!candidateTitle) {
        continue;
      }

      const { exactNormalized, baseScore } = titleScore(baseTitle, candidateTitle);
      candidates.push({
        page,
        pageId32: toPageId32(page.id),
        title: candidateTitle,
        exactNormalized,
        baseScore,
        treeBonus: 0,
        score: baseScore
      });
    }

    candidates.sort((a, b) => b.score - a.score);
    const bonusPool = candidates.slice(0, 8);
    for (const candidate of bonusPool) {
      const inExpectedTree = await isUnderExpectedTree(token, candidate.page, parentCache);
      if (inExpectedTree) {
        candidate.treeBonus = 0.05;
        candidate.score = Math.min(1, candidate.baseScore + candidate.treeBonus);
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    const best = candidates[0] || null;
    const secondBestScore = candidates[1] ? candidates[1].score : 0;
    let decision = computeDecision(best, secondBestScore);

    let proposedPath = "";
    if (decision === "RENAME" && best?.pageId32) {
      const newPath = `${file.slice(0, -3)} ${best.pageId32}.md`;
      if (existsSync(path.resolve(process.cwd(), newPath))) {
        decision = "SKIP_CONFLICT";
      } else {
        proposedPath = newPath;
      }
    }

    rows.push({
      file,
      baseTitle,
      bestMatchTitle: best?.title || "",
      pageId32: best?.pageId32 || "",
      score: best ? best.score : 0,
      decision,
      proposedPath
    });

    info(`resolved: ${file} -> ${decision}${best ? ` (score=${best.score.toFixed(3)})` : ""}`);
  }

  return rows;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const jsonOut = args.get("--json-out") || "";

  const trackedMdFiles = getTrackedMarkdownFiles();
  const inv = buildCandidates(trackedMdFiles);

  info(`tracked_md_count: ${trackedMdFiles.length}`);
  info(`non_locked_md_count: ${inv.nonLocked.length}`);
  info(`in_scope_md_count: ${inv.inScope.length}`);
  info(`already_has_id_count: ${inv.alreadyHasId.length}`);
  info(`candidates_to_rename_count: ${inv.candidatesToRename.length}`);

  if (inv.candidatesToRename.length === 0) {
    ok("nothing to resolve");
    return;
  }

  const token = String(process.env.NOTION_TOKEN || "").trim();
  if (!token) {
    warn("NOTION_TOKEN missing locally: CI-only mode active");
    warn("candidates_to_rename list:");
    for (const file of inv.candidatesToRename) {
      console.log(`- ${file}`);
    }

    const rows = inv.candidatesToRename.map((file) => ({
      file,
      baseTitle: basenameWithoutMd(file),
      bestMatchTitle: "",
      pageId32: "",
      score: 0,
      decision: "TOKEN_MISSING",
      proposedPath: ""
    }));

    console.log("\n| file | base_title | best_match_title | page_id | score | decision | proposed_new_path |");
    console.log("| --- | --- | --- | --- | --- | --- | --- |");
    for (const row of rows) {
      console.log(makeRow([row.file, row.baseTitle, row.bestMatchTitle, row.pageId32, row.score.toFixed(3), row.decision, row.proposedPath]));
    }

    if (jsonOut) {
      writeFileSync(jsonOut, JSON.stringify({ generated_at: new Date().toISOString(), rows }, null, 2));
      info(`json report written: ${jsonOut}`);
    }

    return;
  }

  const rows = await resolveCandidates(token, inv.candidatesToRename);

  const decisionCounts = rows.reduce((acc, row) => {
    acc[row.decision] = (acc[row.decision] || 0) + 1;
    return acc;
  }, {});

  info(`decision_counts: ${JSON.stringify(decisionCounts)}`);

  const unmappable = rows.filter((r) => r.decision !== "RENAME");
  if (unmappable.length > 0) {
    const preview = unmappable.slice(0, MAX_UNMAPPABLE_PREVIEW).map((r) => `${r.file} => ${r.decision}`);
    warn(`needs_manual_mapping (max ${MAX_UNMAPPABLE_PREVIEW}):\n- ${preview.join("\n- ")}`);
  }

  console.log("\n| file | base_title | best_match_title | page_id | score | decision | proposed_new_path |");
  console.log("| --- | --- | --- | --- | --- | --- | --- |");
  for (const row of rows) {
    console.log(
      makeRow([
        row.file,
        row.baseTitle,
        row.bestMatchTitle,
        row.pageId32,
        row.score.toFixed(3),
        row.decision,
        row.proposedPath
      ])
    );
  }

  if (jsonOut) {
    writeFileSync(
      jsonOut,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          rows,
          decision_counts: decisionCounts
        },
        null,
        2
      )
    );
    info(`json report written: ${jsonOut}`);
  }
}

function ok(message) {
  console.log(`OK: ${message}`);
}

await main();
