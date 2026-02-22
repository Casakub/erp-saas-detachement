# PR0-bis — Doc-check gate policy (temporary)

## Decision

Doc-check is temporarily non-blocking in CI for PR0-bis.
Reason: `scripts/doc_check.sh` fails on pre-existing markdown fence issues in DRAFT docs outside PR0 substrate code scope.

Impacted CI workflows:

- `.github/workflows/doc-check.yml`
- `.github/workflows/backend-ci.yml` (step `Run doc check`)

## How to restore blocking gate

1. Fix all remaining fence violations reported by:
   - `bash scripts/run_doc_check.sh`
2. Remove `continue-on-error: true` from:
   - `.github/workflows/doc-check.yml`
   - `.github/workflows/backend-ci.yml`
3. Re-run CI and ensure doc-check passes with exit code 0.

## Scope guard

- No LOCKED document has been modified in PR0-bis.
- This policy change is CI-only and does not alter business/runtime contracts.
