# Matrice d'alignement — Lot 1 / M1 Foundation (Tasks)

| Endpoint | Roles autorises | Tables DB | Event publie | Idempotency | Erreurs cles | Tests minimum |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /v1/tasks` | `tenant_admin`, `agency_user`, `consultant` | `tasks`, `events_outbox`, `audit_logs` | `TaskCreated` (`M1`) | non requis explicitement par 2.11 sur cette route | `400/401/403/404/409/429/500` | `unit, integration, rbac+, rbac-, multi-tenant, outbox, audit` |
| `PATCH /v1/tasks/{task_id}/status` | `tenant_admin`, `agency_user`, `consultant` | `tasks`, `events_outbox`, `audit_logs` | `TaskStatusChanged` (`M1`) | n/a | `400/401/403/404/409/429/500` | `unit, integration, rbac+, rbac-, multi-tenant, outbox, audit` |
| `GET /v1/tasks` | `tenant_admin`, `agency_user`, `consultant` | `tasks` | aucun | n/a | `400/401/403/404/429/500` | `integration, rbac+, rbac-, multi-tenant` |

## Verifications

- Chaque mutation ecrit un event dans `events_outbox`.
- Les events `TaskCreated` et `TaskStatusChanged` existent dans 2.10.
- Les permissions RBAC sont explicites et alignees 2.12.
- Le listing est strictement tenant-scoped.
