"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function collectTestFiles(rootDir, acc) {
    if (!(0, node_fs_1.existsSync)(rootDir)) {
        return;
    }
    for (const entry of (0, node_fs_1.readdirSync)(rootDir, { withFileTypes: true })) {
        const fullPath = (0, node_path_1.join)(rootDir, entry.name);
        if (entry.isDirectory()) {
            collectTestFiles(fullPath, acc);
            continue;
        }
        if (entry.isFile() && entry.name.endsWith(".test.js")) {
            acc.push(fullPath);
        }
    }
}
const candidates = [];
collectTestFiles((0, node_path_1.resolve)("dist/tests"), candidates);
collectTestFiles((0, node_path_1.resolve)("dist/modules"), candidates);
if (candidates.length === 0) {
    console.error("No compiled tests found under dist/tests or dist/modules.");
    process.exit(1);
}
candidates.sort();
const result = (0, node_child_process_1.spawnSync)(process.execPath, ["--test", ...candidates], { stdio: "inherit" });
if (result.error) {
    console.error(result.error.message);
    process.exit(1);
}
process.exit(result.status ?? 1);
