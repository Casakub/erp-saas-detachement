#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const MAP_FILE = "notion-sync-map.json";
const MAX_CHILDREN_PER_APPEND = 100;
const MAX_RICH_TEXT_CHUNK = 1900;
const SYNC_MODE_FULL_REPLACE = "full_replace";
const SYNC_MODE_BOUNDED = "bounded";
const MARKER_BEGIN = "BEGIN GITHUB SYNC";
const MARKER_END = "END GITHUB SYNC";
const NOTION_PAGE_ID_REGEX = /([0-9a-f]{32})/i;

function info(message) {
  console.log(`INFO: ${message}`);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function normalizePathForMatch(input) {
  return String(input).replaceAll("\\", "/").normalize("NFC");
}

function normalizePathWithForm(input, form = "NFC") {
  return String(input).replaceAll("\\", "/").normalize(form);
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

function extractPageIdFromPath(input) {
  const match = String(input).match(NOTION_PAGE_ID_REGEX);
  return match ? match[1].toLowerCase() : null;
}

function splitText(text, chunkSize = MAX_RICH_TEXT_CHUNK) {
  const safe = text.length > 0 ? text : " ";
  const chunks = [];
  for (let i = 0; i < safe.length; i += chunkSize) {
    chunks.push(safe.slice(i, i + chunkSize));
  }
  return chunks.length > 0 ? chunks : [" "];
}

function toRichText(text) {
  const chunks = splitText(String(text ?? ""));
  return chunks.map((chunk) => ({
    type: "text",
    text: {
      content: chunk
    }
  }));
}

function paragraphBlock(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: toRichText(text)
    }
  };
}

function headingBlock(level, text) {
  const type = `heading_${level}`;
  return {
    object: "block",
    type,
    [type]: {
      rich_text: toRichText(text)
    }
  };
}

function bulletBlock(text) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: toRichText(text)
    }
  };
}

function todoBlock(text, checked) {
  return {
    object: "block",
    type: "to_do",
    to_do: {
      rich_text: toRichText(text),
      checked: Boolean(checked)
    }
  };
}

function quoteBlock(text) {
  return {
    object: "block",
    type: "quote",
    quote: {
      rich_text: toRichText(text)
    }
  };
}

function calloutBlock(text) {
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: toRichText(text),
      icon: {
        emoji: "ℹ️"
      }
    }
  };
}

function toNotionCodeLanguage(rawLanguage) {
  const lang = String(rawLanguage || "").trim().toLowerCase();
  const aliases = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    yml: "yaml",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    text: "plain text",
    txt: "plain text",
    md: "markdown",
    psql: "sql"
  };

  const canonical = aliases[lang] ?? lang;
  const allowed = new Set([
    "abap",
    "arduino",
    "bash",
    "basic",
    "c",
    "clojure",
    "coffeescript",
    "c++",
    "c#",
    "css",
    "dart",
    "diff",
    "docker",
    "elixir",
    "elm",
    "erlang",
    "flow",
    "fortran",
    "f#",
    "gherkin",
    "glsl",
    "go",
    "graphql",
    "groovy",
    "haskell",
    "html",
    "java",
    "javascript",
    "json",
    "julia",
    "kotlin",
    "latex",
    "less",
    "lisp",
    "livescript",
    "lua",
    "makefile",
    "markdown",
    "markup",
    "matlab",
    "mermaid",
    "nix",
    "objective-c",
    "ocaml",
    "pascal",
    "perl",
    "php",
    "plain text",
    "powershell",
    "prolog",
    "protobuf",
    "python",
    "r",
    "reason",
    "ruby",
    "rust",
    "sass",
    "scala",
    "scheme",
    "scss",
    "shell",
    "sql",
    "swift",
    "typescript",
    "vb.net",
    "verilog",
    "vhdl",
    "visual basic",
    "webassembly",
    "xml",
    "yaml",
    "java/c/c++/c#"
  ]);

  return allowed.has(canonical) ? canonical : "plain text";
}

