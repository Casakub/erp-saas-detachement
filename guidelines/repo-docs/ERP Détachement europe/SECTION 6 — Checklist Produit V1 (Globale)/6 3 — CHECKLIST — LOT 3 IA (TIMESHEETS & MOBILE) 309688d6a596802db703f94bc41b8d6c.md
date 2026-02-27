# 6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)

**Statut** : READY
**Version** : 1.3
**Date** : 2026-02-20
**Objectif** : cadrer l'exécution M7.T/M7bis avec anchors contractuels explicites (2.10/2.11/2.12), règles métier par rôle, GWT complets, DoD explicite. Décisions Q3-A (Web Push) et API mobile M7bis V1.2.2 intégrées.

---

## 6.3.1 Scope (SOCLE)

- Module principal: `M7.T` (timesheets).
- Module mobile associé: `M7bis` (worker app PWA).
- Référence plan lots: `SOCLE LOCKED:511-516`.
- PWA: online only V1 (`SOCLE LOCKED:200`). Offline read-only → V2 (`SOCLE LOCKED:201`).

## 6.3.2 OpenAPI anchors (2.11 LOCKED)

- `POST /v1/missions/{mission_id}/timesheets`
- `POST /v1/timesheets/{timesheet_id}/entries`
- `POST /v1/timesheets/{timesheet_id}:submit`
- `POST /v1/timesheets/{timesheet_id}:validate`
- `POST /v1/timesheets/{timesheet_id}:reject`

`operationId`: non spécifié dans le document LOCKED 2.11.

### 6.3.2.a Check-in/check-out mobile (V1.2.1 patch)

- Endpoint unique: `POST /v1/check-events`.
- Switch check-in/out: `event_type = check_in|check_out`.
- V1: sans géolocalisation requise (`SOCLE LOCKED:196`). Géolocalisation optionnelle → V2.

### 6.3.2.b API mobile worker étendue (V1.2.2 patch — décision Q3-A + M7bis)

Endpoints lecture mobile (surfaces worker dédiées — tous `own only`, `tenant-scoped`):

| Endpoint | Description |
| --- | --- |
| `GET /v1/worker/missions` | Liste des missions du worker connecté |
| `GET /v1/worker/missions/{id}` | Détail d'une mission |
| `GET /v1/worker/documents` | Liste documents du worker |
| `GET /v1/worker/missions/{id}/remuneration` | Snapshot rémunération déclarée (lecture, sans calcul légal côté mobile) |
| `GET /v1/worker/push-subscription` | Lecture abonnement Web Push |
| `POST /v1/worker/push-subscription` | Création/mise à jour abonnement Web Push |
| `DELETE /v1/worker/push-subscription` | Suppression abonnement Web Push |

Note: tous les endpoints `/v1/worker/*` sont strictement `worker-scoped + tenant-scoped`. Aucun accès cross-worker ni cross-tenant.

## 6.3.3 Events anchors (LOCKED 2.10)

- `TimesheetCreated`
- `TimesheetEntryAdded`
- `TimesheetSubmitted`
- `TimesheetValidated`
- `TimesheetRejected`
- `TimesheetBillingStatusChanged`
- `WorkerCheckEventRecorded`

## 6.3.4 RBAC anchors (LOCKED 2.12 + V1.2.1/V1.2.2 patches)

