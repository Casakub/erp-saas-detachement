# 2.11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2

**Statut** : DRAFT (devient LOCKED après validation)
**Version** : 1.0
**Dernière mise à jour** : 2026-02-15
**Règle** : toute modification API ⇒ update DB (si impact) + update Events + update RBAC + changelog

---

## 2.11.0 Conventions (contract-first)

- Base path : `/v1`
- Auth : Bearer JWT (multi-tenant via `tenant_id` du token)
- Tous les endpoints métiers sont **tenant-scoped** (RLS côté DB)
- Erreurs standard :
    - `400` validation_error
    - `401` unauthenticated
    - `403` forbidden
    - `404` not_found
    - `409` conflict
    - `422` business_rule_failed
    - `429` rate_limited
    - `500` internal_error
- Pagination : `?limit=50&cursor=...`
- Idempotence (créations sensibles) : header `Idempotency-Key`
- Chaque endpoint “mutant” publie un event dans `events_outbox`

---

## 2.11.1 Parcours 1 — Mission → Compliance Case → Enforcement (CRITIQUE)

### 2.11.1.1 Missions (M7)

### POST `/v1/missions`

**Rôle** : `agency_user | consultant | tenant_admin`

**But** : créer mission (planned) + publish `MissionCreated`

**Request**

```json
{
  "client_id": "uuid",
  "site_id": "uuid|null",
  "worker_id": "uuid",
  "sector": "string",
  "job_title": "string",
  "corridor_origin_country": "PT|RO|PL|FR",
  "corridor_host_country": "FR|PT|RO|PL",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD|null",
  "weekly_hours": 35,
  "planned_paid_hours": 0,
  "notes": "string|null"
}
```

**Response 201**

```json
{ "mission_id": "uuid", "mission_number": "MIS-2026-000123", "status": "planned" }
```

**Events**

- MissionCreated (M7)

### PATCH `/v1/missions/{mission_id}/status`

**Rôle** : agency_user | tenant_admin

**But** : changer statut mission + publish MissionStatusChanged

**Règle** : activation (planned→active) est **gated** par enforcement flags (M8)

**Request**

```json
{ "status": "planned|active|completed|cancelled" }
```

**Response 200**

```json
{ "mission_id": "uuid", "from": "planned", "to": "active" }
```

**Business rule (422)**

```json
{
  "code": "mission_activation_blocked",
  "message": "Mission cannot be activated due to compliance enforcement.",
  "blocking_reasons": ["A1_MISSING","DOC_EXPIRED"]
}
```

**Events**

- MissionStatusChanged (M7)
- (indirect) MissionEnforcementEvaluated (M8 job)

### GET `/v1/missions/{mission_id}`

**Rôle** : agency_user | consultant | client_user(read-only scoped) | tenant_admin

**But** : détail mission + include enforcement summary (read-model)

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{
  "mission_id": "uuid",
  "mission_number": "MIS-2026-000123",
  "status": "planned",
  "client_id": "uuid",
  "site_id": "uuid|null",
  "worker_id": "uuid",
  "corridor_origin_country": "PT",
  "corridor_host_country": "FR",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD|null",
  "enforcement": {
    "can_activate_mission": true,
    "can_validate_timesheets": true,
    "can_issue_invoice": false,
    "blocking_reasons": ["A1_MISSING"]
  }
}
```

**Events**

- Aucun event métier publié (endpoint de lecture).

### **2.11.1.2 Compliance Case (M8)**

### GET `/v1/missions/{mission_id}/compliance-case`

**Rôle** : agency_user | consultant | tenant_admin | client_user(read-only)

**But** : récupérer compliance case (1 mission = 1 case)

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{
  "compliance_case_id": "uuid",
  "case_number": "CC-2026-000777",
  "mission_id": "uuid",
  "status": "draft|in_progress|compliant|warning|blocked|archived",
  "corridor_origin_country": "PT",
  "corridor_host_country": "FR",
  "cumulative_duration_days": 0,
  "last_reviewed_at": "ISO|null"
}
```

**Events**

- Aucun event métier publié (endpoint de lecture).

### POST `/v1/missions/{mission_id}/compliance-case/requirements/initialize`

**Rôle** : tenant_admin | agency_user

**But** : (re)générer requirements initiaux depuis ruleset + publish ComplianceRequirementCreated

