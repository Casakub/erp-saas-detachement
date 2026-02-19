#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

FAIL=0

ok() {
  echo "OK: $1"
}

fail() {
  echo "ERROR: $1"
  FAIL=1
}

SECTION9="$ROOT_DIR/ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 309688d6a59680f9b1a2c3d4e5f60789.md"
EVENTS210="$ROOT_DIR/ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-fr 308688d6a596802bad05fb3834118422.md"
SECTION2="$ROOT_DIR/ERP Détachement europe/SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV) 308688d6a59680ebb64fe4ddb4223b41.md"
SECTION6_DIR="$ROOT_DIR/ERP Détachement europe/SECTION 6 — Checklist Produit V1 (Globale)"
ANNEX211A="$ROOT_DIR/ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11.A — OPENAPI EXECUTION SCHEMAS (ANNEXE) 309688d6a59680c1b2d3e4f5a6b7c8d9.md"

echo
echo "== A) SECTION 9 lock check =="
if rg -n 'TBD \(LOCK REQUIRED\)' "$SECTION9" > "$TMP_DIR/section9_tbd.txt"; then
  fail "SECTION 9 contient encore des marqueurs TBD."
  cat "$TMP_DIR/section9_tbd.txt"
else
  ok "Aucun marqueur TBD dans SECTION 9."
fi

echo
echo "== B) Backend structure check =="
for rel in backend backend/modules backend/migrations backend/runbooks; do
  if [ -d "$ROOT_DIR/$rel" ]; then
    ok "Dossier présent: $rel"
  else
    fail "Dossier manquant: $rel"
  fi
done

echo
echo "== C) npm scripts check =="
PKG_JSON="$ROOT_DIR/backend/package.json"
if [ ! -f "$PKG_JSON" ]; then
  fail "Fichier manquant: backend/package.json"
else
  if ! command -v node >/dev/null 2>&1; then
    fail "Node.js introuvable pour vérifier les scripts npm."
  else
    if NODE_OUT="$(node -e "const fs=require('fs'); const pkgPath=process.argv[1]; const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8')); const required=['lint','typecheck','test:ci']; const missing=required.filter((k)=>!(pkg.scripts && pkg.scripts[k])); if(missing.length){console.error('Scripts npm manquants: '+missing.join(', ')); process.exit(1);} console.log('Scripts npm requis présents: '+required.join(', '));" "$PKG_JSON" 2>&1)"; then
      ok "$NODE_OUT"
    else
      fail "$NODE_OUT"
    fi
  fi
fi

echo
echo "== D) Event coherence check (implémentables ↔ 2.10) =="
if [ ! -f "$EVENTS210" ]; then
  fail "Fichier canonique events 2.10 introuvable."
else
  rg '^### ' "$EVENTS210" | sed 's/^### //' | sort -u > "$TMP_DIR/events_210.txt"
  if [ ! -s "$TMP_DIR/events_210.txt" ]; then
    fail "Aucun event canonique extrait depuis 2.10."
  fi
fi

EVENT_REGEX='[A-Z][A-Za-z0-9]+(Created|Updated|Submitted|Validated|Rejected|Blocked|Issued|Recorded|Changed|Calculated|Published|Voided|Allocated|ConvertedToClient|StatusChanged|InviteCreated|ResponseSubmitted|EnforcementEvaluated|BillingStatusChanged|RequirementCreated|RequirementStatusChanged|CheckEventRecorded|PaymentRecorded|DocumentStatusChanged|ProfileUpdated|CommissionCalculated|EntryAdded)'

: > "$TMP_DIR/impl_events_raw.txt"

SOURCE_FILES=("$SECTION2" "$ANNEX211A")
if [ -d "$SECTION6_DIR" ]; then
  while IFS= read -r f; do
    SOURCE_FILES+=("$f")
  done < <(find "$SECTION6_DIR" -maxdepth 1 -type f -name '*.md' | sort)
else
  fail "Dossier SECTION 6 introuvable pour extraction events implémentables."
fi

for src in "${SOURCE_FILES[@]}"; do
  if [ -f "$src" ]; then
    rg -o "$EVENT_REGEX" "$src" >> "$TMP_DIR/impl_events_raw.txt" || true
  else
    fail "Fichier source events introuvable: $src"
  fi
done

sort -u "$TMP_DIR/impl_events_raw.txt" > "$TMP_DIR/impl_events.txt" || true

if [ ! -s "$TMP_DIR/impl_events.txt" ]; then
  fail "Aucun event implémentable extrait des sources documentaires."
else
  MISSING_COUNT=0
  while IFS= read -r ev; do
    [ -z "$ev" ] && continue
    if ! rg -Fx "$ev" "$TMP_DIR/events_210.txt" >/dev/null; then
      echo "$ev" >> "$TMP_DIR/events_missing.txt"
      MISSING_COUNT=$((MISSING_COUNT+1))
    fi
  done < "$TMP_DIR/impl_events.txt"

  if [ "$MISSING_COUNT" -gt 0 ]; then
    fail "Events implémentables absents du catalogue 2.10:"
    sort -u "$TMP_DIR/events_missing.txt"
  else
    ok "Events implémentables cohérents avec 2.10."
  fi
fi

echo
echo "== Résultat global =="
if [ "$FAIL" -ne 0 ]; then
  echo "SUBSTRATE CHECK: FAIL"
  exit 1
fi

echo "SUBSTRATE CHECK: OK"
exit 0
