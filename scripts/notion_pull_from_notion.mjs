#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const MAP_FILE = "notion-sync-map.json";
const DIRECTION_FILE = "notion-sync-direction.json";
const REPORT_PATH = ".artifacts/notion-pull-report.json";

const DIRECTION_GITHUB_MASTER = "github_master";
const DIRECTION_NOTION_MASTER = "notion_master";

function info(message) {
  console.log(`INFO: ${message}`);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function normalizePathForMatch(input) {
  return String(input).replaceAll("\\", "/").normalize("NFC");
}

function normalizePathForLockCheck(input) {
  return String(input).replaceAll("\\", "/").normalize("NFD").toLowerCase();
}

function isMarkdownPath(input) {
  return String(input).toLowerCase().endsWith(".md");
}

function isLockedPath(input) {
  const normalized = normalizePathForLockCheck(input);
  if (normalized.includes("(locked)")) {
    return true;
  }
  return normalized.includes("socle technique") && normalized.includes("locked");
}

function toPageId32(pageId) {
  const clean = String(pageId ?? "").replace(/-/g, "").trim().toLowerCase();
  return /^[0-9a-f]{32}$/.test(clean) ? clean : null;
}

function toCanonicalPageId(pageId) {
  const clean = toPageId32(pageId);
  if (!clean) {
    return null;
  }

  const variantNibble = clean[16];
  if (!/[89ab]/i.test(variantNibble)) {
    return null;
  }

  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
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
    throw new Error(`${method} ${endpoint} failed (${response.status}): ${text.slice(0, 800)}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

async function listChildren(token, blockId) {
  let cursor = null;
  const children = [];

  do {
    const search = new URLSearchParams({ page_size: "100" });
    if (cursor) {
      search.set("start_cursor", cursor);
    }

    const data = await notionRequest(token, "GET", `/blocks/${blockId}/children?${search.toString()}`);

    for (const child of data.results ?? []) {
      if (child && child.id) {
        children.push(child);
      }
    }

    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return children;
}

function richTextToMarkdown(richText = []) {
  if (!Array.isArray(richText)) {
    return "";
  }

  return richText
    .map((item) => {
      const base = String(item?.plain_text ?? "");
      if (base.length === 0) {
        return "";
      }

      let value = base;
      const annotations = item?.annotations ?? {};
      if (annotations.code) {
        value = `\`${value}\``;
      }
      if (annotations.bold) {
        value = `**${value}**`;
      }
      if (annotations.italic) {
        value = `*${value}*`;
      }
      if (annotations.strikethrough) {
        value = `~~${value}~~`;
      }

      const linkUrl = item?.href || item?.text?.link?.url || null;
      if (linkUrl) {
        value = `[${value}](${linkUrl})`;
      }

      return value;
    })
    .join("");
}

function normalizeMarkdown(markdown) {
  return String(markdown).replace(/\r\n/g, "\n").trimEnd();
}

function computeHash(markdown) {
  return createHash("sha256").update(normalizeMarkdown(markdown), "utf8").digest("hex");
}

function ensureTrailingNewline(markdown) {
  const normalized = normalizeMarkdown(markdown);
  return normalized.length === 0 ? "" : `${normalized}\n`;
}

