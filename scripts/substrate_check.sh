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

info() {
  echo "INFO: $1"
}

warn() {
  echo "WARN: $1"
}

has_rg=0
if command -v rg >/dev/null 2>&1; then
  has_rg=1
fi

resolve_file_by_id() {
  local file_id="$1"
  find "$ROOT_DIR" -type f -name "*${file_id}.md" -print -quit
}

resolve_section6_dir() {
  local direct
  direct="$(find "$ROOT_DIR" -type d -name "SECTION 6 — Checklist Produit V1 (Globale)" -print -quit)"
  if [[ -n "$direct" ]]; then
    printf '%s' "$direct"
    return 0
  fi

  find "$ROOT_DIR" -type d | grep -m1 "SECTION 6 .*Checklist Produit V1" || true
}

SECTION9="$(resolve_file_by_id "30a688d6a596803a8541ef09201359f2")"
EVENTS210="$(resolve_file_by_id "30a688d6a5968047ad41e7305d7d9b39")"
EVENTS210_PATCH="$(find "$ROOT_DIR" -type f -name "PATCH_EVENTS_2.10.4.11.md" -print -quit)"
SECTION2="$(resolve_file_by_id "308688d6a59680ebb64fe4ddb4223b41")"
ANNEX211A="$(resolve_file_by_id "30b688d6a59680889d57de90b0df5efb")"
SECTION6_DIR="$(resolve_section6_dir)"

SUPABASE_CONFIG="$ROOT_DIR/supabase/config.toml"
BACKEND_PKG="$ROOT_DIR/backend/package.json"
MIGRATIONS_DIR="$ROOT_DIR/backend/migrations"

if [[ -z "$SECTION9" || ! -f "$SECTION9" ]]; then
  fail "SECTION 9 introuvable (id 30a688d6a596803a8541ef09201359f2)."
fi
if [[ -z "$EVENTS210" || ! -f "$EVENTS210" ]]; then
  fail "Catalogue events 2.10 introuvable (id 30a688d6a5968047ad41e7305d7d9b39)."
fi
if [[ -z "$SECTION2" || ! -f "$SECTION2" ]]; then
  fail "SECTION 2 backend prompts introuvable (id 308688d6a59680ebb64fe4ddb4223b41)."
fi
if [[ -z "$SECTION6_DIR" || ! -d "$SECTION6_DIR" ]]; then
  fail "Dossier SECTION 6 checklist introuvable."
fi

info "SECTION 9: ${SECTION9:-<missing>}"
info "EVENTS 2.10: ${EVENTS210:-<missing>}"
info "EVENTS 2.10.4.11 patch: ${EVENTS210_PATCH:-<missing optional>}"
info "SECTION 2: ${SECTION2:-<missing>}"
info "ANNEXE 2.11.A: ${ANNEX211A:-<missing optional>}"
info "SECTION 6 dir: ${SECTION6_DIR:-<missing>}"

echo
echo "== A) SECTION 9 lock check =="
if [[ -f "$SECTION9" ]]; then
  if grep -nE 'TBD \(LOCK REQUIRED\)' "$SECTION9" > "$TMP_DIR/section9_tbd.txt"; then
    fail "SECTION 9 contient encore des marqueurs TBD."
    cat "$TMP_DIR/section9_tbd.txt"
  else
    ok "Aucun marqueur TBD dans SECTION 9."
  fi
fi

echo
echo "== B) Backend structure check =="
for rel in backend backend/modules backend/shared backend/migrations backend/runbooks backend/tests; do
  if [[ -d "$ROOT_DIR/$rel" ]]; then
    ok "Dossier présent: $rel"
  else
    fail "Dossier manquant: $rel"
  fi
done

echo
echo "== C) Supabase migrations wiring check =="
if [[ ! -f "$SUPABASE_CONFIG" ]]; then
  fail "Fichier manquant: supabase/config.toml"
else
  if grep -qE 'backend/migrations/\*\.sql' "$SUPABASE_CONFIG"; then
    ok "supabase/config.toml référence backend/migrations/*.sql"
  else
    fail "supabase/config.toml ne référence pas backend/migrations/*.sql"
  fi
fi

echo
echo "== D) Migrations detection check =="
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  fail "Dossier migrations introuvable: backend/migrations"
else
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | sort > "$TMP_DIR/migrations.txt"
  MIGRATION_COUNT="$(wc -l < "$TMP_DIR/migrations.txt" | tr -d ' ')"
  if [[ "$MIGRATION_COUNT" -eq 0 ]]; then
    fail "Aucune migration .sql détectée dans backend/migrations"
  else
    ok "${MIGRATION_COUNT} migration(s) détectée(s)"
    while IFS= read -r m; do
      [[ -z "$m" ]] && continue
      base="$(basename "$m")"
      if [[ ! "$base" =~ ^[0-9]{14}__lot[0-9]+_m[0-9a-z]+_[0-9a-z_]+\.sql$ ]]; then
        fail "Nom de migration non conforme: $base"
      fi
    done < "$TMP_DIR/migrations.txt"
  fi
