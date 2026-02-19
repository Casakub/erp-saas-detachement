#!/usr/bin/env bash

set -u

LC_ALL=C

resolve_locked_doc_by_id() {
  local file_id="$1"
  local match
  match="$(find . -type f -name "*${file_id}.md" -print -quit)"
  if [[ -z "$match" ]]; then
    echo "KO: fichier introuvable (id=${file_id})"
    exit 1
  fi
  printf '%s' "$match"
}

OPENAPI_FILE="$(resolve_locked_doc_by_id "308688d6a596801dad76e1c4a1a96c02")"
RBAC_FILE="$(resolve_locked_doc_by_id "308688d6a596802d8e81c1623900db41")"
EVENTS_FILE="$(resolve_locked_doc_by_id "308688d6a596802bad05fb3834118422")"

FAIL=0
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

section() {
  printf "\n== %s ==\n" "$1"
}

ok() {
  printf "OK: %s\n" "$1"
}

ko() {
  printf "KO: %s\n" "$1"
  FAIL=1
}

if command -v rg >/dev/null 2>&1; then
  SEARCH_TOOL="rg"
else
  SEARCH_TOOL="grep"
fi

for required in "$OPENAPI_FILE" "$RBAC_FILE" "$EVENTS_FILE"; do
  if [[ ! -f "$required" ]]; then
    echo "KO: fichier introuvable: $required"
    exit 1
  fi
done

section "A) Fences"

FORBIDDEN_PATTERN='^[[:space:]]*```(jsx|tsx|ts|js|markdown)[[:space:]]*$'
if [[ "$SEARCH_TOOL" == "rg" ]]; then
  FORBIDDEN_HITS="$(rg -n --no-heading --glob '*.md' "$FORBIDDEN_PATTERN" . || true)"
else
  FORBIDDEN_HITS="$(grep -R -n -E --include='*.md' "$FORBIDDEN_PATTERN" . || true)"
fi

if [[ -n "$FORBIDDEN_HITS" ]]; then
  ko "fences interdites détectées"
  echo "$FORBIDDEN_HITS"
else
  ok "0 fence interdite"
fi

AMBIGUOUS_FILE="$TMP_DIR/ambiguous_fences.txt"
: > "$AMBIGUOUS_FILE"
while IFS= read -r -d '' file; do
  awk -v file="$file" '
  BEGIN { in_fence=0 }
  {
    if ($0 ~ /^[[:space:]]*```/) {
      line=$0
      sub(/^[[:space:]]*/, "", line)
      if (in_fence==0) {
        if (line ~ /^```[[:space:]]*$/) {
          printf("%s:%d: fence ambiguë (ouverture sans langage)\n", file, FNR)
        }
        in_fence=1
      } else {
        if (line ~ /^```[[:space:]]*$/) {
          in_fence=0
        } else {
          printf("%s:%d: fence imbriquée/cassée\n", file, FNR)
        }
      }
    }
  }
  END {
    if (in_fence==1) {
      printf("%s:%d: fence non fermée\n", file, FNR)
    }
  }' "$file" >> "$AMBIGUOUS_FILE"
done < <(find . -type f -name '*.md' -print0)

if [[ -s "$AMBIGUOUS_FILE" ]]; then
  ko "fences ambiguës/cassées détectées"
  cat "$AMBIGUOUS_FILE"
else
  ok "0 fence ambiguë"
fi

section "B) Cohérence OpenAPI ↔ RBAC"

OPENAPI_ROUTES="$TMP_DIR/openapi_routes.txt"
RBAC_ROUTES="$TMP_DIR/rbac_routes.txt"

awk '
function norm_path(path) {
  gsub(/`/, "", path)
  sub(/^[[:space:]]+/, "", path)
  sub(/[[:space:]]+$/, "", path)
  gsub(/\{[^}]+\}/, "{id}", path)
  if (path ~ /^\/v1\//) {
    sub(/^\/v1/, "", path)
  }
  return path
}
/^### (GET|POST|PUT|PATCH|DELETE)[[:space:]]+/ {
  line=$0
  sub(/^### [[:space:]]*/, "", line)
  method=line
  sub(/[[:space:]].*$/, "", method)
  path=line
  sub(/^[A-Z]+[[:space:]]+/, "", path)
  print method " " norm_path(path)
}
' "$OPENAPI_FILE" | sort -u > "$OPENAPI_ROUTES"