function codeBlock(codeText, rawLanguage) {
  return {
    object: "block",
    type: "code",
    code: {
      rich_text: toRichText(codeText.length > 0 ? codeText : " "),
      language: toNotionCodeLanguage(rawLanguage)
    }
  };
}

function looksLikeTableHeader(lines, index) {
  if (index + 1 >= lines.length) {
    return false;
  }

  const header = lines[index];
  const separator = lines[index + 1];

  if (!header.includes("|") || !separator.includes("|")) {
    return false;
  }

  const cleaned = separator.trim();
  return cleaned.includes("-") && /^[|:\-\s]+$/.test(cleaned);
}

function markdownToBlocks(markdown) {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];

  let i = 0;
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join("\n").trim();
    if (text.length > 0) {
      blocks.push(paragraphBlock(text));
    }
    paragraphLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      i += 1;
      continue;
    }

    const codeFenceMatch = line.match(/^```([A-Za-z0-9_+\-.#]*)\s*$/);
    if (codeFenceMatch) {
      flushParagraph();

      const language = codeFenceMatch[1] || "plain text";
      i += 1;
      const codeLines = [];

      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }

      if (i < lines.length && /^```\s*$/.test(lines[i])) {
        i += 1;
      }

      blocks.push(codeBlock(codeLines.join("\n"), language));
      continue;
    }

    if (looksLikeTableHeader(lines, i)) {
      flushParagraph();
      const tableLines = [lines[i], lines[i + 1]];
      i += 2;

      while (i < lines.length && lines[i].trim().length > 0 && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }

      blocks.push(paragraphBlock(tableLines.join("\n")));
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      blocks.push(headingBlock(level, text.length > 0 ? text : " "));
      i += 1;
      continue;
    }

    const todoMatch = line.match(/^- \[( |x|X)\]\s+(.*)$/);
    if (todoMatch) {
      flushParagraph();
      blocks.push(todoBlock(todoMatch[2].trim(), /x/i.test(todoMatch[1])));
      i += 1;
      continue;
    }

    const bulletMatch = line.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      blocks.push(bulletBlock(bulletMatch[1].trim()));
      i += 1;
      continue;
    }

    const calloutMatch = line.match(/^>\s*\[!([^\]]+)\]\s*(.*)$/);
    if (calloutMatch) {
      flushParagraph();
      const text = calloutMatch[2].trim().length > 0 ? calloutMatch[2].trim() : calloutMatch[1].trim();
      blocks.push(calloutBlock(text));
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const text = quoteLines.join("\n").trim();
      blocks.push(quoteBlock(text.length > 0 ? text : " "));
      continue;
    }

    paragraphLines.push(line);
    i += 1;
  }

  flushParagraph();

  if (blocks.length === 0) {
    blocks.push(paragraphBlock(" "));
  }

  return blocks;
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

function toCanonicalPageId(pageId) {
  const clean = String(pageId).replace(/-/g, "").trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(clean)) {
    return null;
  }

  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

async function listChildrenIds(token, blockId) {
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

function toBlockPlainText(block) {
  const blockType = block?.type;
  if (!blockType || !block?.[blockType]) {
    return "";
  }

  const payload = block[blockType];
  if (Array.isArray(payload.rich_text)) {
    return payload.rich_text.map((item) => item?.plain_text ?? "").join("");
  }

  return "";
}

function findBoundedMarkers(children) {
  let beginIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < children.length; i += 1) {
    const text = toBlockPlainText(children[i]);
    if (beginIndex < 0 && text.includes(MARKER_BEGIN)) {
      beginIndex = i;
      continue;
    }

    if (beginIndex >= 0 && text.includes(MARKER_END)) {
      endIndex = i;
      break;
    }
  }

  if (beginIndex >= 0 && endIndex > beginIndex) {
    return { beginIndex, endIndex };
  }

  return null;
}

