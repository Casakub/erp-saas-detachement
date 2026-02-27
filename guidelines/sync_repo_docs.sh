#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIRROR_DIR="$ROOT_DIR/guidelines/repo-docs"

rm -rf "$MIRROR_DIR"
mkdir -p "$MIRROR_DIR"

# Mirror complet du dossier contractuel ERP (inclut les fichiers sans extension)
rsync -a --exclude '.DS_Store' "$ROOT_DIR/ERP Détachement europe/" "$MIRROR_DIR/ERP Détachement europe/"

# Copier les artefacts documentaires du reste du repo
while IFS= read -r src_file; do
  rel_path="${src_file#"$ROOT_DIR/"}"
  dest="$MIRROR_DIR/$rel_path"
  mkdir -p "$(dirname "$dest")"
  cp "$src_file" "$dest"
done < <(
  find "$ROOT_DIR" -type f \( -name '*.md' -o -name '*.pdf' -o -name '*.txt' -o -name '*.rst' -o -name '*.adoc' \) \
    ! -path "$ROOT_DIR/guidelines/*" \
    ! -path "$ROOT_DIR/backend/node_modules/*" \
    ! -path "$ROOT_DIR/.git/*"
)

count=$(find "$MIRROR_DIR" -type f | wc -l | tr -d ' ')
{
  echo "# Guidelines Central Index"
  echo
  echo "- Scope: miroir documentaire centralise pour Figma Make et IA externes."
  echo "- Source: documentation actuelle du repo (contractuelle + templates + runbooks + archives prototype)."
  echo "- Date sync: $(date '+%Y-%m-%d %H:%M:%S %z')"
  echo "- Fichiers recenses: $count"
  echo
  echo "## Canonical Entry"
  echo
  echo "- \`guidelines/Guidelines.md\`"
  echo
  echo "## Mirror Tree"
  echo
  find "$MIRROR_DIR" -type f | sed "s|^$ROOT_DIR/guidelines/||" | sort | while IFS= read -r f; do
    printf '%s\n' "- \`$f\`"
  done
} > "$ROOT_DIR/guidelines/INDEX.md"

echo "SYNC OK: $count fichiers documentaires centralises dans guidelines/repo-docs"
