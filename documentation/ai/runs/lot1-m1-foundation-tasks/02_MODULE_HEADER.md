# Module Header — Lot 1 / M1 Foundation (Tasks)

## Scope

- lot_id: `Lot 1`
- module_id: `M1`
- domaine: Foundation (surface transverse tasks V1.1)
- dependances module:
- auth JWT
- RBAC 2.12
- outbox 2.10
- audit logs

## Contrats cibles

- OpenAPI endpoints couverts:
- `POST /v1/tasks`
- `PATCH /v1/tasks/{task_id}/status`
- `GET /v1/tasks`
- DB tables touchees:
- `tasks`
- `events_outbox`
- `audit_logs`
- Events emis:
- `TaskCreated`
- `TaskStatusChanged`
- RBAC par endpoint:
- `tenant_admin`, `agency_user`, `consultant` uniquement
- Idempotency endpoints:
- aucun endpoint tasks explicitement marque "creation sensible" dans 2.11

## Conventions d'execution appliquees

- tenant-scoping strict par `tenant_id` issu du token.
- RLS activee et testee.
- audit immutable sur mutations.
- outbox sur endpoints mutants.
- erreurs standard OpenAPI.

## Risques principaux

- fuite cross-tenant sur listing tasks.
- publication event non conforme 2.10.
- ecart RBAC sur `403`.
- migration non synchronisee contrat.

## Stop conditions specifiques

- endpoint/table/event absent des contrats cibles.
- besoin hors scope M1 tasks.
- conflit OpenAPI/Events/DB/RBAC non arbitre.