async function archiveSpecificChildren(token, children) {
  let archived = 0;
  let skipped = 0;

  for (const child of children) {
    const childType = child.type ?? "unknown";
    if (childType === "child_page" || childType === "child_database") {
      skipped += 1;
      warn(`skip archiving ${childType}: ${child.id}`);
      continue;
    }

    try {
      await notionRequest(token, "PATCH", `/blocks/${child.id}`, { archived: true });
      archived += 1;
    } catch (error) {
      const message = String(error.message ?? error);
      if (message.includes("Updating a page via the blocks endpoint unsupported")) {
        skipped += 1;
        warn(`skip archiving unsupported page block: ${child.id}`);
        continue;
      }
      throw error;
    }
  }
  return { archived, skipped, total: children.length };
}

async function archiveChildren(token, pageId) {
  const children = await listChildrenIds(token, pageId);
  return archiveSpecificChildren(token, children);
}

async function appendChildren(token, pageId, blocks, afterId = null) {
  let appended = 0;
  let anchor = afterId;

  for (let i = 0; i < blocks.length; i += MAX_CHILDREN_PER_APPEND) {
    const chunk = blocks.slice(i, i + MAX_CHILDREN_PER_APPEND);
    const body = { children: chunk };
    if (anchor) {
      body.after = anchor;
    }

    const response = await notionRequest(token, "PATCH", `/blocks/${pageId}/children`, body);
    const lastAppendedId = response?.results?.[response.results.length - 1]?.id ?? null;
    if (lastAppendedId) {
      anchor = lastAppendedId;
    }
    appended += chunk.length;
  }

  return appended;
}

