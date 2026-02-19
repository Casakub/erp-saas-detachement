# 2 11 — OPENAPI V1.2 (PATCH) — SURFACES MANQUANTES

- Statut: DRAFT
- Type: DERIVED / DRAFT — does not override LOCKED V1
- Portee: patch contractuel de surfaces OpenAPI manquantes identifiees par audit (sans logique metier).

## Sources de reference (lecture seule)

- Base OpenAPI LOCKED: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`
- Base Events LOCKED: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-fr 308688d6a596802bad05fb3834118422.md`
- Base RBAC LOCKED: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md`
- Base DB LOCKED: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md`

## Scope du patch V1.2

Ce patch couvre uniquement les gaps contractuels suivants:
- Lot 1: surfaces Auth / Users / Me / Tenant settings absentes en 2.11 LOCKED.
- Lot 2: surface generique upload fichiers absente en 2.11 LOCKED (seul `/v1/clients/{client_id}/documents` existe).
- Lot 3: surface API check-in/check-out absente en 2.11 LOCKED (event et DB existent deja).

## Patch summary

Surfaces OpenAPI candidates (pending owner arbitration):
- Auth/session + identity:
- `POST /v1/auth/login`
- `POST /v1/auth/logout`
- `POST /v1/auth/refresh`
- `POST /v1/auth/password-reset/request`
- `POST /v1/auth/password-reset/confirm`
- `GET /v1/me`
- `GET /v1/users`
- `POST /v1/users`
- `PATCH /v1/users/{user_id}`
- `PATCH /v1/users/{user_id}/status`
- `PATCH /v1/users/{user_id}/role`
- `GET /v1/tenant-settings`
- `PATCH /v1/tenant-settings`
- Files:
- `POST /v1/files`
- `POST /v1/files/{file_id}:link`
- Worker check events:
- `POST /v1/missions/{mission_id}/worker-check-events`

Schema stubs ajoutes:
- `AuthLoginRequest`, `AuthLoginResponse`
- `AuthRefreshRequest`, `AuthRefreshResponse`
- `PasswordResetRequestCreate`, `PasswordResetConfirmRequest`, `PasswordResetConfirmResponse`
- `MeResponse`
- `UserListItem`, `UserCreateRequest`, `UserCreateResponse`, `UserUpdateRequest`, `UserStatusPatchRequest`, `UserRolePatchRequest`
- `TenantSettingsResponse`, `TenantSettingsPatchRequest`
- `FileUploadRequest`, `FileUploadResponse`, `FileLinkRequest`, `FileLinkResponse`
- `WorkerCheckEventCreateRequest`, `WorkerCheckEventCreateResponse`

## Arbitration block (OWNER ARBITRATION REQUIRED)

### A) Auth/session + me + users + tenant-settings

Option A1 (RECOMMENDED):
- Groupe `auth` dedie + endpoints explicites identity/settings:
- `/v1/auth/*`, `/v1/me`, `/v1/users*`, `/v1/tenant-settings`.
- Justification: coherent avec references documentaires existantes et nomenclature V1 (`/v1/...`).

Option A2:
- Groupe `sessions` dedie:
- `/v1/sessions:*`, `/v1/account/me`, `/v1/tenant-settings`.

Option A3:
- Groupe IAM:
- `/v1/iam/sessions:*`, `/v1/iam/users*`, `/v1/iam/tenant-settings`.

Decision: OWNER ARBITRATION REQUIRED.

### B) Files upload generique

Option B1 (RECOMMENDED):
- `POST /v1/files` + `POST /v1/files/{file_id}:link`.
- Justification: aligne avec tables `files` et `file_links` en 2.9 (`...2 9 ...:607`, `...2 9 ...:621`).

Option B2:
- `POST /v1/uploads` puis liens sur endpoints metiers existants.

Option B3:
- Pas de surface generique; uniquement endpoints metiers (`/clients/{id}/documents`, etc.).

Decision: OWNER ARBITRATION REQUIRED.

### C) Worker check events (check-in/out)

