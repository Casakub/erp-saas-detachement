const fs = require("node:fs");
const path = require("node:path");

const nodeModulesDir = path.resolve(__dirname, "..", "node_modules");

if (!fs.existsSync(nodeModulesDir)) {
  process.exit(0);
}

let removedCount = 0;

function pruneMarkdownFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      pruneMarkdownFiles(absolutePath);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      fs.unlinkSync(absolutePath);
      removedCount += 1;
    }
  }
}

pruneMarkdownFiles(nodeModulesDir);
console.log(`postinstall: removed ${removedCount} markdown files from backend/node_modules`);