function loadChangedFiles() {
  const eventName = String(process.env.GITHUB_EVENT_NAME || process.env.EVENT_NAME || "").trim();
  const baseSha = String(process.env.BASE_SHA || process.env.GITHUB_EVENT_BEFORE || "").trim();
  const headSha = String(process.env.HEAD_SHA || process.env.GITHUB_SHA || "").trim();

  info(`event_name: ${eventName || "unknown"}`);
  info(`base_sha: ${baseSha || "(empty)"}`);
  info(`head_sha: ${headSha || "(empty)"}`);

  const invalidBase = baseSha.length === 0 || /^0+$/.test(baseSha);
  const invalidHead = headSha.length === 0 || /^0+$/.test(headSha);

  if (invalidBase || invalidHead) {
    info("changed_files_count: n/a");
    info("diff not available, full mapping sync");
    return { changedFiles: null, eventName, baseSha, headSha };
  }

  try {
    const output = execFileSync("git", ["diff", "--name-only", baseSha, headSha], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    const files = output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    info(`changed_files_count: ${files.length}`);
    return { changedFiles: files, eventName, baseSha, headSha };
  } catch (error) {
    info(`git diff failed (${String(error.message)})`);
    info("changed_files_count: n/a");
    info("diff not available, full mapping sync");
    return { changedFiles: null, eventName, baseSha, headSha };
  }
}

let gitTrackedFilesCache = null;

function loadGitTrackedFiles() {
  if (gitTrackedFilesCache !== null) {
    return gitTrackedFilesCache;
  }

  try {
    const output = execFileSync("git", ["-c", "core.quotepath=false", "ls-files"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    gitTrackedFilesCache = output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    info(`git ls-files failed (${String(error.message)}); runtime path fallback disabled`);
    gitTrackedFilesCache = [];
  }

  return gitTrackedFilesCache;
}

function pathVariants(value) {
  const raw = String(value).replaceAll("\\", "/");
  return [raw, raw.normalize("NFC"), raw.normalize("NFD")];
}

function findTrackedFileByUnicode(mappedPath, trackedFiles) {
  const mappedVariants = new Set(pathVariants(mappedPath));

  for (const candidate of trackedFiles) {
    const candidateVariants = pathVariants(candidate);
    if (candidateVariants.some((variant) => mappedVariants.has(variant))) {
      return candidate;
    }
  }

  const mappedBasename = path.posix.basename(String(mappedPath).replaceAll("\\", "/"));
  const basenameVariants = new Set(pathVariants(mappedBasename));
  const basenameMatches = trackedFiles.filter((candidate) => {
    const basename = path.posix.basename(String(candidate).replaceAll("\\", "/"));
    return pathVariants(basename).some((variant) => basenameVariants.has(variant));
  });

  if (basenameMatches.length > 0) {
    return basenameMatches.sort((a, b) => a.localeCompare(b))[0];
  }

  return null;
}

function findTrackedFileByPageId(mappedPageId, trackedFiles) {
  const cleanId = String(mappedPageId).replace(/-/g, "").trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(cleanId)) {
    return null;
  }

  return (
    trackedFiles.find((candidate) => {
      const normalized = String(candidate).toLowerCase();
      return normalized.endsWith(".md") && normalized.includes(cleanId);
    }) ?? null
  );
}

function resolveMappedFilePath(repoPath, mappedPageId, trackedFiles) {
  const directPath = path.resolve(process.cwd(), repoPath);
  if (existsSync(directPath)) {
    return {
      method: "direct",
      repoPath,
      filePath: directPath
    };
  }

  const unicodeMatch = findTrackedFileByUnicode(repoPath, trackedFiles);
  if (unicodeMatch) {
    const unicodePath = path.resolve(process.cwd(), unicodeMatch);
    if (existsSync(unicodePath)) {
      return {
        method: "unicode",
        repoPath: unicodeMatch,
        filePath: unicodePath
      };
    }
  }

  const idMatch = findTrackedFileByPageId(mappedPageId, trackedFiles);
  if (idMatch) {
    const idPath = path.resolve(process.cwd(), idMatch);
    if (existsSync(idPath)) {
      return {
        method: "page_id",
        repoPath: idMatch,
        filePath: idPath
      };
    }
  }

  return null;
}

function uniquePaths(paths) {
  const seen = new Set();
  const unique = [];

  for (const file of paths) {
    const normalized = normalizePathForMatch(file);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(file);
    }
  }

  return unique;
}

function selectMarkdownCandidates(changedFilesContext, trackedFiles) {
  const sourceFiles = changedFilesContext.changedFiles ?? trackedFiles;
  const changedMdFiles = uniquePaths(sourceFiles.filter((file) => isMarkdownPath(file)));
  const excludedLockedFiles = changedMdFiles.filter((file) => isLockedPath(file));
  const eligibleMdFiles = changedMdFiles.filter((file) => !isLockedPath(file));

  return {
    changedMdFiles,
    excludedLockedFiles,
    eligibleMdFiles,
    fullScan: changedFilesContext.changedFiles === null
  };
}

function buildMappedPageIdLookup(mappingEntries, trackedFiles) {
  const mapped = new Map();

  for (const [mappedPath, pageId] of mappingEntries) {
    const directKey = normalizePathForMatch(mappedPath);
    if (!mapped.has(directKey)) {
      mapped.set(directKey, pageId);
    }

    const unicodeMatch = findTrackedFileByUnicode(mappedPath, trackedFiles);
    if (unicodeMatch) {
      const resolvedKey = normalizePathForMatch(unicodeMatch);
      if (!mapped.has(resolvedKey)) {
        mapped.set(resolvedKey, pageId);
      }
    }
  }

  return mapped;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const syncModeRaw = String(process.env.NOTION_SYNC_MODE || SYNC_MODE_FULL_REPLACE).trim().toLowerCase();
  const syncMode =
    syncModeRaw === SYNC_MODE_BOUNDED || syncModeRaw === SYNC_MODE_FULL_REPLACE ? syncModeRaw : null;

  if (!syncMode) {
    fail(
      `invalid NOTION_SYNC_MODE="${syncModeRaw}" (expected "${SYNC_MODE_FULL_REPLACE}" or "${SYNC_MODE_BOUNDED}")`
    );
    process.exit(1);
  }

  const mapPath = path.resolve(process.cwd(), MAP_FILE);
  if (!existsSync(mapPath)) {
    fail(`mapping file missing: ${MAP_FILE}`);
    process.exit(1);
  }

  let rawMap;
  try {
    rawMap = JSON.parse(await readFile(mapPath, "utf8"));
  } catch (error) {
    fail(`unable to parse ${MAP_FILE}: ${String(error.message)}`);
    process.exit(1);
  }

  if (!rawMap || Array.isArray(rawMap) || typeof rawMap !== "object") {
    fail(`${MAP_FILE} must be a JSON object: { "repo/path.md": "notion_page_id" }`);
    process.exit(1);
  }

  const mappingEntries = Object.entries(rawMap)
    .filter(([repoPath, pageId]) => typeof repoPath === "string" && typeof pageId === "string")
    .sort((a, b) => a[0].localeCompare(b[0]));

  info(`mapped_files_considered: ${mappingEntries.length}`);

  const changedFilesContext = loadChangedFiles();
  const trackedFiles = loadGitTrackedFiles();
  const candidateSelection = selectMarkdownCandidates(changedFilesContext, trackedFiles);

  info(`scan_mode: ${candidateSelection.fullScan ? "full_scan" : "diff_only"}`);
  info(`changed_md_files_count: ${candidateSelection.changedMdFiles.length}`);
  info(`excluded_locked_count: ${candidateSelection.excludedLockedFiles.length}`);

  if (candidateSelection.changedMdFiles.length === 0) {
    info("mappable_count (map json): 0");
    info("mappable_count (auto id): 0");
    info("unmappable_count: 0");
    info("no changed markdown files");
    process.exit(0);
  }

  const mappedPageIdLookup = buildMappedPageIdLookup(mappingEntries, trackedFiles);
  const targets = [];
  const unmappableFiles = [];
  let mappableFromMap = 0;
  let mappableFromAuto = 0;

  for (const repoPath of candidateSelection.eligibleMdFiles) {
    if (isLockedPath(repoPath)) {
      warn(`safety guard: skip LOCKED path: ${repoPath}`);
      continue;
    }

    const mappedFromJson = mappedPageIdLookup.get(normalizePathForMatch(repoPath)) ?? null;
    const mappedFromAuto = mappedFromJson ? null : extractPageIdFromPath(repoPath);
    const mappedPageId = mappedFromJson ?? mappedFromAuto;
    const source = mappedFromJson ? "map_json" : mappedFromAuto ? "auto_id" : null;

    if (!mappedPageId || !source) {
      unmappableFiles.push(repoPath);
      continue;
    }

    const pageId = toCanonicalPageId(mappedPageId);
    if (!pageId) {
      warn(`invalid page_id for ${repoPath}: ${mappedPageId}`);
      unmappableFiles.push(repoPath);
      continue;
    }

    if (source === "map_json") {
      mappableFromMap += 1;
    } else {
      mappableFromAuto += 1;
    }

    targets.push({ repoPath, mappedPageId, pageId, source });
  }

  info(`mappable_count (map json): ${mappableFromMap}`);
  info(`mappable_count (auto id): ${mappableFromAuto}`);
  info(`unmappable_count: ${unmappableFiles.length}`);

  if (unmappableFiles.length > 0) {
    const preview = unmappableFiles.slice(0, 50);
    warn(`unmappable .md files (max 50):\n- ${preview.join("\n- ")}`);
  }

  if (candidateSelection.changedMdFiles.length > 0 && targets.length === 0) {
    warn("changed markdown files detected but none are mappable; sync skipped");
    process.exit(0);
  }

  const token = process.env.NOTION_TOKEN || "";
  if (!dryRun && token.length === 0) {
    fail("NOTION_TOKEN is required (use --dry-run for local preview without API calls)");
    process.exit(1);
  }

  info(`mode: ${dryRun ? "dry-run" : "live"}`);
  info(`sync_mode: ${syncMode}`);
  info(`target pages: ${targets.length}`);

  let syncFailures = 0;

  for (const target of targets) {
    const { repoPath, mappedPageId, pageId, source } = target;
    if (isLockedPath(repoPath)) {
      warn(`safety guard: blocked LOCKED path before sync: ${repoPath}`);
      continue;
    }

    const resolvedFile = resolveMappedFilePath(repoPath, mappedPageId, trackedFiles);

    if (!resolvedFile) {
      fail(`${repoPath} -> ${mappedPageId} (file not found)`);
      syncFailures += 1;
      continue;
    }

    if (isLockedPath(resolvedFile.repoPath)) {
      warn(`safety guard: blocked LOCKED resolved path before sync: ${resolvedFile.repoPath}`);
      continue;
    }

    if (resolvedFile.method !== "direct") {
      warn(`path not found, resolved via ${resolvedFile.method}: ${repoPath} -> ${resolvedFile.repoPath}`);
    }

    let markdown;
    try {
      markdown = await readFile(resolvedFile.filePath, "utf8");
    } catch (error) {
      fail(`${repoPath} -> ${pageId} (read failed: ${String(error.message)})`);
      syncFailures += 1;
      continue;
    }

    const blocks = markdownToBlocks(markdown);
    info(`file -> page: ${resolvedFile.repoPath} -> ${pageId} (source=${source})`);
    info(`blocks_count: ${blocks.length}`);

    if (dryRun) {
      ok(`${resolvedFile.repoPath} -> ${pageId} (dry-run)`);
      continue;
    }

    try {
      if (syncMode === SYNC_MODE_BOUNDED) {
        const children = await listChildrenIds(token, pageId);
        const markers = findBoundedMarkers(children);

        if (!markers) {
          warn(
            `bounded markers missing for ${pageId}; fallback to ${SYNC_MODE_FULL_REPLACE} (${MARKER_BEGIN} / ${MARKER_END})`
          );
          const archiveStats = await archiveSpecificChildren(token, children);
          const appendedCount = await appendChildren(token, pageId, blocks);
          ok(
            `${resolvedFile.repoPath} -> ${pageId} (mode=${SYNC_MODE_FULL_REPLACE}, archived=${archiveStats.archived}, skipped=${archiveStats.skipped}, total=${archiveStats.total}, appended=${appendedCount})`
          );
          continue;
        }

        const betweenChildren = children.slice(markers.beginIndex + 1, markers.endIndex);
        const archiveStats = await archiveSpecificChildren(token, betweenChildren);
        const beginMarkerId = children[markers.beginIndex].id;
        const appendedCount = await appendChildren(token, pageId, blocks, beginMarkerId);
        ok(
          `${resolvedFile.repoPath} -> ${pageId} (mode=${SYNC_MODE_BOUNDED}, archived=${archiveStats.archived}, skipped=${archiveStats.skipped}, total=${archiveStats.total}, appended=${appendedCount})`
        );
        continue;
      }

      const archiveStats = await archiveChildren(token, pageId);
      const appendedCount = await appendChildren(token, pageId, blocks);
      ok(
        `${resolvedFile.repoPath} -> ${pageId} (mode=${SYNC_MODE_FULL_REPLACE}, archived=${archiveStats.archived}, skipped=${archiveStats.skipped}, total=${archiveStats.total}, appended=${appendedCount})`
      );
    } catch (error) {
      fail(`${resolvedFile.repoPath} -> ${pageId} (${String(error.message)})`);
      syncFailures += 1;
    }
  }

  if (syncFailures > 0) {
    fail(`Notion sync finished with ${syncFailures} failure(s)`);
    process.exit(1);
  }

  ok("Notion sync finished successfully");
}

await main();