Option C1 (RECOMMENDED):
- Endpoint unique `POST /v1/missions/{mission_id}/worker-check-events` avec `event_type` enum `check_in|check_out`.
- Justification: aligne avec 2.10 `WorkerCheckEventRecorded` et payload `event_type` (`...2 10 ...:255`, `...2 10 ...:260`) et 2.9 `worker_check_events` (`...2 9 ...:355`).

Option C2:
- Deux endpoints action:
- `POST /v1/missions/{mission_id}:check-in`
- `POST /v1/missions/{mission_id}:check-out`

Option C3:
- Endpoint worker-centrique `POST /v1/workers/{worker_id}/check-events`.

Decision: OWNER ARBITRATION REQUIRED.

## Proposed path definitions (RECOMMENDED candidate set, non-final)

### Auth / Session

#### POST `/v1/auth/login`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: ouverture session.
- Request schema: `AuthLoginRequest`
- Response schema: `AuthLoginResponse`
- Events: aucun event obligatoire ajoute dans ce patch.

#### POST `/v1/auth/logout`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: cloture session.
- Request schema: `AuthLogoutRequest` (minimal)
- Response schema: `AuthLogoutResponse` (minimal)
- Events: aucun event obligatoire ajoute dans ce patch.

#### POST `/v1/auth/refresh`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: rotation token.
- Request schema: `AuthRefreshRequest`
- Response schema: `AuthRefreshResponse`

#### POST `/v1/auth/password-reset/request`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: initier reset mot de passe.
- Request schema: `PasswordResetRequestCreate`
- Response schema: `PasswordResetRequestCreated`

#### POST `/v1/auth/password-reset/confirm`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: confirmer reset mot de passe.
- Request schema: `PasswordResetConfirmRequest`
- Response schema: `PasswordResetConfirmResponse`

### Identity / Users / Tenant settings

#### GET `/v1/me`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: profil utilisateur courant.
- Response schema: `MeResponse`

#### GET `/v1/users`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: liste users du tenant.
- Query: `limit`, `cursor`.
- Response schema: `UserListResponse`

#### POST `/v1/users`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: creation user tenant.
- Request schema: `UserCreateRequest`
- Response schema: `UserCreateResponse`
- Events alignes: `UserCreated` existe deja en 2.10 (`...2 10 ...:90`).

#### PATCH `/v1/users/{user_id}`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: edition user.
- Request schema: `UserUpdateRequest`
- Response schema: `UserUpdateResponse`

#### PATCH `/v1/users/{user_id}/status`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: activation/desactivation user.
- Request schema: `UserStatusPatchRequest`
- Response schema: `UserStatusPatchResponse`

#### PATCH `/v1/users/{user_id}/role`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: changement role user.
- Request schema: `UserRolePatchRequest`
- Response schema: `UserRolePatchResponse`
- Events alignes: `UserRoleChanged` existe deja en 2.10 (`...2 10 ...:97`).

#### GET `/v1/tenant-settings`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: lecture settings tenant.
- Response schema: `TenantSettingsResponse`

#### PATCH `/v1/tenant-settings`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: mise a jour settings tenant.
- Request schema: `TenantSettingsPatchRequest`
- Response schema: `TenantSettingsPatchResponse`
- Events alignes: `TenantSettingsUpdated` existe deja en 2.10 (`...2 10 ...:104`).

### Files (generic M9)

#### POST `/v1/files`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: creer fichier logique (upload metadata + reference stockage).
- Request schema: `FileUploadRequest`
- Response schema: `FileUploadResponse`
- Events alignes: `FileUploaded` existe deja en 2.10 (`...2 10 ...:301`).

#### POST `/v1/files/{file_id}:link`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: relier fichier a entite metier.
- Request schema: `FileLinkRequest`
- Response schema: `FileLinkResponse`
- DB alignee: `file_links` existe deja (`...2 9 ...:621`).

### Worker check events (M7bis)

#### POST `/v1/missions/{mission_id}/worker-check-events`
- Statut: PROPOSED (OWNER ARBITRATION REQUIRED)
- But: enregistrer check_in/check_out.
- Request schema: `WorkerCheckEventCreateRequest`
- Response schema: `WorkerCheckEventCreateResponse`
- Events alignes: `WorkerCheckEventRecorded` existe deja (`...2 10 ...:255`).
- DB alignee: `worker_check_events` existe deja (`...2 9 ...:355`).

