# 2 12 — RBAC & PERMISSIONS (MATRIX) — V1.2 (PATCH)

- Statut: DRAFT
- Type: DERIVED / DRAFT — does not override LOCKED V1
- Portee: patch contractuel RBAC pour les surfaces OpenAPI V1.2 proposees (sans logique metier).

## Sources de reference (lecture seule)

- RBAC LOCKED V1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md`
- OpenAPI V1.2 patch DRAFT: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/2 11 — OPENAPI V1.2 (PATCH) — SURFACES MANQUANTES 31b688d6a59680d4a1b2c3d4e5f60701.md`
- OpenAPI LOCKED V1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`

## Scope du patch RBAC V1.2

Ce patch ajoute des lignes RBAC pour les endpoints proposes en V1.2:
- Auth/session + identity (`/v1/auth/*`, `/v1/me`, `/v1/users*`, `/v1/tenant-settings`).
- Upload fichiers generique (`/v1/files`, `/v1/files/{file_id}:link`).
- Worker check events (`/v1/missions/{mission_id}/worker-check-events`).

Toutes les lignes ci-dessous restent conditionnelles a l'arbitrage owner sur les endpoints finaux.

## Matrice RBAC V1.2 (PATCH) — OWNER ARBITRATION REQUIRED

Valeurs:
- `✅` autorise
- `❌` interdit
- `ARBITRATION` choix final owner requis

| Endpoint | tenant_admin | agency_user | consultant | client_user | worker | system | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST /v1/auth/login | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Authentification utilisateur; compte actif requis. |
| POST /v1/auth/logout | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Cloture session utilisateur courant. |
| POST /v1/auth/refresh | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Rotation token utilisateur courant. |
| POST /v1/auth/password-reset/request | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Demande reset sans elevation privilege. |
| POST /v1/auth/password-reset/confirm | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Confirmation reset scope utilisateur courant. |
| GET /v1/me | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | Lecture profil courant uniquement. |
| GET /v1/users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Liste users du tenant; client/worker exclus. |
| POST /v1/users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Creation user tenant; arbitration sur consultant. |
| PATCH /v1/users/{user_id} | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Edition user tenant; pas de cross-tenant. |
| PATCH /v1/users/{user_id}/status | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Activation/desactivation; operation sensible. |
| PATCH /v1/users/{user_id}/role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Changement role reserve tenant_admin. |
| GET /v1/tenant-settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Lecture settings tenant interne agence. |
| PATCH /v1/tenant-settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | Mutation settings reserve tenant_admin. |
| POST /v1/files | ✅ | ✅ | ARBITRATION | ❌ | ❌ | ❌ | Upload generique M9; consultant a arbitrer par usage metier. |
| POST /v1/files/{file_id}:link | ✅ | ✅ | ARBITRATION | ❌ | ❌ | ❌ | Liaison fichier-entite; consultant a arbitrer. |
| POST /v1/missions/{mission_id}/worker-check-events | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | worker limite a son propre perimetre mission; cross-tenant interdit. |

## Forbidden actions (multi-tenant strict)

- Interdiction absolue d'acces cross-tenant pour tous les roles.
- `client_user` et `worker` ne peuvent pas appeler les endpoints d'administration users/settings.
- `system` ne peut pas utiliser ces endpoints utilisateur/API front; il reste limite aux operations internes explicitement listees dans RBAC LOCKED.
- Toute tentative hors matrice doit retourner `403` et produire un audit log.

## Coherence avec RBAC LOCKED

- Pattern conserve: operations critiques reservees a `tenant_admin` et partiellement `agency_user` (voir RBAC LOCKED, sections matrices endpoint).
- Pattern conserve: `client_user` et `worker` en lecture/usage limite, sans ecriture administrative.
- Ce document n'ecrase pas RBAC LOCKED V1; il prepare uniquement un patch V1.2 derive.

## What remains blocked

- OWNER ARBITRATION REQUIRED: validation finale des colonnes `ARBITRATION` et des droits consultant sur `/v1/files*`.
- OWNER ARBITRATION REQUIRED: confirmation perimetre `agency_user` sur `/v1/users` creation/edition.
- OWNER ARBITRATION REQUIRED: validation finale de la route check-events retenue (endpoint unique vs alternatives).

## Mini-changelog

- 2026-02-19: creation patch RBAC V1.2 DRAFT pour surfaces OpenAPI manquantes, sans modification des contrats LOCKED.
