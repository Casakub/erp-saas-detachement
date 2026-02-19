#!/usr/bin/env bash

set -euo pipefail

SECTION6_DIR="ERP Détachement europe/SECTION 6 — Checklist Produit V1 (Globale)"
FAIL=0

log_ok() {
  echo "OK: $1"
}

log_error() {
  echo "ERROR: $1"
  FAIL=1
}

token_present_in_file() {
  local file="$1"
  local token="$2"
  local escaped
  escaped="$(printf '%s' "$token" | sed -e 's/[][(){}.^$*+?|\\/]/\\&/g')"
  grep -Eq "(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)" "$file"
}

required_tokens_for_lot() {
  case "$1" in
    1) echo "M1" ;;
    2) echo "M7 M8 M9" ;;
    3) echo "M7.T M7bis" ;;
    4) echo "M2 M3 M4" ;;
    5) echo "M5 M6" ;;
    6) echo "M10" ;;
    7) echo "M8" ;;
    8) echo "M11 M12" ;;
    *) echo "" ;;
  esac
}

choose_lot_file() {
  local lot="$1"
  shift
  local files=("$@")
  local f
  local primary=()
  local secondary=()

  for f in "${files[@]}"; do
    if printf '%s\n' "$f" | grep -Eiq "LOT[[:space:]]*${lot}[[:space:]]*IA"; then
      primary+=("$f")
    fi
    if printf '%s\n' "$f" | grep -Eiq "LOT[[:space:]]*${lot}([^0-9]|$)"; then
      secondary+=("$f")
    fi
  done

  if [[ "${#primary[@]}" -gt 0 ]]; then
    printf '%s\n' "${primary[0]}"
    return
  fi

  if [[ "${#secondary[@]}" -gt 0 ]]; then
    printf '%s\n' "${secondary[0]}"
    return
  fi

  printf '\n'
}

if [[ ! -d "$SECTION6_DIR" ]]; then
  log_error "SECTION 6 directory missing: $SECTION6_DIR"
  echo "LOTS/MODULES CHECK: FAIL"
  exit 1
fi

all_lot_files=()
while IFS= read -r file; do
  all_lot_files+=("$file")
done < <(find "$SECTION6_DIR" -maxdepth 1 -type f -name '*.md' | sort)

if [[ "${#all_lot_files[@]}" -eq 0 ]]; then
  log_error "No lot checklist files found under $SECTION6_DIR"
  echo "LOTS/MODULES CHECK: FAIL"
  exit 1
fi

echo "== Lots 1..8 =="
for lot in 1 2 3 4 5 6 7 8; do
  required="$(required_tokens_for_lot "$lot")"
  lot_file="$(choose_lot_file "$lot" "${all_lot_files[@]}")"

  if [[ -z "$lot_file" ]]; then
    echo "Lot $lot | file found: no | anchors present: no | missing: $required | file: -"
    FAIL=1
    continue
  fi

  missing=()
  for token in $required; do
    if ! token_present_in_file "$lot_file" "$token"; then
      missing+=("$token")
    fi
  done

  if [[ "${#missing[@]}" -eq 0 ]]; then
    echo "Lot $lot | file found: yes | anchors present: yes | missing: - | file: $lot_file"
  else
    echo "Lot $lot | file found: yes | anchors present: no | missing: ${missing[*]} | file: $lot_file"
    FAIL=1
  fi
done

echo ""
echo "== Global coverage (SECTION 6) =="
all_modules=(M1 M2 M3 M4 M5 M6 M7 M8 M9 M10 M11 M12 M13 M7bis)
missing_global=()
for module in "${all_modules[@]}"; do
  found=0
  for file in "${all_lot_files[@]}"; do
    if token_present_in_file "$file" "$module"; then
      found=1
      break
    fi
  done
  if [[ "$found" -eq 0 ]]; then
    missing_global+=("$module")
  fi
done

if [[ "${#missing_global[@]}" -eq 0 ]]; then
  log_ok "global module coverage complete for M1..M13 and M7bis"
else
  log_error "global module coverage missing: ${missing_global[*]}"
fi

echo ""
echo "== Placeholder markers (SECTION 6 only) =="
markers=("<à compléter>" "TBD" "LOCK REQUIRED" "PLACEHOLDER")
placeholder_hits=()
for file in "${all_lot_files[@]}"; do
  for marker in "${markers[@]}"; do
    if grep -Fq -- "$marker" "$file"; then
      placeholder_hits+=("$file :: $marker")
    fi
  done
done

if [[ "${#placeholder_hits[@]}" -eq 0 ]]; then
  log_ok "no placeholder markers found in SECTION 6 lot files"
else
  log_error "placeholder markers detected"
  for hit in "${placeholder_hits[@]}"; do
    echo "  - $hit"
  done
fi

if [[ "$FAIL" -eq 0 ]]; then
  echo "LOTS/MODULES CHECK: OK"
  exit 0
fi

echo "LOTS/MODULES CHECK: FAIL"
exit 1
