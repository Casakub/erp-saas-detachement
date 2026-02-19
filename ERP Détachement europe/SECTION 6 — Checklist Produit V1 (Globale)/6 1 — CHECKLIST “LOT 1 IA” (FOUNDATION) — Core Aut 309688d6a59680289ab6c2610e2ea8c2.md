# 6.1 — CHECKLIST “LOT 1 IA” (FOUNDATION) — Core/Auth/RBAC/Audit + Events Outbox

**Statut** : PARTIAL
**Version** : 1.0
**Date** : 2026-02-15
**Objectif** : livrer un socle exécutable et testable pour que les lots suivants puissent s’enchaîner sans chaos.

---

> 🔗 **Rappel**
Le Lot 1 n’est considéré comme terminé **que si** :
> 
> - cette checklist est validée **ET**
> - la [**SECTION 5 — “DEFINITION OF DONE” GLOBAL (DoD)**
> ](../SECTION%205%20%E2%80%94%20%E2%80%9CDEFINITION%20OF%20DONE%E2%80%9D%20GLOBAL%20(DoD)%20308688d6a596807789b6f97e7433f4fd.md)  est intégralement respectée.

## 2.13.1 Périmètre exact du Lot 1 (LOCKED)

**Modules concernés**

- **M1 — Identity & Access (Core)** : Auth, multi-tenant, RBAC/ABAC, sessions, users
- **Audit trail** : `audit_logs` immuables + journalisation systématique
- **Events Outbox** : `events_outbox` + publisher + retries
- **Tenant settings** : `tenant_settings` (feature flags / config tenant)

**Non-inclus (Lot 2+)**

- CRM / Clients / RFP
- Missions / Timesheets / Finance
- Compliance engine
- Marketplace / Risk / Certification

---

## 2.13.2 Livrables obligatoires (à déposer dans Notion + repo)

### 2.13.2.1 Document “PRD — Lot 1”

Doit contenir :

- Objectifs / Non-objectifs
- Parcours (login, gestion users, roles, tenant isolation)
- Edge cases (user désactivé, changement rôle, token expiré)
- Règles de sécurité (RLS, 403, audit, rate limit)

### 2.13.2.2 Migrations DB (Supabase/Postgres)

Doit inclure (si pas déjà présent) :

- `tenants`
- `users`
- (option) `roles`, `permissions`, `role_permissions`, `user_roles`
- `audit_logs` (IMMUTABLE)
- `tenant_settings` (unique tenant_id)
- `events_outbox`
- `notification_events` (trace orchestration)

### 2.13.2.3 OpenAPI — Core V1 (extrait 2.11)

OpenAPI 2.11 ne contient pas d'endpoints Core/Auth/Users/Tenant settings.

- Vérification: `2.11` expose les parcours mission/compliance/timesheets/finance/CRM (`...2 11...md:34`, `...2 11...md:422`, `...2 11...md:553`, `...2 11...md:749`) et aucune entrée `/v1/auth`, `/v1/users`, `/v1/me`, `/v1/tenant-settings`.
- `operationId`: non spécifié dans le document LOCKED 2.11.

### 2.13.2.3.a CONTRACT GAP — endpoints Core non présents dans 2.11 (STOP)

Ces endpoints sont hors contrat OpenAPI V1 actuel et doivent rester en attente d'arbitrage contractuel:

- `POST /v1/auth/login`
- `POST /v1/auth/logout`
- `POST /v1/auth/refresh`
- `POST /v1/auth/password-reset/request`
- `POST /v1/auth/password-reset/confirm`
- `GET /v1/me`
- `GET /v1/users`
- `POST /v1/users`
- `PATCH /v1/users/{id}`
- `PATCH /v1/users/{id}/status`
- `PATCH /v1/users/{id}/role`
- `GET /v1/tenant-settings`
- `PATCH /v1/tenant-settings`

### 2.13.2.4 Tests (OBLIGATOIRES)

- Unit tests (services auth + RBAC)
- Integration tests (endpoints core)
- **RBAC tests** (matrice 2.12)
- **Multi-tenant isolation tests** (tentative cross-tenant ⇒ 403/404)
- Audit log tests (toute mutation ⇒ 1 log immuable)
- Outbox tests (toute mutation ⇒ event écrit si prévu)

### 2.13.2.5 Notes d’impact + Changelog

- migrations ajoutées
- endpoints ajoutés
- breaking changes (si existants)
- mapping “endpoint → event”

---

## 2.13.3 Backlog technique (ordre de build recommandé)

### 2.13.3.1 Setup repo & conventions (Day 0)

- [ ]  Monorepo ou structure “modules” conforme à 2.2 (1 IA = 1 module)
- [ ]  Lint/format (TS + eslint/prettier) + commit conventions
- [ ]  Env templates (.env.example)
- [ ]  CI minimal : tests + typecheck + migrations check

### 2.13.3.2 Auth (Day 1)

- [ ]  Implémenter login/logout/refresh
- [ ]  Sessions / token rotation (si supporté)
- [ ]  Rate-limit login (anti brute force)
- [ ]  Blocage user `is_active=false` (401/403) + audit

### 2.13.3.3 Multi-tenant hardening (Day 1-2)

