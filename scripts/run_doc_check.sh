#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -d "${ROOT_DIR}/backend/node_modules" ]]; then
  echo "INFO: pruning node_modules markdown"
  PRUNE_HELPER=""
  if [[ -f "${ROOT_DIR}/backend/scripts/prune-node-modules-md.cjs" ]]; then
    PRUNE_HELPER="backend/scripts/prune-node-modules-md.cjs"
  elif [[ -f "${ROOT_DIR}/backend/prune-node-modules-md.cjs" ]]; then
    # Backward-compatible fallback for older repo layouts.
    PRUNE_HELPER="backend/prune-node-modules-md.cjs"
  fi

  if [[ -n "${PRUNE_HELPER}" ]]; then
    echo "INFO: using prune helper: ${PRUNE_HELPER}"
    if command -v node >/dev/null 2>&1; then
      (cd "${ROOT_DIR}" && node "${PRUNE_HELPER}")
    else
      echo "INFO: node unavailable, fallback prune via find"
      find "${ROOT_DIR}/backend/node_modules" -type f -name "*.md" -delete
    fi
  else
    echo "INFO: prune helper missing, fallback prune via find"
    find "${ROOT_DIR}/backend/node_modules" -type f -name "*.md" -delete
  fi
else
  echo "INFO: backend/node_modules missing, skip prune"
fi

if [[ ! -f "${SCRIPT_DIR}/doc_check.sh" ]]; then
  echo "ERROR: missing ./doc_check.sh in ${SCRIPT_DIR}"
  exit 1
fi

echo "INFO: running doc_check: ./doc_check.sh"
(cd "${ROOT_DIR}" && bash "${SCRIPT_DIR}/doc_check.sh")