fi

echo
echo "== E) npm scripts check =="
if [[ ! -f "$BACKEND_PKG" ]]; then
  fail "Fichier manquant: backend/package.json"
else
  if ! command -v node >/dev/null 2>&1; then
    fail "Node.js introuvable pour vérifier les scripts npm."
  else
    if NODE_OUT="$(node -e "const fs=require('fs'); const pkgPath=process.argv[1]; const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8')); const required=['lint','typecheck','test:ci']; const missing=required.filter((k)=>!(pkg.scripts && pkg.scripts[k])); if(missing.length){console.error('Scripts npm manquants: '+missing.join(', ')); process.exit(1);} console.log('Scripts npm requis présents: '+required.join(', '));" "$BACKEND_PKG" 2>&1)"; then
      ok "$NODE_OUT"
    else
      fail "$NODE_OUT"
    fi
  fi
fi

echo
echo "== F) Event coherence check (implémentables ↔ 2.10) =="
if [[ -f "$EVENTS210" ]]; then
  grep '^### ' "$EVENTS210" | sed 's/^### //' > "$TMP_DIR/events_210_raw.txt"
  if [[ -n "$EVENTS210_PATCH" && -f "$EVENTS210_PATCH" ]]; then
    grep '^### ' "$EVENTS210_PATCH" | sed 's/^### //' >> "$TMP_DIR/events_210_raw.txt"
  fi
  sort -u "$TMP_DIR/events_210_raw.txt" > "$TMP_DIR/events_210.txt"
  if [[ ! -s "$TMP_DIR/events_210.txt" ]]; then
    fail "Aucun event canonique extrait depuis 2.10."
  fi
fi

EVENT_REGEX='[A-Z][A-Za-z0-9]+(Created|Updated|Submitted|Validated|Rejected|Blocked|Issued|Recorded|Changed|Calculated|Published|Voided|Allocated|ConvertedToClient|StatusChanged|InviteCreated|ResponseSubmitted|EnforcementEvaluated|BillingStatusChanged|RequirementCreated|RequirementStatusChanged|CheckEventRecorded|PaymentRecorded|DocumentStatusChanged|ProfileUpdated|CommissionCalculated|EntryAdded)'

: > "$TMP_DIR/impl_events_raw.txt"

SOURCE_FILES=("$SECTION2")
if [[ -n "$ANNEX211A" && -f "$ANNEX211A" ]]; then
  SOURCE_FILES+=("$ANNEX211A")
fi
if [[ -d "$SECTION6_DIR" ]]; then
  while IFS= read -r f; do
    SOURCE_FILES+=("$f")
  done < <(find "$SECTION6_DIR" -maxdepth 1 -type f -name '*.md' | sort)
fi

for src in "${SOURCE_FILES[@]}"; do
  if [[ -f "$src" ]]; then
    if [[ "$has_rg" -eq 1 ]]; then
      rg -o "$EVENT_REGEX" "$src" >> "$TMP_DIR/impl_events_raw.txt" || true
    else
      grep -oE "$EVENT_REGEX" "$src" >> "$TMP_DIR/impl_events_raw.txt" || true
    fi
  else
    fail "Fichier source events introuvable: $src"
  fi
done

sort -u "$TMP_DIR/impl_events_raw.txt" > "$TMP_DIR/impl_events.txt" || true

if [[ ! -s "$TMP_DIR/impl_events.txt" ]]; then
  fail "Aucun event implémentable extrait des sources documentaires."
else
  MISSING_COUNT=0
  while IFS= read -r ev; do
    [[ -z "$ev" ]] && continue
    if ! grep -Fx "$ev" "$TMP_DIR/events_210.txt" >/dev/null; then
      echo "$ev" >> "$TMP_DIR/events_missing.txt"
      MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
  done < "$TMP_DIR/impl_events.txt"

  if [[ "$MISSING_COUNT" -gt 0 ]]; then
    warn "Events implémentables absents du catalogue 2.10/2.10.4.11 (non bloquant PR0):"
    sort -u "$TMP_DIR/events_missing.txt"
  else
    ok "Events implémentables cohérents avec 2.10."
  fi
fi

echo
echo "== Résultat global =="
if [[ "$FAIL" -ne 0 ]]; then
  echo "SUBSTRATE CHECK: FAIL"
  exit 1
fi

echo "SUBSTRATE CHECK: OK"
exit 0