- [ ]  `tenant_id` partout dans tables métiers core
- [ ]  RLS policies (si Supabase) : `tenant_id == auth.tenant_id`
- [ ]  Test cross-tenant : lecture/écriture interdites
- [ ]  Index `tenant_id` sur toutes les tables core

### 2.13.3.4 RBAC (Day 2)

- [ ]  Implémenter rôles officiels V1 (2.12.1)
- [ ]  Middleware/guard RBAC (403)
- [ ]  “Scoped access” (consultant: lecture limitée aux objets attribués) — **stub V1** (préparer sans implémenter métiers)
- [ ]  Tests RBAC unit + integration

### 2.13.3.5 Audit logs (Day 2-3)

- [ ]  Writer central `audit.log(action, entity_type, entity_id, metadata)`
- [ ]  Immutable : pas de UPDATE/DELETE autorisé sur `audit_logs`
- [ ]  Chaque mutation endpoint core ⇒ 1 log
- [ ]  Logs contiennent : actor_user_id, ip, user_agent, metadata

### 2.13.3.6 Events outbox (Day 3)

- [ ]  Helper `outbox.publish(event_type, entity_type, entity_id, payload)`
- [ ]  Envelope standard (2.10.2.2) : event_id, schema_version, occurred_at, tenant_id, actor_user_id, correlation_id, entity, data, + producer/source
- [ ]  Status `pending/sent/failed` + retries + last_error
- [ ]  Worker “dispatcher” (cron/job) qui envoie vers consommateurs (no-code/webhook) **sans logique métier**
- [ ]  Tests : publish + idempotence + retry

### 2.13.3.7 Tenant settings (Day 3)

- [ ]  CRUD minimal : GET/PATCH tenant settings
- [ ]  Validation JSON schema (feature flags)
- [ ]  Audit + outbox `TenantSettingsUpdated`

---

## 2.13.4 Events minimum du Lot 1 (à publier)

- `UserCreated`
- `UserRoleChanged`
- `TenantSettingsUpdated`

(Optionnel V1) :

- `UserDeactivated`
- `UserActivated`

---

## 2.13.5 Definition of Done (DoD) — Lot 1

Le lot 1 est **DONE** si et seulement si :

- [ ]  Tous les endpoints core listés existent et passent les tests
- [ ]  RBAC 2.12 appliqué (au moins sur endpoints core)
- [ ]  Multi-tenant isolation testée (cross-tenant = 403/404)
- [ ]  Toute mutation core génère :
    - [ ]  1 `audit_logs` immuable
    - [ ]  1 event `events_outbox` si prévu
- [ ]  CI passe (tests + typecheck)
- [ ]  Documentation PRD + OpenAPI + Changelog déposés dans Notion

---

## 2.13.6 Instructions “IA contributrice” (anti-chaos)

- Une IA ne modifie **que** M1 + composants transverses listés (audit/outbox/settings)
- Tout besoin de champ/table hors scope ⇒ STOP + demande de validation
- Aucun code no-code : seulement des hooks de consommation (webhook) documentés
- Les données sont tenantées et testées, sinon PR refusée

---

## 2.13.7 Events anchors (2.10)

- `UserCreated` (`...2 10 EVENTS...md:90`)
- `UserRoleChanged` (`...2 10 EVENTS...md:97`)
- `TenantSettingsUpdated` (`...2 10 EVENTS...md:104`)

## 2.13.8 RBAC anchors (2.12)

- Rôles officiels: `tenant_admin`, `agency_user`, `consultant`, `client_user`, `worker`, `system` (`...2 12...md:21-26`).
- Principes de sécurité: tenant-scoped, `client_user`/`worker` en lecture limitée, décisions critiques jamais côté `client_user`/`worker` (`...2 12...md:32-35`).
- CONTRACT GAP: 2.12 ne contient pas de matrice endpoint explicite pour `/v1/auth*`, `/v1/users*`, `/v1/tenant-settings*` (aligné au gap OpenAPI ci-dessus).

Résumé dérivé (sans nouvelle règle):
- Allowed (cadre général): acteurs internes du tenant (`tenant_admin`, `agency_user`) selon matrice officielle.
- Forbidden: `client_user` et `worker` pour décisions critiques (`...2 12...md:34`, `...2 12...md:180`).

## 2.13.9 Acceptance Tests (GWT) — Derived

- Référence centrale: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`.
- Given un acteur du tenant B et une ressource du tenant A, When une action mutante est tentée, Then l'accès cross-tenant est refusé (`SECTION 10.E:39-40`, `SECTION 10.E:83-84`).
- Given une action critique, When l'acteur est `client_user` ou `worker`, Then l'action est refusée (`SECTION 10.E:34-35`, `SECTION 10.E:100`).
- TODO: CONTRACT GAP — scénarios GWT auth/users/tenant-settings absents de `SECTION 10.E`.

## 2.13.10 Impact & Changelog (docs-only)

- Impact: alignement explicite Lot 1 avec les contrats LOCKED 2.10/2.11/2.12.
- Aucun endpoint/event/permission nouveau ajouté.
- Contract gap Core OpenAPI/RBAC rendu explicite pour arbitrage.

## Changelog doc

- 2026-02-19: patch P0 executable-spec (contract gap OpenAPI/RBAC M1, anchors events/RBAC, GWT dérivés), sans changement métier.

---

FIN — LOT 1 IA