| Endpoint | tenant_admin | agency_user | consultant | client_user | worker |
| --- | --- | --- | --- | --- | --- |
| `POST /v1/missions/{id}/timesheets` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /v1/timesheets/{id}/entries` | ✅ | ✅ | ❌ | ❌ | ✅ (own) |
| `POST /v1/timesheets/{id}:submit` | ✅ | ✅ | ❌ | ❌ | ✅ (own) |
| `POST /v1/timesheets/{id}:validate` | ✅ | ✅ | ❌ | ✅ (si double val.) | ❌ |
| `POST /v1/timesheets/{id}:reject` | ✅ | ✅ | ❌ | ✅ (si double val.) | ❌ |
| `POST /v1/check-events` | ✅ | ✅ | ❌ | ❌ | ✅ (own) |
| `GET /v1/worker/missions` | ❌ | ❌ | ❌ | ❌ | ✅ (own) |
| `GET /v1/worker/missions/{id}` | ❌ | ❌ | ❌ | ❌ | ✅ (own) |
| `GET /v1/worker/documents` | ❌ | ❌ | ❌ | ❌ | ✅ (own) |
| `GET /v1/worker/missions/{id}/remuneration` | ❌ | ❌ | ❌ | ❌ | ✅ (own) |
| `GET/POST/DELETE /v1/worker/push-subscription` | ❌ | ❌ | ❌ | ❌ | ✅ (own) |

Règle transverse: `worker` ne valide/rejette jamais un timesheet. `consultant` n'a aucun accès aux mutations timesheets.

## 6.3.5 Règles métier V1 (par flux)

### Flux Timesheet

- Modèle: daily entries + soumission hebdomadaire.
- Statuts: `draft → submitted → validated | rejected`.
- Un timesheet `rejected` peut être re-soumis (nouveau `TimesheetSubmitted`).
- Gating validation: `can_validate_timesheets=false` → 422 avec `blocking_reasons` (enforcement M8).
- Double validation (option): si activée, `client_user` valide en premier, puis `agency_user`/`tenant_admin` confirme.
- Billing status: mis à jour par M10 au moment de la facturation (`PATCH /v1/timesheets/{id}/billing-status`). Déclenche `TimesheetBillingStatusChanged`.

### Flux Check-in/Check-out

- `worker` enregistre son check-in/check-out sur ses propres missions uniquement.
- Chaque check-event écrit dans `worker_check_events`, publie `WorkerCheckEventRecorded`.
- Données optionnelles V1: `notes`, `occurred_at` (si différent de `now()`). Pas de coordonnées GPS V1.

### Flux Web Push (décision Q3-A — Web Push API native)

- Mécanisme: Web Push API native (VAPID). Pas de dépendance FCM.
- Worker s'abonne via `POST /v1/worker/push-subscription` (payload: `endpoint`, `p256dh`, `auth`).
- Abonnement stocké dans `worker_push_subscriptions` (table 2.9.16-C, un enregistrement par worker).
- Le serveur pousse des notifications via l'abonnement VAPID lors des events métier pertinents (ex: timesheet rejeté, mission activée).
- `DELETE /v1/worker/push-subscription`: suppression propre (désabonnement).
- No-code peut déclencher le push via webhook consommateur (no-code consomme l'event, backend envoie le push).

### Flux Rémunération mobile (lecture seule)

- `GET /v1/worker/missions/{id}/remuneration`: expose le snapshot rémunération déclarée et les indemnités déclarées.
- **Aucun calcul légal côté mobile** — backend décide, mobile lit uniquement (`SOCLE LOCKED:207`).
- Données exposées: `base_salary`, `allowances[]`, `currency`, `period` — sans `legal_minimum_amount` ni `is_compliant` (ces champs restent internes).

## 6.3.6 Acceptance Tests (GWT)

**Timesheets:**

**Given** `worker` sur sa mission → **When** `POST /v1/timesheets/{id}/entries` → **Then** 201, `TimesheetEntryAdded` publié.

**Given** `worker` soumet le timesheet → **When** `POST /v1/timesheets/{id}:submit` → **Then** statut passe à `submitted`, `TimesheetSubmitted` publié, validateurs notifiés.

**Given** `can_validate_timesheets=false` → **When** `POST /v1/timesheets/{id}:validate` → **Then** 422 `timesheet_validation_blocked` + `blocking_reasons`.

**Given** timesheet validée → **Then** `TimesheetValidated` publié, M10 notifié pour facturation.

**Given** timesheet rejetée → **Then** `TimesheetRejected` publié, worker notifié, re-soumission possible.

**Given** cross-tenant sur timesheet → **Then** 403/404.

**Check-in/Check-out:**

**Given** `worker` sur sa mission → **When** `POST /v1/check-events` `{ event_type: "check_in" }` → **Then** 2xx, `WorkerCheckEventRecorded` publié.

**Given** `worker` sur mission hors scope → **When** `POST /v1/check-events` → **Then** 403 (ownership check).

**Given** `agency_user` → **When** `POST /v1/check-events` `{ event_type: "check_out" }` → **Then** 2xx, event publié.

**API Mobile:**

**Given** `worker` connecté → **When** `GET /v1/worker/missions` → **Then** 200, liste de ses missions uniquement.

**Given** `worker` → **When** `GET /v1/worker/missions/{id}/remuneration` → **Then** 200, snapshot rémunération sans `legal_minimum_amount`.

**Given** `agency_user` → **When** `GET /v1/worker/missions` → **Then** 403 (endpoint worker-scoped uniquement).

**Web Push:**

**Given** `worker` enregistre un abonnement → **When** `POST /v1/worker/push-subscription` avec payload VAPID valide → **Then** 201, abonnement stocké.

**Given** notification push déclenchée (ex: `TimesheetRejected`) → **Then** push reçu sur le device du worker.

**Given** `worker` se désabonne → **When** `DELETE /v1/worker/push-subscription` → **Then** 204, abonnement supprimé.

## 6.3.7 Décisions structurantes (LOCKED)

- [x] Modèle temps: Daily entries + soumission hebdomadaire.
- [x] Validation: double validation optionnelle (Client + Agence selon RBAC).
- [x] Mobile: PWA online only V1. Offline read-only → V2.
- [x] Check-in/out: sans géolocalisation V1. Géolocalisation optionnelle → V2.
- [x] Push: Web Push API native VAPID (pas de FCM) — décision Q3-A.
- [x] Rémunération mobile: lecture snapshot déclaré uniquement, sans calcul légal — backend décide.

## 6.3.8 Interdictions strictes

- [ ] Aucune logique de rémunération ni calcul de paie dans ce lot.
- [ ] Aucune décision de conformité.
- [ ] Aucune logique critique côté mobile (backend décide toujours).
- [ ] Aucun offline complexe (V1: online only).
- [ ] Pas de géolocalisation dans le check-in/out V1.
- [ ] Pas de `legal_minimum_amount` ni `is_compliant` exposés via API mobile.

## 6.3.9 Definition of Done (Lot 3)

Le Lot 3 est DONE si et seulement si :

- [ ] Endpoints timesheets LOCKED implémentés (`POST missions/{id}/timesheets`, `POST entries`, `:submit`, `:validate`, `:reject`)
- [ ] Endpoint check-events V1.2.1 implémenté (ownership check worker)
- [ ] API mobile worker V1.2.2 implémentée (`/v1/worker/*` endpoints — 7 surfaces)
- [ ] Table `worker_push_subscriptions` migrée (2.9.16-C)
- [ ] Web Push VAPID: serveur envoie push sur events pertinents
- [ ] Gating validation timesheets: `can_validate_timesheets=false` → 422 + blocking_reasons
- [ ] Events publiés via outbox: `TimesheetCreated`, `TimesheetEntryAdded`, `TimesheetSubmitted`, `TimesheetValidated`, `TimesheetRejected`, `WorkerCheckEventRecorded`, `TimesheetBillingStatusChanged`
- [ ] RBAC par endpoint validé (unit tests par rôle)
- [ ] `worker` scoped: own only sur entries/submit/check-events/API mobile
- [ ] Multi-tenant isolation testée
- [ ] Tests: unit + integration + RBAC + multi-tenant
- [ ] Audit logs sur toutes les mutations

## 6.3.10 Impact & Changelog (docs-only)

- Anchors OpenAPI/Events/RBAC explicités (v1.2).
- Check-in/check-out API couvert par patch V1.2.1.
- Décision Q3-A intégrée: Web Push API native VAPID, `worker_push_subscriptions`, endpoints `/v1/worker/push-subscription`.
- API mobile M7bis V1.2.2 intégrée: 7 surfaces `/v1/worker/*`.
- Rémunération mobile: lecture snapshot only, sans calcul légal.
- Aucun endpoint/event/permission ajouté hors contrats (LOCKED + patches V1.2.1/V1.2.2).

## Changelog doc

- 2026-02-18: alignement référentiel Lot 3 sur modules canoniques (M7.T, M7bis) et events 2.10, sans changement métier.
- 2026-02-19: patch P0 executable-spec (anchors + GWT dérivés + contract gap check-in/out), sans changement métier.
- 2026-02-19: réalignement V1.2.1 (check-events couvert OpenAPI/RBAC + GWT check-in/out), docs-only.
- 2026-02-20: v1.3 — règles métier par flux, RBAC table complète, GWT complets, DoD explicite, Web Push Q3-A, API mobile M7bis V1.2.2 intégrées.
