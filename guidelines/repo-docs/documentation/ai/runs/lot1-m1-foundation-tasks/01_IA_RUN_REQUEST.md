# IA Run Request — Lot 1 / M1 Foundation (Tasks)

## Identité du run

- Date: 2026-02-27
- Owner: a renseigner
- Ticket: a renseigner
- Branche: a renseigner

## Scope obligatoire

- lot_id: `Lot 1`
- module_id: `M1`
- module_scope_endpoints:
- `POST /v1/tasks`
- `PATCH /v1/tasks/{task_id}/status`
- `GET /v1/tasks`
- module_scope_tables:
- `tasks`
- `events_outbox`
- `audit_logs`
- module_scope_events:
- `TaskCreated` (producer `M1`)
- `TaskStatusChanged` (producer `M1`)
- module_scope_rbac:
- `POST /v1/tasks`: `tenant_admin`, `agency_user`, `consultant`
- `PATCH /v1/tasks/{task_id}/status`: `tenant_admin`, `agency_user`, `consultant`
- `GET /v1/tasks`: `tenant_admin`, `agency_user`, `consultant`

## Objectif

- Implémenter la surface `tasks` de M1 conformément aux contrats LOCKED.
- Publier les events outbox requis sur mutations.
- Prouver RBAC et isolation multi-tenant.

## Hors scope explicite

- Endpoints non présents dans OpenAPI 2.11 LOCKED pour ce run.
- Toute extension multi-module non validée.
- Toute modification CI/scripts/workflows.

## Contraintes à rappeler

- Contract-first strict.
- Multi-tenant strict.
- No-code orchestration only.
- Aucun event hors catalogue 2.10.
- Aucun changement hors file change budget.

## Artefacts attendus avant code

- Module Header.
- Matrice d'alignement.
- Plan d'exécution.

## Definition of Done du run

- Tests unitaires: requis.
- Tests intégration: requis.
- Tests RBAC: requis.
- Tests multi-tenant: requis.
- Tests outbox: requis.
- Tests audit: requis.
- Checks scripts: requis.
