# Matrice d'alignement

| Endpoint | Rôles autorisés | Tables DB | Event publié | Idempotency | Erreurs clés | Tests minimum |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /v1/...` | `tenant_admin, ...` | `table_a, table_b` | `EventName` | `oui/non` | `400/401/403/404/409/422/429/500` | `unit, integration, rbac+, rbac-, tenant, outbox, audit` |
| `PATCH /v1/...` | `...` | `...` | `...` | `oui/non` | `...` | `...` |
| `GET /v1/...` | `...` | `...` | `aucun` | `n/a` | `400/401/403/404/429/500` | `integration, rbac, tenant` |

## Vérifications

- Tous les endpoints mutants publient un event outbox.
- Tous les events sont présents en 2.10.
- Toutes les tables existent en 2.9 (ou migration prévue).
- Toutes les permissions sont explicites en 2.12.
