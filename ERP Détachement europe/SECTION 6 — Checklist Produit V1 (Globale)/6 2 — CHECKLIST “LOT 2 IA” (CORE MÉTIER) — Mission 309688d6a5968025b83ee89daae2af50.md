# 6.2 — CHECKLIST “LOT 2 IA” (CORE MÉTIER) — Missions + Compliance Case + Enforcement

**Statut** : PARTIAL
**Version** : 1.0
**Date** : 2026-02-15
**Objectif** : livrer le cœur RegTech opérationnel (mission → compliance case → requirements → A1 tracking → enforcement flags), testable et “inspection-ready”.

> 🔗 **Documents de référence (contrats amont)**
> 
> - **2.11 — OpenAPI V1 (Parcours MVP) -**
>     
>     ➜ Spécification contractuelle des endpoints utilisés dans le Lot 2
>     
>     [2.11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2](../SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%2011%20%E2%80%94%20OPENAPI%20V1%20(PARCOURS%20MVP)%20%E2%80%94%201%20%E2%86%92%203%20%E2%86%92%202%20308688d6a596801dad76e1c4a1a96c02.md)
>     
> - **2.10 — Events métier V1**
>     
>     ➜ Catalogue des events, règles de publication et contraintes outbox
>     
>     [2.10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-friendly)](../SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%2010%20EVENTS%20M%C3%89TIER%20V1%20(Event-driven,%20Outbox,%20IA-fr%20308688d6a596802bad05fb3834118422.md)
>     
> 
> ⚠️ Toute implémentation du Lot 2 doit être **strictement conforme** à ces documents.
> Toute divergence ⇒ **STOP + validation préalable**.
> 

---

## 2.14.1 Périmètre exact du Lot 2 (LOCKED)

**Modules concernés**

- **M7 — Missions & Timesheets (partiel Lot 2)** : missions (CRUD minimal + status), read-model enforcement
- **M8 — Compliance Case (V1 assisté)** : création case, requirements, A1 tracking, enforcement:evaluate
- **M9 — Vault (partiel Lot 2)** : upload fichier + file_links + accès (min)
- **Transverses** : audit_logs + events_outbox (déjà Lot 1), RBAC appliqué (2.12)

**Non-inclus (Lot 3+)**

- CRM/Clients/RFP
- ATS/Candidates parsing
- Engine rémunération complet + salary grids (préparé seulement)
- Devis/Factures/Paiements (Lot 4/6)

---

## 2.14.2 Livrables obligatoires (à déposer dans Notion + repo)

### 2.14.2.1 PRD — Lot 2 (obligatoire)

Doit contenir :

- Parcours “happy path” : MissionCreated → ComplianceCaseCreated → RequirementsInitialize → A1 tracking → Enforcement OK
- Parcours “blocked” : A1 manquant → enforcement bloque activation mission
- Cas “warning” : requirements incomplets mais non bloquants (si tu actives ce mode)
- Règles V1 assistées (pas d’auto SIPSI / pas d’auto A1)
- RBAC : qui lit / qui écrit (aligné 2.12)
- Audit & preuve : quelles mutations logguées + quels events émis

### 2.14.2.2 Migrations DB (si manquantes)

Tables minimum :

- `missions`
- `compliance_cases` (1 mission = 1 case, unique mission_id)
- `compliance_requirements`
- `a1_requests`
- `mission_enforcement_flags`
- `files`, `file_links`, `file_access_logs`
- (option) `country_rulesets` (stub versionné, règles en json)

### 2.14.2.3 OpenAPI — Lot 2 (extrait 2.11.1)

Endpoints minimum :

- `POST /v1/missions`
- `PATCH /v1/missions/{mission_id}/status`
- `GET /v1/missions/{mission_id}`
- `GET /v1/missions/{mission_id}/compliance-case`
- `POST /v1/missions/{mission_id}/compliance-case/requirements/initialize`
- `GET /v1/compliance-cases/{compliance_case_id}/requirements`
- `PATCH /v1/requirements/{requirement_id}/status`
- `POST /v1/compliance-cases/{compliance_case_id}/a1-requests`
- `PATCH /v1/a1-requests/{a1_request_id}/status`
- `GET /v1/missions/{mission_id}/enforcement`
- `POST /v1/missions/{mission_id}/enforcement:evaluate`

`operationId`: non spécifié dans le document LOCKED 2.11.

### 2.14.2.3.a CONTRACT GAP — Vault API

- `POST /v1/files` n'existe pas dans 2.11 LOCKED.
- Scope dérivé: M9 upload API reste hors contrat OpenAPI V1 actuel (STOP jusqu'à arbitrage).

### 2.14.2.4 Tests (OBLIGATOIRES)

- Unit tests services M7/M8
- Integration tests endpoints ci-dessus
- RBAC tests (2.12) sur :
    - mission create/status
    - requirement status
    - A1 status
    - enforcement:evaluate (admin only)
- Multi-tenant isolation : cross-tenant = 403/404
- Audit logs : toute mutation = 1 entrée immuable
- Outbox events : events clés présents (voir 2.14.4)

### 2.14.2.5 Changelog + mapping API→Events

- liste endpoints livrés
- liste events émis
- “breaking changes” (si existants)

---

## 2.14.3 Backlog technique (ordre de build recommandé)

### 2.14.3.1 Missions (M7) — CRUD minimal + status gating

- [ ]  POST /missions (planned par défaut)
- [ ]  GET /missions/{id} (inclut enforcement summary)
- [ ]  PATCH /missions/{id}/status
- [ ]  Gating activation planned→active :
    - [ ]  refuser si enforcement.can_activate_mission = false (422) + raisons
- [ ]  Audit logs sur create + status change
- [ ]  Events outbox : `MissionCreated`, `MissionStatusChanged`

### 2.14.3.2 Compliance Case (M8) — auto-création sur MissionCreated

- [ ]  À la création mission : créer `compliance_cases` (1:1)
- [ ]  GET /missions/{id}/compliance-case
- [ ]  Initialiser requirements :
    - [ ]  endpoint `requirements/initialize`
    - [ ]  stub ruleset : base FR host + origin (PT/RO/PL)
    - [ ]  créer N requirements (A1_REQUIRED, ID_DOC, CONTRACT, HOST_REPRESENTATIVE, etc.)
- [ ]  Events :
    - [ ]  `ComplianceCaseCreated`
    - [ ]  `ComplianceRequirementCreated` (batch ou unitaire)

### 2.14.3.3 Requirements lifecycle (M8)

- [ ]  GET requirements par case
- [ ]  PATCH requirement status (provided/approved/rejected)
- [ ]  À chaque changement :
    - [ ]  Audit
    - [ ]  `ComplianceRequirementStatusChanged`
    - [ ]  déclencher enforcement:evaluate (sync ou job)

### 2.14.3.4 A1 tracking assisté (M8)

- [ ]  POST a1_requests (création)
- [ ]  PATCH a1_request status + dates + file_id
- [ ]  À chaque changement :
    - [ ]  Audit
    - [ ]  `A1StatusUpdated`
    - [ ]  enforcement:evaluate

### 2.14.3.5 Vault minimal (M9 partiel)

- [ ]  POST /files (upload) + sha256 + metadata
- [ ]  file_links : relier le fichier à (worker|mission|compliance_case|a1_request|client_document)
- [ ]  file_access_logs : view/download
- [ ]  Audit logs + event `FileUploaded`

### 2.14.3.6 Enforcement engine (M8) — V1 “rules-based”

- [ ]  Table `mission_enforcement_flags` + endpoint GET
- [ ]  POST enforcement:evaluate (admin/system)
- [ ]  Règles V1 non négociables (hard blocks) :
    - [ ]  A1 requis manquant (si origin != host)
    - [ ]  requirement critique rejeté/expiré
    - [ ]  (stub) cumul durée > 365j → warning ou blocked selon config
- [ ]  Output :
    - can_activate_mission
    - can_validate_timesheets (préparer, même si timesheets Lot 3/4)
    - can_issue_invoice (préparer, Lot 6)
    - blocking_reasons (liste stable i18n_key)
- [ ]  Event : `MissionEnforcementEvaluated` (uniquement si flags changent)

---

## 2.14.4 Events minimum du Lot 2 (à publier)

- `MissionCreated`
- `MissionStatusChanged`
- `ComplianceCaseCreated`
- `ComplianceRequirementCreated`
- `ComplianceRequirementStatusChanged`
- `A1StatusUpdated`
- `FileUploaded`
- `MissionEnforcementEvaluated`

---

## 2.14.5 Definition of Done (DoD) — Lot 2

Le lot 2 est **DONE** si et seulement si :

- [ ]  Le parcours complet fonctionne :
    - [ ]  créer mission → case auto créée → requirements init → A1 status update → enforcement flags OK
- [ ]  Activation mission est bloquée si enforcement.can_activate_mission = false (422 + raisons)
- [ ]  RBAC 2.12 respecté sur tous endpoints du lot
- [ ]  Multi-tenant isolation testée (cross-tenant = 403/404)
- [ ]  Toute mutation ⇒ `audit_logs` + event outbox (si prévu)
- [ ]  CI passe (tests + typecheck)
- [ ]  PRD + OpenAPI + Changelog déposés dans Notion
- [ ]  Respect intégral de la **SECTION 5 — Definition of Done GLOBAL (DoD)**

---

## 2.14.6 Instructions “IA contributrice” (anti-chaos)

- L’IA du Lot 2 n’a le droit de modifier que :
    - M7 (missions uniquement)
    - M8 (compliance + enforcement)
    - M9 (vault minimal)
- Toute nécessité de modifier M1 (auth/RBAC) ⇒ STOP + validation
- Aucune logique pays codée en dur : uniquement ruleset stub versionné (json)
- Aucun calcul rémunération dans Lot 2 (préparer des champs, pas plus)

---

## 2.14.7 OpenAPI anchors (2.11)

- `POST /v1/missions` (`...2 11...md:34`)
- `PATCH /v1/missions/{mission_id}/status` (`...2 11...md:69`)
- `GET /v1/missions/{mission_id}` (`...2 11...md:104`)
- `GET /v1/missions/{mission_id}/compliance-case` (`...2 11...md:143`)
- `POST /v1/missions/{mission_id}/compliance-case/requirements/initialize` (`...2 11...md:172`)
- `GET /v1/compliance-cases/{compliance_case_id}/requirements` (`...2 11...md:196`)
- `PATCH /v1/requirements/{requirement_id}/status` (`...2 11...md:225`)
- `POST /v1/compliance-cases/{compliance_case_id}/a1-requests` (`...2 11...md:252`)
- `PATCH /v1/a1-requests/{a1_request_id}/status` (`...2 11...md:275`)
- `GET /v1/missions/{mission_id}/enforcement` (`...2 11...md:371`)
- `POST /v1/missions/{mission_id}/enforcement:evaluate` (`...2 11...md:398`)

## 2.14.8 Events anchors (2.10)

- `MissionCreated` (`...2 10 EVENTS...md:241`)
- `MissionStatusChanged` (`...2 10 EVENTS...md:248`)
- `ComplianceCaseCreated` (`...2 10 EVENTS...md:319`)
- `ComplianceRequirementCreated` (`...2 10 EVENTS...md:327`)
- `ComplianceRequirementStatusChanged` (`...2 10 EVENTS...md:334`)
- `A1StatusUpdated` (`...2 10 EVENTS...md:341`)
- `MissionEnforcementEvaluated` (`...2 10 EVENTS...md:362`)
- `FileUploaded` (`...2 10 EVENTS...md:301`) — event présent, endpoint `/v1/files` absent en 2.11 (contract gap ci-dessus).

## 2.14.9 RBAC anchors (2.12)

- Missions: `POST /missions`, `PATCH /missions/{id}/status`, `GET /missions/{id}` (`...2 12...md:47-49`).
- Compliance: `GET /missions/{id}/compliance-case`, `POST /missions/{id}/compliance-case/requirements/initialize`, `GET /compliance-cases/{id}/requirements`, `PATCH /requirements/{id}/status` (`...2 12...md:57-60`).
- A1: `POST /compliance-cases/{id}/a1-requests`, `PATCH /a1-requests/{id}/status` (`...2 12...md:68-69`).
- Enforcement: `GET /missions/{id}/enforcement`, `POST /missions/{id}/enforcement:evaluate` (`...2 12...md:86-87`).

Résumé dérivé (sans nouvelle règle):
- Allowed: `tenant_admin`, `agency_user` sur mutations mission/compliance/A1; `consultant` limité en lecture/scoped selon matrice.
- Forbidden: `client_user` et `worker` sur décisions critiques et écritures conformité (`...2 12...md:34`, `...2 12...md:180`).

## 2.14.10 Acceptance Tests (GWT) — Derived

- Référence centrale: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`.
- Given une mission avec `can_validate_timesheets=false`, When `POST /v1/timesheets/{timesheet_id}:validate`, Then retour `422` avec `blocking_reasons` (`SECTION 10.E:65-73`).
- Given une mission avec `can_issue_invoice=false`, When `POST /v1/invoices:from-timesheet` ou `POST /v1/invoices/{invoice_id}:issue`, Then retour `422 invoice_issuance_blocked` (`SECTION 10.E:88-95`).
- Given tenant B sur ressource tenant A, When lecture/écriture mission/compliance, Then isolation multi-tenant stricte (`SECTION 10.E:39-40`, `SECTION 10.E:83-84`, `SECTION 10.E:105-106`).

## 2.14.11 Impact & Changelog (docs-only)

- Impact: ancrages OpenAPI/Events/RBAC explicites ajoutés.
- Contract gap documenté: endpoint `/v1/files` absent en 2.11 LOCKED.
- Aucun changement de logique métier ni de contrat LOCKED.

## Changelog doc

- 2026-02-19: patch P0 executable-spec (anchors OpenAPI/Events/RBAC, GWT dérivés, contract gap Vault API explicité), sans changement métier.

FIN — LOT 2 IA