## Schema stubs (minimal, typed)

### AuthLoginRequest
- `email`: string
- `password`: string

### AuthLoginResponse
- `access_token`: string
- `refresh_token`: string
- `token_type`: string
- `expires_in`: integer

### AuthLogoutRequest
- `refresh_token`: string (nullable)

### AuthLogoutResponse
- `success`: boolean

### AuthRefreshRequest
- `refresh_token`: string

### AuthRefreshResponse
- `access_token`: string
- `refresh_token`: string
- `token_type`: string
- `expires_in`: integer

### PasswordResetRequestCreate
- `email`: string

### PasswordResetRequestCreated
- `status`: string

### PasswordResetConfirmRequest
- `token`: string
- `new_password`: string

### PasswordResetConfirmResponse
- `status`: string

### MeResponse
- `user_id`: uuid
- `tenant_id`: uuid
- `role_type`: string
- `email`: string
- `is_active`: boolean

### UserListItem
- `user_id`: uuid
- `tenant_id`: uuid
- `role_type`: string
- `email`: string
- `is_active`: boolean

### UserListResponse
- `items`: array of `UserListItem`
- `next_cursor`: string (nullable)

### UserCreateRequest
- `email`: string
- `role_type`: string
- `is_active`: boolean

### UserCreateResponse
- `user_id`: uuid
- `tenant_id`: uuid

### UserUpdateRequest
- `email`: string (nullable)
- `language`: string (nullable)

### UserUpdateResponse
- `user_id`: uuid
- `updated_at`: string

### UserStatusPatchRequest
- `is_active`: boolean

### UserStatusPatchResponse
- `user_id`: uuid
- `is_active`: boolean

### UserRolePatchRequest
- `role_type`: string

### UserRolePatchResponse
- `user_id`: uuid
- `role_type`: string

### TenantSettingsResponse
- `tenant_id`: uuid
- `settings`: object

### TenantSettingsPatchRequest
- `settings`: object

### TenantSettingsPatchResponse
- `tenant_id`: uuid
- `settings`: object

### FileUploadRequest
- `storage_provider`: string
- `bucket`: string
- `path`: string
- `filename`: string
- `mime_type`: string
- `size_bytes`: integer
- `sha256_hash`: string

### FileUploadResponse
- `file_id`: uuid
- `tenant_id`: uuid
- `created_at`: string

### FileLinkRequest
- `entity_type`: string
- `entity_id`: uuid
- `purpose`: string

### FileLinkResponse
- `file_link_id`: uuid
- `file_id`: uuid

### WorkerCheckEventCreateRequest
- `worker_id`: uuid
- `event_type`: string (`check_in|check_out`)
- `occurred_at`: string
- `source`: string
- `metadata`: object

### WorkerCheckEventCreateResponse
- `check_event_id`: uuid
- `mission_id`: uuid
- `worker_id`: uuid
- `event_type`: string

## Notes de coherence minimale

- Aucun ajout DB strictement requis dans ce patch:
- `users`, `tenant_settings`, `files`, `file_links`, `worker_check_events` existent deja en 2.9 (`...2 9 ...:61`, `:723`, `:607`, `:621`, `:355`).
- Aucun ajout event strictement requis dans ce patch:
- `UserCreated`, `UserRoleChanged`, `TenantSettingsUpdated`, `FileUploaded`, `WorkerCheckEventRecorded` existent deja en 2.10 (`...2 10 ...:90`, `:97`, `:104`, `:301`, `:255`).
- RBAC V1.2 patch associe requis pour toutes les nouvelles routes (voir doc V1.2 RBAC patch).

## What remains blocked

- Validation owner des options d'arbitrage A/B/C.
- Confirmation des conventions de nommage finales pour auth/session/files/check-events.
- Confirmation granulaire des droits RBAC par role pour les nouvelles routes.

## Mini-changelog

- 2026-02-19: creation patch OpenAPI V1.2 DRAFT (surfaces manquantes + arbitration block), sans modification des contrats LOCKED.