**Note** : normalement auto après MissionCreated (batch/job), mais utile en réparation.

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{ "created": 12, "updated": 0 }
```

**Events**

- ComplianceRequirementCreated (M8) (1 event par requirement ou 1 batch event selon implémentation)

---

### GET `/v1/compliance-cases/{compliance_case_id}/requirements`

**Rôle** : agency_user | consultant | tenant_admin | worker(read-only limité)

**But** : lister requirements

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
[
  {
    "requirement_id": "uuid",
    "requirement_code": "A1_REQUIRED",
    "label": "string|i18n_key",
    "status": "pending|provided|approved|rejected",
    "due_date": "YYYY-MM-DD|null",
    "provided_file_id": "uuid|null"
  }
]
```

**Events**

- Aucun event métier publié (endpoint de lecture).

### PATCH `/v1/requirements/{requirement_id}/status`

**Rôle** : agency_user | tenant_admin

**But** : passer un requirement (provided/approved/rejected) + publish ComplianceRequirementStatusChanged

**Règle** : le backend re-évalue enforcement après changement.

**Request**

```json
{ "status": "provided|approved|rejected", "notes": "string|null" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- ComplianceRequirementStatusChanged (M8)
- MissionEnforcementEvaluated (M8) (si flags changent)

---

### **2.11.1.3 A1 (assisté V1) (M8)**

### POST `/v1/compliance-cases/{compliance_case_id}/a1-requests`

**Rôle** : agency_user | tenant_admin

**But** : créer une demande A1 (assistée) + publish A1StatusUpdated (from null→not_requested/pending)

**Request**

```json
{ "origin_country": "PT|RO|PL|FR" }
```

**Response 201**

```json
{ "a1_request_id": "uuid", "status": "not_requested" }
```

**Events**

- A1StatusUpdated (M8)
- MissionEnforcementEvaluated (M8) (si flags changent)

### PATCH `/v1/a1-requests/{a1_request_id}/status`

**Rôle** : agency_user | tenant_admin

**But** : mise à jour statut A1 + dates + publish A1StatusUpdated

**Request**

```json
{
  "status": "not_requested|pending|issued|expired|rejected",
  "requested_at": "ISO|null",
  "issued_at": "ISO|null",
  "expires_at": "ISO|null",
  "rejection_reason": "string|null",
  "file_id": "uuid|null"
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- A1StatusUpdated (M8)
- MissionEnforcementEvaluated (M8) (si flags changent)

---

### **2.11.1.4 Remuneration engine (M8) — Snapshot immuable**

### POST `/v1/compliance-cases/{compliance_case_id}/remuneration/inputs`

**Rôle** : agency_user | tenant_admin

**But** : enregistrer inputs (base salary + bonus + allowances) (écrase la dernière version “courante”)

**Note** : le snapshot immuable est créé via endpoint de calcul ci-dessous.

**Request**

```json
{
  "base_salary_amount": 13.2,
  "base_salary_frequency": "hourly|monthly",
  "paid_hours": 151.67,
  "bonuses": [],
  "allowances": []
}
```

**Response 200**

```json
{ "saved": true }
```

**Events**

- MissionEnforcementEvaluated (M8) (si flags changent)

### POST `/v1/compliance-cases/{compliance_case_id}/remuneration/snapshots:calculate`

**Rôle** : agency_user | tenant_admin

**But** : calcule conformité rémunération + crée snapshot immuable + publish RemunerationSnapshotCreated

**Request**

- Non spécifié dans cette section.

**Response 201**

```json
{
  "snapshot_id": "uuid",
  "is_compliant": true,
  "legal_minimum_amount": 12.5,
  "legal_minimum_unit": "hourly",
  "eligible_remuneration_amount": 13.2,
  "excluded_expenses_amount": 0,
  "engine_version": "pay-1.0",
  "calculated_at": "ISO"
}
```

**Events**

- RemunerationSnapshotCreated (M8)
- MissionEnforcementEvaluated (M8) (si flags changent)

---

### **2.11.1.5 Enforcement (M8) — Gate central**

### GET `/v1/missions/{mission_id}/enforcement`

**Rôle** : agency_user | consultant | tenant_admin | client_user(read-only)

**But** : lire flags + raisons

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{
  "mission_id": "uuid",
  "can_activate_mission": true,
  "can_validate_timesheets": true,
  "can_issue_invoice": false,
  "blocking_reasons": ["A1_MISSING"],
  "last_evaluated_at": "ISO"
}
```

**Events**

- Aucun event métier publié (endpoint de lecture).

### POST `/v1/missions/{mission_id}/enforcement:evaluate`

**Rôle** : tenant_admin | system

**But** : recalcul explicite (réparation / admin) + publish MissionEnforcementEvaluated si changement

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{ "changed": true, "blocking_reasons": ["A1_MISSING"] }
```

**Events**

- MissionEnforcementEvaluated (M8) (si flags changent)

## **2.11.2 Parcours 3 — Timesheet → Invoice → Payment (CASH)**

### **2.11.2.1 Timesheets (M7.T)**

### POST `/v1/missions/{mission_id}/timesheets`

**Rôle** : agency_user | tenant_admin *(worker via PWA en V1: option read/write limité si tu le souhaites)*

**But** : créer timesheet (draft)

**Request**

```json
{ "period_start": "YYYY-MM-DD", "period_end": "YYYY-MM-DD" }
```

**Response 201**

```json
{ "timesheet_id": "uuid", "status": "draft", "billing_status": "not_billed" }
```

**Events**

- TimesheetCreated (M7.T)

### POST `/v1/timesheets/{timesheet_id}/entries`

**Rôle** : agency_user | tenant_admin | worker(limité)

**But** : ajouter une entrée

**Request**

```json
{ "work_date": "YYYY-MM-DD", "hours": 7.5, "notes": "string|null" }
```

**Response 201**

```json
{ "entry_id": "uuid" }
```

**Events**

- TimesheetEntryAdded (M7.T)

### POST `/v1/timesheets/{timesheet_id}:submit`

**Rôle** : agency_user | tenant_admin | worker(limité)

**But** : submit + publish TimesheetSubmitted

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{ "timesheet_id": "uuid", "status": "submitted" }
```

**Events**

- TimesheetSubmitted (M7.T)
- (indirect) MissionEnforcementEvaluated (M8 if needed)

---

### POST `/v1/timesheets/{timesheet_id}:validate`

**Rôle** : agency_user | tenant_admin

**But** : validate + publish TimesheetValidated

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Business rule (422)** : si enforcement interdit validation

```json
{
  "code": "timesheet_validation_blocked",
  "message": "Timesheet cannot be validated due to compliance enforcement.",
  "blocking_reasons": ["COMPLIANCE_BLOCKED"]
}
```

**Events**

- TimesheetValidated (M7.T)

---

### POST `/v1/timesheets/{timesheet_id}:reject`

**Rôle** : agency_user | tenant_admin | client_user *(si double validation activée)*

**But** : rejeter un timesheet + publish TimesheetRejected

**Request**

```json
{ "reason": "string", "notes": "string|null" }
```

**Response 200**

```json
{ "timesheet_id": "uuid", "status": "rejected" }
```

**Events**

- TimesheetRejected (M7.T)

---

### 2.11.2.2 Invoices (M10) — Mode C (MIX : Draft si warning, Issue direct si compliant)

**Règle mode C :**

- Si `enforcement.can_issue_invoice = false` ⇒ **bloquer** (422) + publier `InvoiceBlocked` (optionnel si invoice non créée)
- Si `compliance_case.status = compliant` **et** `can_issue_invoice = true` ⇒ **issue direct**
- Si `compliance_case.status ∈ {warning, in_progress}` **et** `can_issue_invoice = true` ⇒ **draft**, puis issue manuelle (avec re-check enforcement)

---

### POST `/v1/invoices:from-timesheet`

**Rôle** : `agency_user | tenant_admin`

**But** : créer facture depuis timesheet validé (draft ou issue direct selon mode C)

**Request**

```json
{
  "timesheet_id": "uuid",
  "client_id": "uuid",
  "currency": "EUR",
  "issue_if_compliant": true
}
```

**Response 201 (issue direct)**

```json
{
  "invoice_id": "uuid",
  "status": "issued",
  "invoice_number": "INV-2026-000456",
  "timesheet_id": "uuid",
  "total": 8400,
  "issued_at": "ISO"
}
```

**Events**

- InvoiceIssued (M10)
- TimesheetBillingStatusChanged (M10) → billed + invoice_id

**Response 201 (draft)**

```json
{
  "invoice_id": "uuid",
  "status": "draft",
  "invoice_number": "INV-2026-000456",
  "timesheet_id": "uuid",
  "total": 8400
}
```

**Events**

- *(optionnel V1)* InvoiceDraftCreated (sinon rien)
- TimesheetBillingStatusChanged (M10) → billed + invoice_id *(ou garder not_billed jusqu’à issue — choix produit)*

---

**Business rule (422) — bloqué**

```json
{
  "code": "invoice_issuance_blocked",
  "message": "Invoice cannot be created or issued due to compliance enforcement.",
  "blocking_reasons": ["A1_MISSING","COMPLIANCE_BLOCKED"]
}
```

**Events**

- InvoiceBlocked (M10) *(recommandé uniquement si une invoice existe déjà ; sinon log interne + task)*

---

### POST `/v1/invoices/{invoice_id}:issue`

**Rôle** : agency_user | tenant_admin

**But** : draft → issued avec re-check enforcement

**Request**

- Non spécifié dans cette section.

**Response 200**

```json
{
  "invoice_id": "uuid",
  "from": "draft",
  "to": "issued",
  "issued_at": "ISO"
}
```

**Events**

- InvoiceIssued (M10)

---

### POST `/v1/invoices/{invoice_id}:block`

**Rôle** : system | tenant_admin

**But** : bloquer une facture (enforcement gate) + publier InvoiceBlocked

**Request**

```json
{ "blocked_reason": ["COMPLIANCE_BLOCKED"], "notes": "string|null" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- InvoiceBlocked (M10)

---

### POST `/v1/invoices/{invoice_id}:void`

**Rôle** : tenant_admin

**But** : annuler (avoir / correction) — V1 minimal

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- *(optionnel V1)* InvoiceVoided

**2.11.2.3 Payments (M10)**

### POST `/v1/payments`

**Rôle** : agency_user | tenant_admin

**But** : enregistrer paiement + publish PaymentRecorded

**Request**

```json
{ "invoice_id": "uuid", "amount": 8400, "paid_at": "ISO", "method": "bank|card|other", "reference": "string|null" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- PaymentRecorded (M10)
- ConsultantCommissionCalculated (M10) (si règle active)

---

### PATCH `/v1/timesheets/{timesheet_id}/billing-status`

**Rôle** : agency_user | tenant_admin

**But** : MAJ billing_status + publish TimesheetBillingStatusChanged

**Request**

```json
{ "billing_status": "not_billed|billed|disputed", "invoice_id": "uuid|null" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- TimesheetBillingStatusChanged (M10)

**Décision V1 (LOCKED)**

Mode facturation : **C1**

- `timesheets.billing_status = billed` dès la création d’une facture (draft ou issued)
- Une timesheet ne peut être refacturée qu’après **void/correction** explicite
- Tout changement ⇒ update DB + Events + OpenAPI + changelog

---

## **2.11.3 Parcours 2 — CRM → RFP → Allocation (BUSINESS)**

### 2.11.3.1 Leads (M2)

### POST `/v1/leads`

**Rôle** : `consultant | agency_user | tenant_admin`

**But** : créer un lead + publish `LeadCreated`

**Request**

```json
{
  "owner_user_id": "uuid",
  "company_name": "string",
  "country": "string",
  "sector": "string",
  "corridor_target": "PL->FR|null",
  "source": "string|null",
  "notes": "string|null"
}
```

**Response 201**

```json
{ "lead_id": "uuid", "status": "new" }
```

**Events**

- LeadCreated

---

### PATCH `/v1/leads/{lead_id}/status`

**Rôle** : consultant | agency_user | tenant_admin

**But** : update statut + publish LeadStatusChanged

**Request**

```json
{ "status": "new|contacted|qualified|won|lost" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- LeadStatusChanged

---

### GET `/v1/leads`

**Rôle** : consultant | agency_user | tenant_admin

**But** : liste filtrable (status/owner/sector/corridor)

---

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- Aucun event métier publié (endpoint de lecture).

### **2.11.3.2 Clients (M3)**

### POST `/v1/clients`

**Rôle** : agency_user | tenant_admin

**But** : créer client + publish ClientCreated

**Request**

```json
{
  "name": "string",
  "legal_form": "string|null",
  "siret": "string|null",
  "vat_number": "string|null",
  "billing_email": "string|null",
  "account_owner_user_id": "uuid|null",
  "status": "active|inactive",
  "default_language": "FR|EN|PL|RO"
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- ClientCreated

---

### POST `/v1/leads/{lead_id}:convert-to-client`

**Rôle** : agency_user | tenant_admin

**But** : conversion Lead → Client (création client + lien lead) + publish LeadConvertedToClient

**Request**

```json
{
  "client": {
    "name": "string",
    "siret": "string|null",
    "vat_number": "string|null",
    "billing_email": "string|null",
    "default_language": "FR|EN|PL|RO"
  }
}
```

**Response 201**

```json
{ "lead_id": "uuid", "client_id": "uuid", "converted_at": "ISO" }
```

**Events**

- LeadConvertedToClient

---

### POST `/v1/clients/{client_id}/sites`

**Rôle** : agency_user | tenant_admin

**But** : créer un site client

---

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- ClientSiteCreated (M3)

### POST `/v1/clients/{client_id}/documents`

**Rôle** : agency_user | tenant_admin

**But** : ajouter doc vigilance (Kbis, assurance…) + (option) publish ClientDocumentStatusChanged

---

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- ClientDocumentStatusChanged (M3)

### **2.11.3.3 RFP (M4)**

### POST `/v1/rfps`

**Rôle** : consultant | agency_user | tenant_admin

**But** : créer RFP (draft) + publish RfpCreated

**Request**

```json
{
  "client_id": "uuid",
  "site_id": "uuid|null",
  "corridor_origin_country": "PT|RO|PL|FR",
  "corridor_host_country": "FR|PT|RO|PL",
  "sector": "string",
  "job_title": "string",
  "headcount": 1,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD|null",
  "weekly_hours": 35,
  "requirements": {}
}
```

**Response 201**

```json
{ "rfp_id": "uuid", "rfp_number": "RFP-2026-000321", "status": "draft" }
```

**Events**

- RfpCreated

---

### POST `/v1/rfps/{rfp_id}:publish`

**Rôle** : consultant | agency_user | tenant_admin

**But** : passer en “sent/receiving” + publish RfpPublished

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- RfpPublished

---

### POST `/v1/rfps/{rfp_id}/invites`

**Rôle** : consultant | agency_user | tenant_admin

**But** : inviter des agences (tenants) à répondre

**Request**

```json
{ "agency_tenant_ids": ["uuid","uuid"] }
```

**Response**

- Non spécifié dans cette section.

**Events**

- RfpInviteCreated (M4)

### POST `/v1/rfps/{rfp_id}/responses`

**Rôle** : agency_user(tenant agence invitée) | tenant_admin

**But** : soumettre réponse + publish RfpResponseSubmitted

**Request**

```json
{
  "agency_tenant_id": "uuid",
  "price_model": "hourly|daily|fixed",
  "proposed_rate": 35.5,
  "availability_notes": "string|null"
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- RfpResponseSubmitted

---

### POST `/v1/rfps/{rfp_id}:allocate`

**Rôle** : consultant | agency_user | tenant_admin

**But** : allocation gagnante + publish RfpAllocated

**Request**

```json
{ "agency_tenant_id": "uuid", "allocation_status": "confirmed" }
```

**Response 200**

```json
{ "rfp_id": "uuid", "agency_tenant_id": "uuid", "allocation_status": "confirmed" }
```

**Events**

- RfpAllocated

---

### **2.11.3.4 Allocation → Mission (bridge M4→M7)**

### POST `/v1/rfps/{rfp_id}:create-mission-draft`

**Rôle** : consultant | agency_user | tenant_admin

**But** : créer une mission planned depuis une allocation confirmée (worker à définir ensuite)

**Request**

```json
{
  "client_id": "uuid",
  "site_id": "uuid|null",
  "sector": "string",
  "job_title": "string",
  "corridor_origin_country": "PT|RO|PL|FR",
  "corridor_host_country": "FR|PT|RO|PL",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD|null",
  "weekly_hours": 35
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- MissionCreated (si mission créée)
- (indirect) ComplianceCaseCreated (M8)

---

## **2.11.4 Endpoints transverses — Tasks (V1.1)**

### POST `/v1/tasks`

**Rôle** : consultant | agency_user | tenant_admin

**But** : créer task + publish TaskCreated

**Request**

```json
{
  "title": "string",
  "description": "string|null",
  "priority": "low|medium|high|urgent",
  "due_at": "ISO|null",
  "assigned_to_user_id": "uuid|null",
  "entity_type": "lead|client|mission|compliance_case|a1_request|null",
  "entity_id": "uuid|null",
  "tags": []
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- TaskCreated

---

### PATCH `/v1/tasks/{task_id}/status`

**Rôle** : consultant | agency_user | tenant_admin

**But** : update statut + publish TaskStatusChanged

**Request**

```json
{ "status": "todo|in_progress|done|cancelled" }
```

**Response**

- Non spécifié dans cette section.

**Events**

- TaskStatusChanged

---

### GET `/v1/tasks`

**Rôle** : consultant | agency_user | tenant_admin

**But** : liste filtrable (status/assigned/due/entity)

---

## **2.11.5 Endpoints transverses — Agency Profile (V1.1)**

**Request**

- Non spécifié dans cette section.

**Response**

- Non spécifié dans cette section.

**Events**

- Aucun event métier publié (endpoint de lecture).

### PATCH `/v1/agency-profile`

**Rôle** : tenant_admin

**But** : update profil agence + publish AgencyProfileUpdated

**Request**

```json
{
  "legal_name": "string",
  "trade_name": "string|null",
  "country_code": "FR|PT|RO|PL",
  "vat_number": "string|null",
  "tax_id": "string|null",
  "registration_id": "string|null",
  "contact_email": "string|null",
  "phone": "string|null",
  "address": {}
}
```

**Response**

- Non spécifié dans cette section.

**Events**

- AgencyProfileUpdated

---

## **2.11.6 Mapping endpoint → events (résumé)**

- POST /missions → MissionCreated
- PATCH /missions/{id}/status → MissionStatusChanged
- PATCH /requirements/{id}/status → ComplianceRequirementStatusChanged + (possible) MissionEnforcementEvaluated
- PATCH /a1-requests/{id}/status → A1StatusUpdated + (possible) MissionEnforcementEvaluated
- POST /remuneration/snapshots:calculate → RemunerationSnapshotCreated + (possible) MissionEnforcementEvaluated
- POST /timesheets/{timesheet_id}:submit → TimesheetSubmitted (M7.T)
- POST /timesheets/{timesheet_id}:validate → TimesheetValidated (M7.T)
- POST /timesheets/{timesheet_id}:reject → TimesheetRejected (M7.T)
- POST /invoices:from-timesheet ou /invoices/{id}:issue → InvoiceIssued (ou InvoiceBlocked)
- POST /payments → PaymentRecorded (+ ConsultantCommissionCalculated)
- PATCH /timesheets/{timesheet_id}/billing-status → TimesheetBillingStatusChanged (M10)

## **2.11.7 M10 Devis & Commissions**

Objectif : Permettre la création et le suivi des devis + commissions sans inventer de contrat.

Endpoints minimum à contractualiser :

POST   /v1/quotes              — Créer un devis (draft)
PATCH  /v1/quotes/{id}         — Modifier un devis draft
POST   /v1/quotes/{id}:send    — Envoyer au client (→ QuoteSent)
POST   /v1/quotes/{id}:accept  — Accepter (→ QuoteAccepted)
GET    /v1/quotes/{id}         — Lire un devis

GET    /v1/invoices/{id}/commissions    — Lire commissions liées à une facture
PATCH  /v1/commissions/{id}/status      — Approuver/payer une commission

POST   /v1/accounting-exports           — Déclencher un export CSV
GET    /v1/accounting-exports/{id}      — Statut de l'export

Règle métier clé : devis jamais bloqué par enforcement (conforme SOCLE §2.6).

Events à associer : QuoteSent, QuoteAccepted (déjà dans 2.10). Ajouter : QuoteCreated, CommissionApproved.

---

## Changelog doc

- 2026-02-17: Refactor Markdown strict du document (fences normalisés en `json`, structure endpoint harmonisée, sans changement fonctionnel).
- 2026-02-17: Complétion des Events (OpenAPI) + ajout events Finance manquants (2.10), sans changement métier.
