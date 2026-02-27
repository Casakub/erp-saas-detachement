# PR0-bis — Doc-check gate policy (temporary)

## Decision

Doc-check is temporarily non-blocking in CI for PR0-bis.
Reason: `scripts/doc_check.sh` fails on pre-existing markdown fence issues in DRAFT docs outside PR0 substrate code scope.

Impacted CI workflows:

- `.github/workflows/doc-check.yml`
- `.github/workflows/backend-ci.yml` (step `Run doc check`)

## Owner

- **Owner**: Tech Lead documentation gates (`doc_check`) + Release Pack maintainer.

## Deadline

- **Deadline**: rollback du mode non-bloquant **avant la fin de PR1**.

## Scope de remediation

Remediation documentaire limitée au périmètre non-LOCKED suivant:

- **H1-bis**: patches (`SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)`).
- **Release Pack**: index/alignment/open-items/changelog.
- **Checklists**: `SECTION 6` (lots).

Exclusion explicite:

- aucun changement sur `SOCLE TECHNIQUE GELÉ — V1 (LOCKED)`.

## Rollback condition

Le gate doc-check redevient bloquant quand **toutes** les conditions suivantes sont vraies:

1. `bash scripts/run_doc_check.sh` retourne `0` (plus de violations fences).
2. Le plan `DOC_REMEDIATION_PLAN.md` est soldé (statut des fichiers = done).
3. Les deux workflows suivants retirent `continue-on-error: true` sur le step doc-check:
   - `.github/workflows/doc-check.yml`
   - `.github/workflows/backend-ci.yml`

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