awk '
function norm_path(path) {
  gsub(/`/, "", path)
  sub(/^[[:space:]]+/, "", path)
  sub(/[[:space:]]+$/, "", path)
  gsub(/\{[^}]+\}/, "{id}", path)
  if (path ~ /^\/v1\//) {
    sub(/^\/v1/, "", path)
  }
  return path
}
/^\|[[:space:]]*(GET|POST|PUT|PATCH|DELETE)[[:space:]]+/ {
  line=$0
  sub(/^\|[[:space:]]*/, "", line)
  method=line
  sub(/[[:space:]].*$/, "", method)
  path=line
  sub(/^[A-Z]+[[:space:]]+/, "", path)
  sub(/[[:space:]]*\|.*/, "", path)
  print method " " norm_path(path)
}
' "$RBAC_FILE" | sort -u > "$RBAC_ROUTES"

if [[ ! -s "$OPENAPI_ROUTES" ]]; then
  ko "extraction des routes OpenAPI vide"
fi
if [[ ! -s "$RBAC_ROUTES" ]]; then
  ko "extraction des routes RBAC vide"
fi

OPENAPI_NOT_RBAC="$TMP_DIR/openapi_not_rbac.txt"
RBAC_NOT_OPENAPI="$TMP_DIR/rbac_not_openapi.txt"
comm -23 "$OPENAPI_ROUTES" "$RBAC_ROUTES" > "$OPENAPI_NOT_RBAC"
comm -13 "$OPENAPI_ROUTES" "$RBAC_ROUTES" > "$RBAC_NOT_OPENAPI"

if [[ -s "$OPENAPI_NOT_RBAC" ]]; then
  ko "endpoints OpenAPI absents RBAC"
  sed 's/^/  - /' "$OPENAPI_NOT_RBAC"
else
  ok "0 endpoint OpenAPI absent RBAC"
fi

if [[ -s "$RBAC_NOT_OPENAPI" ]]; then
  ko "endpoints RBAC absents OpenAPI"
  sed 's/^/  - /' "$RBAC_NOT_OPENAPI"
else
  ok "0 endpoint RBAC absent OpenAPI"
fi

section "C) Cohérence OpenAPI Events ↔ Catalogue Events"

CATALOG_EVENTS="$TMP_DIR/catalog_events.txt"
OPENAPI_EVENTS="$TMP_DIR/openapi_events.txt"

awk '
/^### [A-Za-z0-9]+[[:space:]]*$/ {
  name=$0
  sub(/^### [[:space:]]*/, "", name)
  sub(/[[:space:]]*$/, "", name)
  if (name ~ /^[A-Z][a-z0-9]+([A-Z][A-Za-z0-9]+)+$/) {
    print name
  }
}
' "$EVENTS_FILE" | sort -u > "$CATALOG_EVENTS"

if [[ ! -s "$CATALOG_EVENTS" ]]; then
  ko "catalogue events 2.10 vide (extraction impossible)"
fi

awk '
function emit_tokens(line, tok) {
  while (match(line, /[A-Z][a-z0-9]+([A-Z][A-Za-z0-9]+)+/)) {
    tok=substr(line, RSTART, RLENGTH)
    print tok
    line=substr(line, RSTART + RLENGTH)
  }
}
BEGIN { in_events=0 }
{
  if ($0 ~ /^\*\*Events\*\*[[:space:]]*$/) {
    in_events=1
    next
  }
  if (in_events==1) {
    if ($0 ~ /^### / || $0 ~ /^## / || $0 ~ /^# / || $0 ~ /^---[[:space:]]*$/ || $0 ~ /^\*\*[A-Za-z].*\*\*:?[[:space:]]*$/) {
      in_events=0
    } else {
      emit_tokens($0)
    }
  }
}
' "$OPENAPI_FILE" | sort -u > "$OPENAPI_EVENTS"

EVENTS_MISSING="$TMP_DIR/events_missing_in_catalog.txt"
comm -23 "$OPENAPI_EVENTS" "$CATALOG_EVENTS" > "$EVENTS_MISSING"

if [[ -s "$EVENTS_MISSING" ]]; then
  ko "events mentionnés en OpenAPI absents du catalogue 2.10"
  sed 's/^/  - /' "$EVENTS_MISSING"
else
  ok "0 event OpenAPI absent du catalogue 2.10"
fi

section "D) Endpoints mutants sans Events concrets"

MUTANT_ISSUES="$TMP_DIR/mutant_issues.txt"
awk -v catalog_file="$CATALOG_EVENTS" -v openapi_file="$OPENAPI_FILE" '
BEGIN {
  while ((getline ev < catalog_file) > 0) {
    catalog[ev]=1
  }
  close(catalog_file)
  issues=0
  in_endpoint=0
}
function check_tokens(line, tok) {
  while (match(line, /[A-Z][a-z0-9]+([A-Z][A-Za-z0-9]+)+/)) {
    tok=substr(line, RSTART, RLENGTH)
    if (tok in catalog) {
      has_concrete_event=1
    }
    line=substr(line, RSTART + RLENGTH)
  }
}
function flush_endpoint(reason) {
  if (!in_endpoint || !is_mutant) {
    return
  }
  reason=""
  if (!has_events_section) {
    reason="section Events absente"
  } else if (has_placeholder) {
    reason="placeholder/tbd dans section Events"
  } else if (!has_concrete_event) {
    reason="aucun event concret du catalogue 2.10"
  }
  if (reason != "") {
    printf("%s:%d: %s %s -> %s\n", openapi_file, endpoint_line, endpoint_method, endpoint_path, reason)
    issues++
  }
}
{
  if ($0 ~ /^### (GET|POST|PUT|PATCH|DELETE)[[:space:]]+/) {
    line=$0
    sub(/^### [[:space:]]*/, "", line)
    method=line
    sub(/[[:space:]].*$/, "", method)
    path=line
    sub(/^[A-Z]+[[:space:]]+/, "", path)
    gsub(/`/, "", path)
    sub(/[[:space:]]+$/, "", path)

    flush_endpoint()
    in_endpoint=1
    endpoint_line=FNR
    endpoint_method=method
    endpoint_path=path
    is_mutant=(endpoint_method=="POST" || endpoint_method=="PUT" || endpoint_method=="PATCH" || endpoint_method=="DELETE")
    has_events_section=0
    in_events=0
    has_placeholder=0
    has_concrete_event=0
    next
  }

  if (!in_endpoint) {
    next
  }

  if ($0 ~ /^\*\*Events\*\*[[:space:]]*$/) {
    has_events_section=1
    in_events=1
    next
  }

  if (in_events==1) {
    if ($0 ~ /^### / || $0 ~ /^## / || $0 ~ /^# / || $0 ~ /^---[[:space:]]*$/ || $0 ~ /^\*\*[A-Za-z].*\*\*:?[[:space:]]*$/) {
      in_events=0
    } else {
      low=tolower($0)
      if (low ~ /non spécifi/ || low ~ /non specifi/ || low ~ /tbd/ || low ~ /placeholder/) {
        has_placeholder=1
      }
      check_tokens($0)
    }
  }
}
END {
  flush_endpoint()
}
' "$OPENAPI_FILE" > "$MUTANT_ISSUES"

if [[ -s "$MUTANT_ISSUES" ]]; then
  ko "endpoints mutants sans Events concrets"
  cat "$MUTANT_ISSUES"
else
  ok "0 endpoint mutant sans Events concrets"
fi

section "Résultat global"
if [[ "$FAIL" -eq 0 ]]; then
  echo "DOC CHECK: OK"
  exit 0
else
  echo "DOC CHECK: FAILED"
  exit 1
fi
