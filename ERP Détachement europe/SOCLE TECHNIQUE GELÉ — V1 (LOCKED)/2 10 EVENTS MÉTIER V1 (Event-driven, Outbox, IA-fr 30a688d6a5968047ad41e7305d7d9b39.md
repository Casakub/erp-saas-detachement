# 2.10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-friendly)

- **Statut : LOCKED**
- **Version : 1.1**
- **Dernière mise à jour : 2026-02-15**
- **Règle : tout changement events ⇒ update OpenAPI + update DB (si impact) + update RBAC + changelog**

## 2.10.1 Objectif & principes

Les events métier servent à :

- découpler les modules (1 IA = 1 module)
- alimenter notifications / no-code / analytics **sans** mettre de logique critique hors backend
- garantir traçabilité (audit, inspection-ready)

**Règles non négociables**

- Source de vérité = backend (DB + services).
- No-code **consomme** des events, mais **ne décide jamais** (pas de scoring/enforcement/règles pays).
- Tous les events passent par `events_outbox` (fiabilité + retries + audit).
- Chaque event a un `schema_version` et un `event_id` (idempotence).

---

## 2.10.2 Contrat technique (format standard V1)

### 2.10.2.1 Table outbox (rappel)

`events_outbox`:

- `id` (event_id)
- `tenant_id`
- `event_type`
- `entity_type`
- `entity_id`
- `payload` (json)
- `status` (pending/sent/failed)
- `retries`, `last_error`
- `created_at`, `sent_at`

### 2.10.2.2 Envelope (payload commun)

Tous les payloads d’events incluent au minimum :

- `event_id` (uuid)
- `schema_version` (string ex: "1.0")
- `occurred_at` (ISO datetime)
- `tenant_id` (uuid)
- `actor_user_id` (uuid|null)
- `correlation_id` (uuid|string|null) *(ex: même flow RFP→Mission→Compliance)*
- `entity`:
    - `type` (string)
    - `id` (uuid)
- `data` (objet spécifique à l’event)
- `event_type` (string)
- `producer` (string, ex: “M8”)
- `source` (string: “web”|“pwa”|“no_code”|“system”)

### 2.10.2.3 Idempotence (obligatoire)

- Les consommateurs doivent ignorer un event déjà traité (clé: `event_id`).
- Les side-effects (email, pdf, webhook) doivent écrire un log (ex: `notification_events`) incluant `event_id`.

---

## 2.10.3 Classification des events

### A) Domain Events (critiques)

Déclenchent des actions produit (backend) ou des orchestrations (no-code) **sans décisions**.

### B) Compliance Events (critiques + audit)

Doivent être conservés/traçables car liés à inspection-ready.

### C) Finance Events (critiques)

Peuvent déclencher envoi facture, relance, export.

### D) Observability Events (non critiques)

Pour analytics/monitoring, sans impact métier direct.

---

## 2.10.4 Catalogue des Events V1 (source de vérité)

## 2.10.4.1 Core / Identity (M1)

### UserCreated

- **Producer**: M1
- **Entity**: user
- **Consumers**: no-code (welcome), analytics
- **Data**: `{ "user_id": "...", "role_type": "...", "email": "...", "language": "fr" }`

### UserRoleChanged

- **Producer**: M1
- **Entity**: user
- **Consumers**: cache permissions (si existant), analytics
- **Data**: `{ "user_id": "...", "old_roles": [...], "new_roles": [...] }`

### TenantSettingsUpdated

- **Producer**: M1
- **Entity**: tenant_settings
- **Consumers**: front flags refresh, no-code (routing langue), analytics
- **Data**: `{ "changed_keys": ["modules.marketplace.enabled", "..."] }`

---

## 2.10.4.2 CRM / Clients (M2-M3)

### LeadCreated

- **Producer**: M2
- **Entity**: lead
- **Consumers**: no-code (notify owner), analytics
- **Data**: `{ "lead_id": "...", "owner_user_id": "...", "company_name": "...", "country": "...", "sector": "...", "corridor_target": "PL->FR" }`

### LeadStatusChanged

- **Producer**: M2
- **Entity**: lead
- **Consumers**: no-code (relances), analytics
- **Data**: `{ "lead_id": "...", "from": "new", "to": "qualified" }`

### ClientCreated

- **Producer**: M3
- **Entity**: client
- **Consumers**: no-code (onboarding docs vigilance), analytics
- **Data**: `{ "client_id": "...", "name": "...", "default_language": "fr" }`

### ClientSiteCreated

- **Producer**: M3
- **Entity**: client_site
- **Consumers**: no-code (initialisation vigilance/site), analytics
- **Data**: `{ "client_id": "...", "site_id": "...", "site_name": "...", "country_code": "FR|PT|RO|PL" }`

### ClientDocumentStatusChanged

- **Producer**: M3
- **Entity**: client_document
- **Consumers**: no-code (alert expiring), compliance dashboard
- **Data**: `{ "client_id": "...", "doc_type": "kbis", "from": "valid", "to": "expiring", "valid_to": "YYYY-MM-DD" }`

---

## 2.10.4.3 RFP Interne (M4)

### RfpCreated

- **Producer**: M4
- **Entity**: rfp_request
- **Consumers**: no-code (notif internes), analytics
- **Data**: `{ "rfp_id": "...", "client_id": "...", "corridor_origin_country": "PL", "corridor_host_country": "FR", "sector": "...", "job_title": "...", "headcount": 5 }`

### RfpPublished

- **Producer**: M4
- **Entity**: rfp_request
- **Consumers**: no-code (send invites), analytics
- **Data**: `{ "rfp_id": "...", "invite_count": 12 }`

### RfpInviteCreated

- **Producer**: M4
- **Entity**: rfp_invite
- **Consumers**: no-code (notify agences invitées), analytics
- **Data**: `{ "rfp_id": "...", "agency_tenant_id": "...", "invite_status": "pending|sent" }`

### RfpResponseSubmitted

- **Producer**: M4
- **Entity**: rfp_response
- **Consumers**: analytics, (option V1) scoring comparator trigger (backend)
- **Data**: `{ "rfp_id": "...", "agency_tenant_id": "...", "proposed_rate": 35.5, "price_model": "hourly" }`

### RfpAllocated

- **Producer**: M4
- **Entity**: rfp_allocation
- **Consumers**: M7 (create mission draft), no-code (notify client/agence), analytics
- **Data**: `{ "rfp_id": "...", "agency_tenant_id": "...", "allocation_status": "confirmed" }`

---

## 2.10.4.4 ATS (M5)

### JobOfferPublished

- **Producer**: M5
- **Entity**: job_offer
- **Consumers**: no-code (post job board V2), analytics
- **Data**: `{ "job_offer_id": "...", "title": "...", "corridor": "RO->FR" }`

### ApplicationReceived

- **Producer**: M5
- **Entity**: application
- **Consumers**: AI parsing pipeline (backend job/queue), no-code (notify recruiter)
- **Data**: `{ "application_id": "...", "candidate_id": "...", "job_offer_id": "...", "source": "manual|import|api" }`

### CandidateParsed

- **Producer**: M5
- **Entity**: candidate
- **Consumers**: M5 (update application score), analytics
- **Data**: `{ "candidate_id": "...", "extracted_fields": ["languages","experience_years","skills"] }`
- **Note**: traitement IA assisté; publication canonique via M5.

### CandidateScored

- **Producer**: M5
- **Entity**: application
- **Consumers**: no-code (notify shortlist), analytics
- **Data**: `{ "application_id": "...", "ai_score": 82, "model_version": "cvscore-1.0" }`
- **Note**: scoring IA assisté; publication canonique via M5.

---

## 2.10.4.5 Workers & Missions (M6-M7-M7bis)

### WorkerCreated

- **Producer**: M6
- **Entity**: worker
- **Consumers**: no-code (request docs), analytics
- **Data**: `{ "worker_id": "...", "nationality": "...", "language": "pl" }`

### WorkerDocumentStatusChanged

- **Producer**: M6
- **Entity**: worker_document
- **Consumers**: no-code (reminder), compliance requirements sync
- **Data**: `{ "worker_id": "...", "doc_type": "passport", "from": "missing", "to": "valid", "valid_to": "YYYY-MM-DD" }`

### MissionCreated

- **Producer**: M7
- **Entity**: mission
- **Consumers**: M8 (create compliance case), no-code (notify worker), analytics
- **Data**: `{ "mission_id": "...", "client_id": "...", "worker_id": "...", "corridor_origin_country": "PT", "corridor_host_country": "FR", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`

### MissionStatusChanged

- **Producer**: M7
- **Entity**: mission
- **Consumers**: enforcement re-eval, no-code (notifications), analytics
- **Data**: `{ "mission_id": "...", "from": "planned", "to": "active" }`

### WorkerCheckEventRecorded

- **Producer**: M7bis
- **Entity**: worker_check_event
- **Consumers**: analytics, timesheet assist (option), audit trail
- **Data**: `{ "mission_id": "...", "worker_id": "...", "event_type": "check_in", "occurred_at": "..." }`

### TimesheetSubmitted

- **Producer**: M7.T
- **Entity**: timesheet
- **Consumers**: M8 enforcement re-eval (can_validate_timesheets), no-code (notify validator)
- **Data**: `{ "timesheet_id": "...", "mission_id": "...", "period_start": "YYYY-MM-DD", "period_end": "YYYY-MM-DD", "total_hours": 38.5 }`

### TimesheetValidated

- **Producer**: M7.T
- **Entity**: timesheet
- **Consumers**: M10 (invoice draft only, not issued)
- **Data**: `{ "timesheet_id": "...", "mission_id": "...", "validated_by_user_id": "...", "total_hours": 38.5 }`

### TimesheetCreated

- **Producer**: M7.T
- **Entity**: timesheet
- **Consumers**: no-code (notify validators), analytics
- **Data**: `{ "timesheet_id": "...", "mission_id": "...", "period_start": "YYYY-MM-DD", "period_end": "YYYY-MM-DD", "status": "draft", "billing_status": "not_billed" }`

### TimesheetEntryAdded

- **Producer**: M7.T
- **Entity**: timesheet_entry
- **Consumers**: analytics, no-code (reminders de saisie)
- **Data**: `{ "timesheet_id": "...", "entry_id": "...", "work_date": "YYYY-MM-DD", "hours": 7.5 }`

### TimesheetRejected

- **Producer**: M7.T
- **Entity**: timesheet
- **Consumers**: no-code (notify worker + validators), analytics
- **Data**: `{ "timesheet_id": "...", "mission_id": "...", "rejected_by_user_id": "...", "reason": "...", "notes": "..." }`

---

## 2.10.4.6 Vault (M9)

### FileUploaded

- **Producer**: M9
- **Entity**: file
- **Consumers**: M8 requirements matcher (backend), no-code (OCR/AI extract), audit
- **Data**: `{ "file_id": "...", "entity_type": "worker|mission|compliance_case|a1_request", "entity_id": "...", "purpose": "proof|id|contract|..." }`

### FileAccessed

- **Producer**: M9
- **Entity**: file_access_log
- **Consumers**: analytics/security monitoring
- **Data**: `{ "file_id": "...", "access_type": "view|download", "actor_user_id": "...", "occurred_at": "..." }`

---

## 2.10.4.7 Compliance (M8) — CRITIQUE

### ComplianceCaseCreated

- **Producer**: M8
- **Entity**: compliance_case
- **Consumers**: no-code (task list initiale), analytics
- **Data**: `{ "compliance_case_id": "...", "mission_id": "...", "corridor": "PL->FR", "status": "draft" }`
- **Trigger**: MissionCreated.

### ComplianceRequirementCreated

- **Producer**: M8
- **Entity**: compliance_requirement
- **Consumers**: no-code (reminders), worker app (doc request)
- **Data**: `{ "compliance_case_id": "...", "requirement_code": "A1_REQUIRED", "due_date": "YYYY-MM-DD" }`

### ComplianceRequirementStatusChanged

- **Producer**: M8
- **Entity**: compliance_requirement
- **Consumers**: enforcement evaluator, no-code (notify), analytics
- **Data**: `{ "compliance_case_id": "...", "requirement_code": "A1_REQUIRED", "from": "pending", "to": "provided" }`

### A1StatusUpdated

- **Producer**: M8
- **Entity**: a1_request
- **Consumers**: enforcement evaluator, no-code (relances), analytics
- **Data**: `{ "a1_request_id": "...", "compliance_case_id": "...", "from": "pending", "to": "issued", "expires_at": "YYYY-MM-DD" }`

### RemunerationSnapshotCreated

- **Producer**: M8
- **Entity**: worker_remuneration_snapshot
- **Consumers**: audit/export, analytics
- **Data**: `{ "compliance_case_id": "...", "snapshot_id": "...", "is_compliant": true, "legal_minimum_amount": 12.5, "eligible_remuneration_amount": 13.2, "engine_version": "pay-1.0" }`

### ComplianceScoreCalculated

- **Producer**: M8
- **Entity**: compliance_score
- **Consumers**: marketplace ranking (M12), analytics
- **Data**: `{ "compliance_case_id": "...", "total_score": 91, "model_version": "compliance-1.0" }`

### MissionEnforcementEvaluated

- **Producer**: M8
- **Entity**: mission_enforcement_flags
- **Consumers**: M7 (gate activation), M10 (gate invoice), no-code (alerts)
- **Data**: `{ "mission_id": "...", "can_activate_mission": true, "can_validate_timesheets": true, "can_issue_invoice": false, "blocking_reasons": ["A1_MISSING"] }`

### ComplianceStatusChanged

- **Producer**: M8
- **Entity**: compliance_case
- **Consumers**: dashboards, no-code, analytics
- **Data**: `{ "compliance_case_id": "...", "from": "in_progress", "to": "blocked", "reasons": ["SALARY_BELOW_MIN"] }`

---

## 2.10.4.8 Finance (M10)

### QuoteSent

- **Producer**: M10
- **Entity**: quote
- **Consumers**: no-code (email), analytics
- **Data**: `{ "quote_id": "...", "client_id": "...", "total": 12500, "currency": "EUR" }`

### QuoteAccepted

- **Producer**: M10
- **Entity**: quote
- **Consumers**: M7 (mission planned), no-code (notify), analytics
- **Data**: `{ "quote_id": "...", "client_id": "...", "accepted_at": "..." }`

### InvoiceIssued

- **Producer**: M10
- **Entity**: invoice
- **Consumers**: no-code (send invoice), export compta batch
- **Data**: `{ "invoice_id": "...", "client_id": "...", "mission_id": "...", "total": 8400, "due_at": "..." }`

### InvoiceDraftCreated

- **Producer**: M10
- **Entity**: invoice
- **Consumers**: no-code (send later), analytics
- **Data**: `{ "invoice_id": "...", "client_id": "...", "mission_id": "uuid|null", "total": 8400, "currency": "EUR" }`

### InvoiceBlocked

- **Producer**: M10
- **Entity**: invoice
- **Consumers**: no-code (alert), dashboards
- **Data**: `{ "invoice_id": "...", "mission_id": "...", "blocked_reason": ["COMPLIANCE_BLOCKED"] }`

### InvoiceVoided

- **Producer**: M10
- **Entity**: invoice
- **Consumers**: no-code (notify), analytics
- **Data**: `{ "invoice_id": "...", "voided_at": "...", "reason": "string|null" }`

### PaymentRecorded

- **Producer**: M10
- **Entity**: payment
- **Consumers**: commissions, analytics
- **Data**: `{ "payment_id": "...", "invoice_id": "...", "amount": 8400, "paid_at": "..." }`

### ConsultantCommissionCalculated

- **Producer**: M10
- **Entity**: consultant_commission
- **Consumers**: payout workflow (V2), analytics
- **Data**: `{ "invoice_id": "...", "consultant_user_id": "...", "commission_rate": 0.7, "commission_amount": 1200 }`

---

## 2.10.4.9 Risk / Certification / Marketplace (M11-M12)

### AgencyRiskScoreCalculated

- **Producer**: M12
- **Entity**: agency_risk_score
- **Consumers**: certification gating, analytics
- **Data**: `{ "tenant_id": "...", "risk_score": 22, "model_version": "risk-1.0" }`

### AgencyCertificationStatusChanged

- **Producer**: M12
- **Entity**: agency_certification
- **Consumers**: marketplace_access updater, no-code (notif), analytics
- **Data**: `{ "tenant_id": "...", "from": "suspended", "to": "active", "certification_level": "controlled" }`

### MarketplaceAccessChanged

- **Producer**: M12
- **Entity**: marketplace_access
- **Consumers**: M11 UI gating, analytics
- **Data**: `{ "tenant_id": "...", "access_level": "certified", "status": "active" }`

### MarketplaceRankingUpdated

- **Producer**: M12
- **Entity**: agency_marketplace_ranking
- **Consumers**: M11 listings, analytics
- **Data**: `{ "tenant_id": "...", "ranking_score": 88, "model_version": "rank-1.0" }`

### 2.10.4.10 Events V1.1 — Alignement Patch DB (Tasks, Lead Conversion, Agency Profile, Soft Delete, Billing)

### TaskCreated

- **Producer**: M1
- Entity: task
- Consumers: no-code (reminders), analytics
- Data: { "task_id": "...", "title": "...", "assigned_to_user_id": "...", "entity_type": "compliance_case", "entity_id": "...", "due_at": "..." }
- Note: task transverse V1, publication canonique via M1.

### TaskStatusChanged

- **Producer**: M1
- Entity: task
- Consumers: no-code (notify), analytics
- Data: { "task_id": "...", "from": "todo", "to": "done" }
- Note: task transverse V1, publication canonique via M1.

### LeadConvertedToClient

- **Producer**: M3
- Entity: lead
- Consumers: analytics, no-code (onboarding docs vigilance)
- Data: { "lead_id": "...", "client_id": "...", "converted_at": "..." }

### AgencyProfileUpdated

- **Producer**: M12
- Entity: agency_profile
- Consumers: marketplace listing, analytics
- Data: { "tenant_id": "...", "changed_fields": ["vat_number","registration_id","status"] }

### FileSoftDeleted

- **Producer**: M9
- Entity: file
- Consumers: security monitoring, audit/export
- Data: { "file_id": "...", "deleted_by": "...", "deleted_at": "...", "delete_reason": "..." }

### TimesheetBillingStatusChanged

- **Producer**: M10
- Entity: timesheet
- Consumers: analytics, dashboards
- Data: { "timesheet_id": "...", "from": "not_billed", "to": "billed", "invoice_id": "..." }
- (Option) Ajouter une note : “M7 peut demander un changement via backend Finance.”

---

## 2.10.5 Règles de déclenchement (qui publie quoi, quand)

### Triggers “must-have” V1

- `MissionCreated` ⇒ publier `ComplianceCaseCreated` (M8) + créer requirements initiaux
- Toute évolution de requirement/A1/rémunération ⇒ publier `MissionEnforcementEvaluated`
- `TimesheetSubmitted/Validated` ⇒ re-évaluer enforcement (can_validate_timesheets / can_issue_invoice)
- `InvoiceIssued` ⇒ event + orchestration email/pdf (no-code)

### Batch quotidien (hybride)

- Recalcule expirations docs/A1, et republie si changement :
    - `WorkerDocumentStatusChanged`
    - `A1StatusUpdated`
    - `ComplianceStatusChanged` (si impact)
    - `MissionEnforcementEvaluated` (si flags changent)

---

## 2.10.6 Consommateurs autorisés (No-code / IA / Front)

### No-code (Make/n8n) — autorisé

- Emails / notifications
- Génération PDF (dossier inspection-ready)
- Relances A1 / pièces manquantes (création `tasks` si nécessaire)
- Exports comptables (CSV)
- Traductions
- OCR / parsing document (puis retour backend via endpoint dédié)

### Interdictions absolues (No-code)

- Calcul rémunération
- Calcul conformité
- Scoring / ranking
- Enforcement
- Règles pays hardcodées

---

## 2.10.7 Backlog V2 (non inclus V1)

- Webhooks partenaires (job boards, e-signature, compta API)
- Allocation auto marketplace (au-delà “assistée”)
- Connecteurs A1 par pays (semi-automatisation)
- SIPSI auto (Country Pack FR)

---

## Changelog doc

- 2026-02-17: Normalisation Producer (format + valeurs atomiques), sans changement métier.
- 2026-02-17: Complétion des Events (OpenAPI) + ajout events Finance manquants (2.10), sans changement métier.
