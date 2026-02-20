# 2.12.a — RBAC & PERMISSIONS (MATRIX) — V1.2 (PATCH)

- Statut: DRAFT
- Type: DERIVED / DRAFT — does not override LOCKED V1
- Portee: formaliser la matrice RBAC pour les surfaces OpenAPI V1.2.1 (sans logique metier).

## Sources de reference (lecture seule)

- RBAC LOCKED V1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md`
- OpenAPI V1.2 patch DRAFT: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/2 11 — OPENAPI V1.2 (PATCH) — SURFACES MANQUANTES 31b688d6a59680d4a1b2c3d4e5f60701.md`

## Decisions OWNER appliquees (V1.2.1)

1. Auth est geree par Supabase Auth; aucune route auth custom dans cette matrice.
2. Surface fichiers standardisee: `/v1/files` + `/v1/file-links`.
3. Check-in/out standardise via endpoint unique: `POST /v1/check-events`.

## Principes RBAC du patch

- Tous les droits sont tenant-scoped.
- Aucune action cross-tenant n'est autorisee.
- Les restrictions d'ownership (mes propres fichiers, mes propres missions) sont notees comme contraintes contractuelles.
- Ce patch reste DRAFT tant que non valide par owner.

## Endpoint -> Allowed roles (V1.2.1)

| Endpoint | tenant_admin | agency_user | consultant | client_user | worker | system | Forbidden / Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET /v1/me | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Profil courant uniquement. |
| GET /v1/users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Liste users reservee admin tenant. |
| POST /v1/users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Creation user reservee admin tenant. |
| PATCH /v1/users/{user_id} | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Edition user reservee admin tenant. |
| POST /v1/users/{user_id}:deactivate | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Action administrative sensible. |
| POST /v1/users/{user_id}:reactivate | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Action administrative sensible. |
| GET /v1/tenant-settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Lecture settings: admin + operationnel agence. |
| PATCH /v1/tenant-settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Ecriture settings reservee admin tenant. |
| POST /v1/files | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | Upload tenant-scoped; consultant/worker limites au perimetre autorise. |
| GET /v1/files/{file_id} | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Acces conditionne au lien valide (`file_links`) et au scope. |
| POST /v1/files/{file_id}:soft-delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Soft delete reserve admin + operationnel agence. |
| POST /v1/file-links | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | OWNER ARBITRATION REQUIRED: borne fine worker/consultant (ownership strict). |
| DELETE /v1/file-links/{file_link_id} | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Suppression lien reservee admin + operationnel agence. |
| POST /v1/check-events | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | Worker autorise sur ses missions uniquement; no cross-tenant. |

## Forbidden actions (explicites)

- `client_user`: aucun upload, aucun linking, aucun check-event.
- `worker`: aucune administration users/settings; aucun delete de file-link.
- `consultant`: aucune administration users/settings; aucun check-event.
- `agency_user`: aucune administration users (create/update/deactivate/reactivate).
- `system`: non scope dans ce patch (aucune route ci-dessus).

## Notes de coherence

- Les chemins RBAC correspondent exactement au patch OpenAPI V1.2.1.
- Les restrictions d'ownership sont contractuelles, sans detail d'implementation technique dans ce document.
- En cas de conflit avec RBAC LOCKED V1, RBAC LOCKED V1 prime tant que ce patch n'est pas valide.

## What remains blocked

- OWNER ARBITRATION REQUIRED: niveau exact de droit consultant/worker sur `POST /v1/file-links` (cas limites ownership).
- OWNER ARBITRATION REQUIRED: besoin eventuel d'ouvrir `GET /v1/users` a `agency_user` (actuellement refuse par choix conservateur).

## Mini-changelog

- 2026-02-19: V1.2.1 owner decisions appliques sur la matrice RBAC des nouvelles surfaces, sans modification LOCKED.