function parseMapEntries(rawMap) {
  return Object.entries(rawMap)
    .map(([repoPath, value]) => {
      if (typeof repoPath !== "string") {
        return null;
      }

      if (typeof value === "string") {
        return { repoPath, pageId: value, directionOverride: null };
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (typeof value.page_id !== "string") {
          return null;
        }
        const directionOverride = typeof value.direction === "string" ? value.direction.trim().toLowerCase() : null;
        return { repoPath, pageId: value.page_id, directionOverride };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.repoPath.localeCompare(b.repoPath));
}

async function loadDirectionConfig() {
  const directionPath = path.resolve(process.cwd(), DIRECTION_FILE);
  if (!existsSync(directionPath)) {
    return {
      defaultDirection: DIRECTION_GITHUB_MASTER,
      notionMasterPaths: new Set()
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(await readFile(directionPath, "utf8"));
  } catch (error) {
    throw new Error(`unable to parse ${DIRECTION_FILE}: ${String(error.message)}`);
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(
      `${DIRECTION_FILE} must be a JSON object: { "default": "github_master", "notion_master": ["path.md"] }`
    );
  }

  const defaultDirectionRaw = String(parsed.default ?? DIRECTION_GITHUB_MASTER).trim().toLowerCase();
  if (defaultDirectionRaw !== DIRECTION_GITHUB_MASTER && defaultDirectionRaw !== DIRECTION_NOTION_MASTER) {
    throw new Error(
      `${DIRECTION_FILE} "default" must be "${DIRECTION_GITHUB_MASTER}" or "${DIRECTION_NOTION_MASTER}"`
    );
  }

  const notionMasterRaw = parsed.notion_master ?? [];
  if (!Array.isArray(notionMasterRaw) || notionMasterRaw.some((item) => typeof item !== "string")) {
    throw new Error(`${DIRECTION_FILE} "notion_master" must be a JSON array of markdown file paths`);
  }

  const notionMasterPaths = new Set();
  for (const filePath of notionMasterRaw) {
    if (!isMarkdownPath(filePath)) {
      throw new Error(`invalid notion_master entry (not markdown): ${filePath}`);
    }
    if (isLockedPath(filePath)) {
      throw new Error(`invalid notion_master entry (LOCKED path forbidden): ${filePath}`);
    }
    notionMasterPaths.add(normalizePathForMatch(filePath));
  }

  return {
    defaultDirection: defaultDirectionRaw,
    notionMasterPaths
  };
}

function resolveDirection(repoPath, directionConfig, directionOverride = null) {
  const override = typeof directionOverride === "string" ? directionOverride.trim().toLowerCase() : null;
  if (override === DIRECTION_GITHUB_MASTER || override === DIRECTION_NOTION_MASTER) {
    return override;
  }

  const normalizedRepoPath = normalizePathForMatch(repoPath);
  if (directionConfig.notionMasterPaths.has(normalizedRepoPath)) {
    return DIRECTION_NOTION_MASTER;
  }

  return directionConfig.defaultDirection;
}

function appendBlockLine(lines, line = "") {
  lines.push(line);
}

async function blockToMarkdownLines(token, block, depth) {
  const lines = [];
  const type = block?.type ?? "unsupported";
  const payload = block?.[type] ?? {};
  const text = richTextToMarkdown(payload.rich_text ?? []);
  const indent = "  ".repeat(depth);
  const isListType = type === "bulleted_list_item" || type === "numbered_list_item" || type === "to_do";

  switch (type) {
    case "heading_1":
      appendBlockLine(lines, `# ${text}`.trimEnd());
      appendBlockLine(lines, "");
      break;
    case "heading_2":
      appendBlockLine(lines, `## ${text}`.trimEnd());
      appendBlockLine(lines, "");
      break;
    case "heading_3":
      appendBlockLine(lines, `### ${text}`.trimEnd());
      appendBlockLine(lines, "");
      break;
    case "paragraph":
      appendBlockLine(lines, `${indent}${text}`.trimEnd());
      appendBlockLine(lines, "");
      break;
    case "bulleted_list_item":
      appendBlockLine(lines, `${indent}- ${text}`.trimEnd());
      break;
    case "numbered_list_item":
      appendBlockLine(lines, `${indent}1. ${text}`.trimEnd());
      break;
    case "to_do": {
      const checked = payload.checked ? "x" : " ";
      appendBlockLine(lines, `${indent}- [${checked}] ${text}`.trimEnd());
      break;
    }
    case "quote": {
      const quoteLines = String(text || "").split("\n");
      for (const qLine of quoteLines) {
        appendBlockLine(lines, `${indent}> ${qLine}`.trimEnd());
      }
      appendBlockLine(lines, "");
      break;
    }
    case "code": {
      const language = String(payload.language || "plain text");
      appendBlockLine(lines, `${indent}\`\`\`${language}`);
      const codeText = richTextToMarkdown(payload.rich_text ?? []);
      for (const codeLine of String(codeText || "").split("\n")) {
        appendBlockLine(lines, `${indent}${codeLine}`);
      }
      appendBlockLine(lines, `${indent}\`\`\``);
      appendBlockLine(lines, "");
      break;
    }
    case "callout":
      appendBlockLine(lines, `${indent}> [!NOTE] ${text}`.trimEnd());
      appendBlockLine(lines, "");
      break;
    case "divider":
      appendBlockLine(lines, `${indent}---`);
      appendBlockLine(lines, "");
      break;
    case "table": {
      const rows = block.has_children ? await listChildren(token, block.id) : [];
      const hasHeader = Boolean(payload.has_column_header);
      const parsedRows = rows
        .filter((row) => row.type === "table_row")
        .map((row) => (row.table_row?.cells ?? []).map((cell) => richTextToMarkdown(cell)));

      if (parsedRows.length > 0) {
        const width = Math.max(...parsedRows.map((row) => row.length));
        const normalizeRow = (row) => {
          const copy = [...row];
          while (copy.length < width) {
            copy.push("");
          }
          return copy;
        };

        const header = normalizeRow(parsedRows[0]);
        appendBlockLine(lines, `${indent}| ${header.join(" | ")} |`);
        if (hasHeader) {
          appendBlockLine(lines, `${indent}| ${header.map(() => "---").join(" | ")} |`);
        }

        const start = hasHeader ? 1 : 0;
        for (let index = start; index < parsedRows.length; index += 1) {
          const row = normalizeRow(parsedRows[index]);
          appendBlockLine(lines, `${indent}| ${row.join(" | ")} |`);
        }
        appendBlockLine(lines, "");
      }
      break;
    }
    default:
      if (text.length > 0) {
        appendBlockLine(lines, `${indent}${text}`.trimEnd());
        appendBlockLine(lines, "");
      }
      break;
  }

  if (block?.has_children && type !== "table") {
    const childDepth = isListType ? depth + 1 : depth;
    const childBlocks = await listChildren(token, block.id);
    const childLines = await blocksToMarkdown(token, childBlocks, childDepth);
    lines.push(...childLines);
    if (!isListType && childLines.length > 0 && childLines[childLines.length - 1] !== "") {
      appendBlockLine(lines, "");
    }
  }

  return lines;
}

async function blocksToMarkdown(token, blocks, depth = 0) {
  const lines = [];
  for (const block of blocks) {
    const blockLines = await blockToMarkdownLines(token, block, depth);
    lines.push(...blockLines);
  }
  return lines;
}

async function pageToMarkdown(token, pageId) {
  const blocks = await listChildren(token, pageId);
  const lines = await blocksToMarkdown(token, blocks, 0);

  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  return ensureTrailingNewline(lines.join("\n"));
}

async function writeReport(report) {
  const reportFilePath = path.resolve(process.cwd(), REPORT_PATH);
  await mkdir(path.dirname(reportFilePath), { recursive: true });
  await writeFile(reportFilePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  info(`report_written: ${REPORT_PATH}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const dryRun = !apply;
  const token = String(process.env.NOTION_TOKEN || "").trim();

  const report = {
    mode: dryRun ? "dry_run" : "apply",
    notion_master_count: 0,
    processed: [],
    updated: [],
    unchanged: [],
    created: [],
    skipped_locked: [],
    errors: []
  };

  const finalize = async (exitCode) => {
    try {
      await writeReport(report);
    } catch (error) {
      fail(`unable to write ${REPORT_PATH}: ${String(error.message ?? error)}`);
      return 1;
    }
    return exitCode;
  };

  if (token.length === 0) {
    fail("NOTION_TOKEN is required for notion pull sync");
    return finalize(1);
  }

  const mapPath = path.resolve(process.cwd(), MAP_FILE);
  if (!existsSync(mapPath)) {
    fail(`mapping file missing: ${MAP_FILE}`);
    return finalize(1);
  }

  let rawMap;
  try {
    rawMap = JSON.parse(await readFile(mapPath, "utf8"));
  } catch (error) {
    fail(`unable to parse ${MAP_FILE}: ${String(error.message)}`);
    return finalize(1);
  }

  if (!rawMap || Array.isArray(rawMap) || typeof rawMap !== "object") {
    fail(`${MAP_FILE} must be a JSON object`);
    return finalize(1);
  }

  let directionConfig;
  try {
    directionConfig = await loadDirectionConfig();
  } catch (error) {
    fail(String(error.message || error));
    return finalize(1);
  }

  const entries = parseMapEntries(rawMap)
    .filter((entry) => resolveDirection(entry.repoPath, directionConfig, entry.directionOverride) === DIRECTION_NOTION_MASTER)
    .sort((a, b) => a.repoPath.localeCompare(b.repoPath));

  report.notion_master_count = entries.length;
  info(`mode: ${report.mode}`);
  info(`notion_master_count: ${entries.length}`);

  if (entries.length === 0) {
    warn("no notion_master entries configured; nothing to pull");
    return finalize(0);
  }

  let failureCount = 0;

  for (const entry of entries) {
    const repoPath = entry.repoPath;
    const pageId = toCanonicalPageId(entry.pageId);

    if (!isMarkdownPath(repoPath)) {
      report.errors.push({ file: repoPath, page_id: entry.pageId, message: "not a markdown path" });
      fail(`${repoPath} -> ${entry.pageId} (not a markdown path)`);
      failureCount += 1;
      continue;
    }

    if (isLockedPath(repoPath)) {
      report.skipped_locked.push(repoPath);
      warn(`skip LOCKED path: ${repoPath}`);
      continue;
    }

    if (!pageId) {
      report.errors.push({ file: repoPath, page_id: entry.pageId, message: "invalid page id" });
      fail(`${repoPath} -> ${entry.pageId} (invalid page id)`);
      failureCount += 1;
      continue;
    }

    info(`pull: ${repoPath} <- ${pageId}`);
    report.processed.push(repoPath);

    let remoteMarkdown;
    try {
      remoteMarkdown = await pageToMarkdown(token, pageId);
    } catch (error) {
      const message = String(error.message || error);
      report.errors.push({ file: repoPath, page_id: pageId, message: message.slice(0, 400) });
      fail(`${repoPath} <- ${pageId} (${message})`);
      failureCount += 1;
      continue;
    }

    const absolutePath = path.resolve(process.cwd(), repoPath);
    const fileExists = existsSync(absolutePath);
    let localMarkdown = "";

    if (fileExists) {
      localMarkdown = await readFile(absolutePath, "utf8");
    }

    const localHash = computeHash(localMarkdown);
    const remoteHash = computeHash(remoteMarkdown);

    if (fileExists && localHash === remoteHash) {
      report.unchanged.push(repoPath);
      ok(`unchanged: ${repoPath} (hash=${remoteHash})`);
      continue;
    }

    if (dryRun) {
      if (fileExists) {
        report.updated.push(repoPath);
        ok(`would_update: ${repoPath} (local=${localHash}, remote=${remoteHash})`);
      } else {
        report.created.push(repoPath);
        ok(`would_create: ${repoPath} (remote=${remoteHash})`);
      }
      continue;
    }

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, remoteMarkdown, "utf8");

    if (fileExists) {
      report.updated.push(repoPath);
      ok(`updated: ${repoPath} (local=${localHash}, remote=${remoteHash})`);
    } else {
      report.created.push(repoPath);
      ok(`created: ${repoPath} (remote=${remoteHash})`);
    }
  }

  if (failureCount > 0) {
    fail(`notion pull sync finished with ${failureCount} failure(s)`);
    return finalize(1);
  }

  ok("notion pull sync finished successfully");
  return finalize(0);
}

process.exit(await main());
