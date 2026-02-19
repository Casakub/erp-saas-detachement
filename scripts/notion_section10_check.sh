#!/usr/bin/env bash

set -euo pipefail

required_files=(
  "ERP Détachement europe/SECTION 10.A — PILIERS FONCTIONNELS (6 PILIERS ↔ M1..M13).md"
  "ERP Détachement europe/SECTION 10.B — RÔLES & PERMISSIONS (INDEX).md"
  "ERP Détachement europe/SECTION 10.C — DATA & LEGAL SOURCES REGISTER (IDCC + COUNTRY RULES).md"
  "ERP Détachement europe/SECTION 10.D — SECURITY BASELINE (HASHING, LOGS, ENCRYPTION, RETENTION, KEY ROTATION, INCIDENT, PII).md"
  "ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E.md"
  "ERP Détachement europe/SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1).md"
  "ERP Détachement europe/SECTION 10 — META STRUCTURE PRODUIT & GOUVERNANCE (INDEX).md"
)

has_fail=0

check_placeholders() {
  local file="$1"
  local markers=("<à compléter>" "<lien ou chemin>" "TBD" "LOCK REQUIRED" "PLACEHOLDER")
  local marker

  for marker in "${markers[@]}"; do
    if rg -n -F -- "$marker" "$file" >/dev/null 2>&1; then
      echo "ERROR: $file - placeholder marker found: $marker"
      has_fail=1
      return
    fi
  done

  echo "OK: placeholders-clean - $file"
}

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "ERROR: $file - missing file"
    has_fail=1
    continue
  fi
  echo "OK: exists - $file"

  line_count="$(wc -l < "$file" | tr -d '[:space:]')"
  if [[ "$line_count" -lt 20 ]]; then
    echo "ERROR: $file - line count $line_count < 20"
    has_fail=1
  else
    echo "OK: line-count($line_count) - $file"
  fi

  check_placeholders "$file"
done

if [[ "$has_fail" -eq 0 ]]; then
  echo "SECTION 10 CHECK: OK"
  exit 0
fi

echo "SECTION 10 CHECK: FAIL"
exit 1
