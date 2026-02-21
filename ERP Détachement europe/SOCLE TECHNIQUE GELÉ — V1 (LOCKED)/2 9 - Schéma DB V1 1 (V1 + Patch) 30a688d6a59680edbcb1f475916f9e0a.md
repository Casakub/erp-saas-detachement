# 2.9 - Schéma DB V1.1 (V1 + Patch)

## 2.9 SCHÉMA BASE DE DONNÉES V1 — SaaS Détachement Europe (Multi-tenant, RegTech)

**Version :** **1.1 (V1 + Patch)**

**Statut : LOCKED**

**Dernière mise à jour : 2026-02-15**

**Règle : tout changement DB ⇒ migration + update OpenAPI + update Events + update RBAC**
**Objectif :** tables + relations minimales pour Desktop (Agences/Consultants/Admin/Clients) + Mobile Worker (PWA) + Compliance Case + Finance + Vault.

**Principe :** toutes les tables métiers contiennent `tenant_id` + timestamps. Les décisions critiques sont **versionnées** + **auditables**.

## 2.9.1 - Conventions (obligatoires)

### Champs communs (toutes tables métiers sauf tables `ref_*`)

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)
- `created_by` (uuid, nullable, FK → `users.id`)
- `updated_by` (uuid, nullable, FK → `users.id`)

### Règles

- Indexer `tenant_id` sur toutes les tables
- FK `ON DELETE`: `RESTRICT` par défaut (sauf tables de jointure)
- RLS: `tenant_id = auth.tenant_id` (si Supabase)
- Toutes les dates légales/règles: **versionnées** (`effective_from` / `effective_to`)

### Types (enums logiques)

- `role_type`: `platform_admin` | `tenant_admin` | `agency_user` | `consultant` | `client_user` | `worker`
- `lead_status`: `new` | `contacted` | `qualified` | `won` | `lost`
- `rfp_status`: `draft` | `sent` | `receiving` | `closed` | `awarded` | `cancelled`
- `application_status`: `new` | `screened` | `shortlisted` | `approved` | `rejected` | `hired`
- `mission_status`: `planned` | `active` | `completed` | `cancelled`
- `compliance_status`: `draft` | `in_progress` | `compliant` | `warning` | `blocked` | `archived`
- `a1_status`: `not_requested` | `pending` | `issued` | `expired` | `rejected`
- `invoice_status`: `draft` | `issued` | `blocked` | `paid` | `void`
- `quote_status`: `draft` | `sent` | `accepted` | `rejected` | `expired`
- `doc_status`: `valid` | `expiring` | `expired` | `missing` | `rejected`
- `check_event_type`: `check_in` | `check_out`

---

## 2.9.2 - Core — Tenant / Users / RBAC / Audit

### `tenants`

- `id` (uuid PK)
- `name`
- `slug`
- `default_language` (FR/EN/PL/RO)
- `country_host_default` (ex: FR)
- `created_at`, `updated_at`

### `users`

- `id` (uuid PK)
- `tenant_id` (FK)
- `email` (unique per tenant)
- `full_name`
- `role_type` (enum)
- `language`
- `phone` (nullable)
- `is_active` (bool)
- `last_login_at` (nullable)

### `roles` *(optionnel si RBAC avancé)*

- `id`, `tenant_id`
- `name`
- `description`

### `permissions` *(référence)*

- `id`
- `code` (ex: `mission.read`, `invoice.issue`)
- `description`

### `role_permissions` *(join)*

- `id`, `tenant_id`
- `role_id` (FK)
- `permission_id` (FK)

### `user_roles` *(join)*

- `id`, `tenant_id`
- `user_id` (FK)
- `role_id` (FK)

### `audit_logs` *(IMMUTABLE)*

- `id`, `tenant_id`
- `actor_user_id` (FK `users`)
- `action` (string) (ex: `mission.create`)
- `entity_type` (string) (ex: `mission`)
- `entity_id` (uuid)
- `ip_address` (nullable)
- `user_agent` (nullable)
- `metadata` (jsonb)
- `created_at` (timestamptz) *(pas de `updated_at` volontaire)*

### `notification_events` *(trace d’orchestration)*

- `id`, `tenant_id`
- `event_type` (EmailSent/PdfGenerated/ReminderTriggered)
- `related_entity_type`, `related_entity_id`
- `payload` (jsonb)
- `created_at`

---

## 2.9.3 - CRM — Leads / Clients / Contacts / Activités

### `leads`

- `id`, `tenant_id`
- `owner_user_id` (FK `users`) *(consultant/agence)*
- `status` (`lead_status`)
- `company_name`
- `country`
- `sector` (string)
- `corridor_target` (ex: PL->FR) *(nullable)*
- `score_manual` (int 0-100, nullable)
- `score_ai` (int 0-100, nullable)
- `source` (string)
- `notes` (text, nullable)

### `lead_activities`

- `id`, `tenant_id`
- `lead_id` (FK `leads`)
- `type` (call/email/meeting/note)
- `occurred_at`
- `summary`
- `next_step` (nullable)

### `clients`

- `id`, `tenant_id`
- `name`
- `legal_form` (nullable)
- `siret` (nullable)
- `vat_number` (nullable)
- `billing_email` (nullable)
- `account_owner_user_id` (FK `users`)
- `status` (active/inactive)
- `default_language`

### `client_sites`

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `name`
- `address_line1`, `address_line2`, `city`, `postal_code`, `country`
- `is_primary` (bool)

### `contacts`

- `id`, `tenant_id`
- `client_id` (nullable FK `clients`)
- `lead_id` (nullable FK `leads`)
- `full_name`
- `email`
- `phone` (nullable)
- `role_title` (nullable)

### `client_documents` *(VIGILANCE)*

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `doc_type` (kbis/insurance/urssaf/other)
- `doc_status` (`doc_status`)
- `valid_from`, `valid_to` (nullable)
- `file_id` (FK `files`, nullable)
- `notes` (nullable)

---

## 2.9.4 - RFP Interne — Mise en concurrence agences

### `rfp_requests`

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `site_id` (FK `client_sites`, nullable)
- `created_by_user_id` (FK `users`)
- `status` (`rfp_status`)
- `corridor_origin_country`
- `corridor_host_country`
- `sector`
- `job_title`
- `headcount` (int)
- `start_date`, `end_date`
- `weekly_hours`
- `requirements` (jsonb) *(langues, permis, etc.)*

### `rfp_invites`

- `id`, `tenant_id`
- `rfp_id` (FK `rfp_requests`)
- `agency_tenant_id` (uuid) *(tenant agence invitée)*
- `invited_at`
- `status` (sent/opened/responded/declined)

### `rfp_responses`

- `id`, `tenant_id`
- `rfp_id` (FK `rfp_requests`)
- `agency_tenant_id`
- `price_model` (hourly/daily/fixed)
- `proposed_rate` (numeric)
- `availability_notes` (text)
- `compliance_snapshot` (jsonb) *(option: indicateurs)*
- `status` (draft/submitted)

### `rfp_comparison_scores`

- `id`, `tenant_id`
- `rfp_id`
- `agency_tenant_id`
- `score_total` (0-100)
- `score_breakdown` (jsonb)
- `model_version` (string)
- `calculated_at`

### `rfp_allocations`

- `id`, `tenant_id`
- `rfp_id`
- `agency_tenant_id`
- `allocation_status` (proposed/confirmed/declined/reallocated)
- `decided_by_user_id` (FK `users`)
- `decided_at`

---

## 2.9.5 - ATS — Annonces / Candidatures / IA (assistée)

### `job_offers`

- `id`, `tenant_id`
- `created_by_user_id`
- `title`
- `sector`
- `corridor_origin_country`
- `corridor_host_country`
- `location` (string)
- `start_date`, `end_date`
- `description` (text)
- `status` (draft/published/closed)

### `candidates`

- `id`, `tenant_id`
- `first_name`, `last_name`
- `email`, `phone`
- `nationality` (nullable)
- `languages` (jsonb)
- `mobility` (jsonb)
- `parsed_profile` (jsonb) *(extraction CV)*
- `risk_flags` (jsonb) *(incohérences détectées)*
- `created_from` (manual/import/api)

### `applications`

- `id`, `tenant_id`
- `job_offer_id` (FK `job_offers`)
- `candidate_id` (FK `candidates`)
- `status` (`application_status`)
- `ai_score` (0-100, nullable)
- `ai_score_explanation` (jsonb, nullable) *(explicabilité)*
- `reviewer_user_id` (FK `users`, nullable)
- `shortlist_for_client` (bool)

---

## 2.9.6 - Workers — Dossier intérimaire + Docs

### `workers`

- `id`, `tenant_id`
- `external_id` (nullable)
- `first_name`, `last_name`
- `birth_date` (nullable)
- `nationality`
- `language`
- `email` (nullable), `phone` (nullable)
- `address` (jsonb, nullable)
- `status` (active/inactive)

### `worker_documents`

- `id`, `tenant_id`
- `worker_id` (FK `workers`)
- `doc_type` (id/passport/work_permit/medical/other)
- `doc_status` (`doc_status`)
- `valid_from`, `valid_to` (nullable)
- `file_id` (FK `files`, nullable)
- `notes` (nullable)

### `worker_skills` *(option V1 si utile)*

- `id`, `tenant_id`
- `worker_id`
- `skill_name`
- `level` (1-5)

---

## 2.9.7 - Missions + Timesheets + Check-in/Check-out (mobile)

### `missions`

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `site_id` (FK `client_sites`, nullable)
- `worker_id` (FK `workers`)
- `status` (`mission_status`)
- `sector`
- `job_title`
- `corridor_origin_country`
- `corridor_host_country`
- `start_date`, `end_date`
- `weekly_hours`
- `planned_paid_hours` (nullable)
- `notes` (nullable)

### `timesheets`

- `id`, `tenant_id`
- `mission_id` (FK `missions`)
- `period_start`, `period_end`
- `status` (draft/submitted/validated/rejected)
- `validated_by_user_id` (nullable)
- `total_hours` (numeric)
- `created_by` (user)
- `billing_status` (enum: not_billed | billed | disputed, default not_billed)
- `invoice_id` (uuid, nullable, FK → invoices.id) **(recommandé en C1)**

### `timesheet_entries`

- `id`, `tenant_id`
- `timesheet_id` (FK `timesheets`)
- `work_date`
- `hours` (numeric)
- `notes` (nullable)

### `worker_check_events` *(mobile)*

- `id`, `tenant_id`
- `mission_id` (FK `missions`)
- `worker_id` (FK `workers`)
- `event_type` (`check_event_type`)
- `occurred_at` (timestamptz)
- `source` (mobile/web)
- `metadata` (jsonb) *(option V2: geo)*

> Doit alimenter `audit_logs` via event
> 

### `mission_incidents` *(minimal V1)*

- `id`, `tenant_id`
- `mission_id`
- `type` (absence/accident/noncompliance/other)
- `occurred_at`
- `description`

---

## 2.9.8 - Compliance Case (cœur) + A1 + Checklists + Durée

### `compliance_cases`

- `id`, `tenant_id`
- `mission_id` (FK `missions`, **unique**) *(1 mission = 1 compliance case)*
- `status` (`compliance_status`)
- `corridor_origin_country`
- `corridor_host_country`
- `sector`
- `idcc_code` (string, nullable) *(FR host)*
- `classification_code` (string, nullable) *(coeff/grade)*
- `cumulative_duration_days` (int, default 0)
- `representative_in_fr` (bool, nullable)
- `last_reviewed_at` (nullable)

### `country_rulesets` *(versionnées)*

- `id`
- `country_code` (FR/PT/RO/PL)
- `version` (string) *(ex: 2026.01)*
- `effective_from`
- `effective_to` (nullable)
- `rules` (jsonb) *(exigences, champs, alertes)*
- `created_at`

### `compliance_requirements` *(dynamiques)*

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `requirement_code` (string) *(ex: A1_REQUIRED, SIPSI_DECLARATION, HOST_REPRESENTATIVE)*
- `requirement_label` (i18n_key ou texte)
- `status` (pending/provided/approved/rejected)
- `due_date` (nullable)
- `provided_file_id` (FK `files`, nullable)
- `notes` (nullable)

### `a1_requests` *(assisté V1)*

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `origin_country` (PT/RO/PL/FR)
- `status` (`a1_status`)
- `requested_at` (nullable)
- `issued_at` (nullable)
- `expires_at` (nullable)
- `rejection_reason` (nullable)
- `file_id` (FK `files`, nullable)

### `expense_items` *(Frais vs salaire — justificatifs probatoires)*

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `type` (housing/transport/meals/perdiem/other)
- `amount` (numeric)
- `currency` (string, default EUR)
- `is_reimbursable` (bool, default true)
- `justification_file_id` (FK `files`, nullable)
- `occurred_from`, `occurred_to` (nullable)
- `notes` (nullable)

### `remuneration_inputs`

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `base_salary_amount` (numeric)
- `base_salary_frequency` (hourly/monthly)
- `paid_hours` (numeric, nullable)
- `bonuses` (jsonb) *(liste typée)*
- `allowances` (jsonb) *(liste typée)*

### `worker_remuneration_snapshot` *(IMMUTABLE)*

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `legal_minimum_amount` (numeric)
- `legal_minimum_unit` (hourly/monthly)
- `eligible_remuneration_amount` (numeric)
- `excluded_expenses_amount` (numeric)
- `is_compliant` (bool)
- `calculation_details` (jsonb)
- `engine_version` (string)
- `calculated_at` (timestamptz)

> Pas de `updated_at`
> 

### `compliance_scores`

- `id`, `tenant_id`
- `compliance_case_id` (FK `compliance_cases`)
- `total_score` (int 0-100)
- `breakdown` (jsonb)
- `scoring_model_version` (string)
- `last_calculated_at`

### `mission_enforcement_flags`

- `id`, `tenant_id`
- `mission_id` (FK `missions`)
- `can_activate_mission` (bool)
- `can_validate_timesheets` (bool)
- `can_issue_invoice` (bool)
- `blocking_reasons` (jsonb) *(reasons lisibles)*
- `last_evaluated_at`

---

## 2.9.9 - IDCC / Salary Grids (FR) — V1 (BTP / Métallurgie / Transport)

### `idcc_conventions`

- `id`
- `idcc_code` (string) *(ex: 1596)*
- `name`
- `sector`
- `created_at`

### `salary_grids` *(versionnées)*

- `id`
- `idcc_code` (FK → `idcc_conventions.idcc_code`)
- `classification_code` (string) *(ex: coeff 210 / niveau)*
- `minimum_amount` (numeric)
- `unit` (hourly/monthly)
- `currency` (EUR)
- `effective_from`
- `effective_to` (nullable)
- `source_ref` (string/url/text)
- `created_at`

### `mandatory_pay_items` *(option V1 : primes/indemnités obligatoires versionnées)*

- `id`
- `idcc_code`
- `item_code` (string)
- `label`
- `calculation_type` (fixed/percent/conditional)
- `amount_or_rate` (numeric)
- `unit` (EUR/%)
- `conditions` (jsonb)
- `effective_from`
- `effective_to` (nullable)

---

## 2.9.10 - Finance — Devis / Factures / Paiements minimaux / Commissions

### `quotes`

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `mission_id` (nullable FK `missions`) *(option: devis lié mission)*
- `status` (`quote_status`)
- `quote_number` (string)
- `currency` (EUR)
- `subtotal`, `tax_total`, `total`
- `issued_at` (nullable)
- `accepted_at` (nullable)

### `quote_lines`

- `id`, `tenant_id`
- `quote_id` (FK `quotes`)
- `description`
- `quantity` (numeric)
- `unit_price` (numeric)
- `total` (numeric)

### `invoices`

- `id`, `tenant_id`
- `client_id` (FK `clients`)
- `mission_id` (FK `missions`, nullable)
- `status` (`invoice_status`)
- `invoice_number`
- `currency`
- `subtotal`, `tax_total`, `total`
- `issued_at` (nullable)
- `due_at` (nullable)
- `paid_at` (nullable)
- `blocked_reason` (jsonb, nullable)
- `timesheet_id`(uuid, nullable, FK → timesheets.id)
- `issued_by_user_id`(uuid, nullable, FK → users.id)
- `blocked_at`(timestamptz, nullable)
- `blocked_by_user_id`(uuid, nullable, FK → users.id)
- `unique`(tenant_id, invoice_number)

### `invoice_lines`

- `id`, `tenant_id`
- `invoice_id` (FK `invoices`)
- `description`
- `quantity`
- `unit_price`
- `total`

### `payments` *(minimal V1)*

- `id`, `tenant_id`
- `invoice_id` (FK `invoices`)
- `amount`
- `paid_at`
- `method` (bank/card/other)
- `reference` (nullable)
- `created_at`

### `accounting_exports` *(minimal V1)*

- `id`, `tenant_id`
- `export_type` (pennylane|sage|ebp|csv)
- `periode_start` , `periode_end`
- `status` (draft|generated|sent|failed)
- `file_id` (FK files, nullable)
- `created_at`

### `consultant_commissions`

- `id`, `tenant_id`
- `consultant_user_id` (FK `users`)
- `invoice_id` (FK `invoices`)
- `commission_rate` (numeric) *(ex: 0.70)*
- `commission_amount` (numeric)
- `status` (pending/approved/paid)

---

## 2.9.11 - Vault — Files + Hashing + Access Logs + Links

### `files`

- `id`, `tenant_id`
- `storage_provider` (supabase/s3)
- `bucket`
- `path`
- `filename`
- `mime_type`
- `size_bytes`
- `sha256_hash`
- `encrypted` (bool, default true)
- `created_at`
- `created_by` (user)

### `file_links` *(relier un fichier à n’importe quelle entité)*

- `id`, `tenant_id`
- `file_id` (FK `files`)
- `entity_type` (string) *(worker, mission, compliance_case, a1_request, client_document…)*
- `entity_id` (uuid)
- `purpose` (string) *(proof/contract/id/payslip/etc)*

### `file_access_logs` *(IMMUTABLE)*

- `id`, `tenant_id`
- `file_id` (FK `files`)
- `actor_user_id` (FK `users`, nullable)
- `access_type` (view/download/delete_attempt)
- `occurred_at`
- `metadata` (jsonb)

---

## 2.9.12 - Marketplace (V1 contrôlée) — Certification / Ranking / Accès

### `agency_risk_scores`

- `id`, `tenant_id`
- `risk_score` (0-100)
- `breakdown` (jsonb)
- `model_version`
- `calculated_at`

### `agency_certifications`

- `id`, `tenant_id`
- `certification_type` (auto/internal_review/external_audit)
- `certification_level` (low_risk/controlled/monitoring_required)
- `status` (active/suspended/revoked)
- `valid_until` (nullable)
- `public_token` (nullable)
- `model_version`
- `updated_at`

### `marketplace_access`

- `id`, `tenant_id`
- `access_level` (none/certified/premium)
- `status` (active/suspended)
- `certification_id` (FK `agency_certifications`, nullable)
- `updated_at`

### `agency_marketplace_ranking`

- `id`, `tenant_id`
- `ranking_score` (0-100)
- `breakdown` (jsonb)
- `ranking_model_version`
- `calculated_at`

---

## 2.9.13 - i18n (minimum V1)

### `i18n_terms` *(glossaire juridique harmonisé)*

- `id`
- `key` (string) *(ex: compliance.blocked.salary_below_min)*
- `locale` (FR/EN/PL/RO)
- `value` (text)

### `email_templates`

- `id`, `tenant_id` *(nullable si global)*
- `key`
- `locale`
- `subject`
- `body_html`
- `body_text`

---

## 2.9.14 - Relations clés (résumé)

- Tenant 1—N Users
- Client 1—N Sites
- Client 1—N Documents (vigilance)
- Mission N—1 Client, N—1 Worker
- Mission 1—1 Compliance Case
- Compliance Case 1—N Requirements, 1—N A1 Requests
- Compliance Case 1—N Expense Items, 1—1 Remuneration Inputs, 1—N Snapshots, 1—N Scores
- Mission 1—N Timesheets, 1—N Check Events
- Invoices/Quotes N—1 Client, optionally N—1 Mission
- Files N—N Entities via File Links
- Marketplace Access/Certification/Ranking/Risk liés au tenant (agence)

**FIN SCHÉMA V1**

## 2.9.15 — Patch V1.1 (Correctifs & Ajouts validés)

**Objectif :** renforcer le schéma DB V1 pour un SaaS multi-tenant RegTech **piloté par IA**, en évitant les dérives (no-code), en améliorant l’auditabilité et en rendant l’outil réellement exploitable (identifiants métiers, tasks, outbox events, soft delete).

---

### 2.9.15.1 — Nouveaux objets (tables) à AJOUTER

### A) `tenant_settings` (Feature flags & configuration tenant)

**But :** activer/désactiver modules et comportements (marketplace, niveau enforcement, langues, V1/V2 assisté/auto…) par tenant.

- `id` (uuid, PK)
- `tenant_id` (uuid, unique, FK → `tenants.id`)
- `settings` (jsonb)
Exemples de clés :
    - `modules.marketplace.enabled` (bool)
    - `modules.worker_app.enabled` (bool)
    - `compliance.enforcement.level` (string: soft|standard|strict)
    - `i18n.locales` (array: ["fr","en","pl","ro"])
    - `v1_mode.assisted_only` (bool)
- `created_at`, `updated_at`
- `created_by`, `updated_by`

**Contraintes :**

- unique(`tenant_id`)
- index(`tenant_id`)

---

### B) `agency_profiles` (profil agence — 1 par tenant agence)

**But :** isoler les informations “agence” (marketplace / légal / contact / affichage), sans surcharger `tenants`.

- `id` (uuid, PK)
- `tenant_id` (uuid, unique, FK → `tenants.id`)
- `legal_name` (string)
- `trade_name` (nullable)
- `country_code` (FR/PT/RO/PL/…)
- `vat_number` (nullable)
- `tax_id` (nullable) *(ex: NIP, CIF, etc.)*
- `registration_id` (nullable) *(ex: KRAZ, registre local…)*
- `contact_email` (nullable)
- `phone` (nullable)
- `address` (jsonb, nullable)
- `status` (active/inactive/suspended)
- `created_at`, `updated_at`
- `created_by`, `updated_by`

**Contraintes :**

- unique(`tenant_id`)
- index(`tenant_id`)
- index(`country_code`, `status`) (optionnel)

---

### C) `events_outbox` (Event-driven fiable, anti-chaos no-code)

**But :** source fiable d’événements métier à consommer par Make/n8n, notifications, génération PDF, webhooks… (pattern outbox).

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `event_type` (string) *(ex: MissionCreated, ComplianceBlocked, InvoiceIssued…)*
- `entity_type` (string)
- `entity_id` (uuid)
- `payload` (jsonb)
- `status` (pending/sent/failed)
- `retries` (int, default 0)
- `last_error` (text, nullable)
- `created_at`
- `sent_at` (nullable)

**Règles :**

- Produit uniquement par backend
- Consommé par no-code/notifications
- Rejouable (retries) + audit-able (last_error)

---

### D) `tasks` (to-do opérationnel V1 : CRM + conformité + relances)

**But :** ne pas dépendre de “notes” et emails → pilotage concret des actions (A1, pièces manquantes, relances client…).

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `title` (string)
- `description` (text, nullable)
- `status` (todo/in_progress/done/cancelled)
- `priority` (low/medium/high/urgent)
- `due_at` (timestamptz, nullable)
- `assigned_to_user_id` (uuid, nullable, FK → `users.id`)
- `created_by_user_id` (uuid, nullable, FK → `users.id`)
- `entity_type` (string, nullable) *(lead/client/mission/compliance_case/a1_request/…)*
- `entity_id` (uuid, nullable)
- `tags` (jsonb, nullable)
- `created_at`, `updated_at`

**Règles :**

- Une task peut être liée à n’importe quel objet métier (entity_type/entity_id)
- Les relances A1 / pièces manquantes doivent être traçables en tasks

---

### 2.9.15.2 — Champs à AJOUTER (identifiants métiers + liaisons utiles)

### A) Identifiants métiers (support / audit / UX / exports)

Ajouter des numéros uniques par tenant :

- `missions.mission_number` (string, unique par tenant)
- `compliance_cases.case_number` (string, unique par tenant)
- `rfp_requests.rfp_number` (string, unique par tenant)

**Contraintes :**

- unique(`tenant_id`, `mission_number`)
- unique(`tenant_id`, `case_number`)
- unique(`tenant_id`, `rfp_number`)

---

### B) Conversion Lead → Client (clarifier le cycle)

Ajouter :

- `leads.converted_client_id` (uuid, nullable, FK → `clients.id`)
- `leads.converted_at` (timestamptz, nullable)

**Règle :**

- si `converted_client_id` non null → lead “won” recommandé (mais pas obligatoire)

---

### C) Facturation ↔ Timesheets (source de vérité)

Ajouter :

- `timesheets.billing_status` (not_billed/billed/disputed) *(default not_billed)*
- `invoices.timesheet_id` (uuid, nullable, FK → `timesheets.id`)

**Règle :**

- une facture “temps réel” doit pointer vers le timesheet (ou vers une période) pour audit.

---

### 2.9.15.3 — Vault : politique de suppression (probatoire)

### A) Soft delete sur `files`

Ajouter :

- `files.deleted_at` (timestamptz, nullable)
- `files.deleted_by` (uuid, nullable, FK → `users.id`)
- `files.delete_reason` (text, nullable)

**Règles :**

- suppression physique interdite en V1 (sauf procédure admin “purge” hors produit)
- toute tentative doit être loggée (audit_logs + file_access_logs)

---

### 2.9.15.4 — Index recommandés (performance dashboards)

À documenter pour implémentation ultérieure (SQL/migrations) :

- index `(tenant_id, status)` sur : `missions`, `compliance_cases`, `invoices`, `applications`, `rfp_requests`, `tasks`
- index `(tenant_id, created_at)` sur : tables à listing (leads, tasks, missions, invoices, events_outbox)
- index `(tenant_id, entity_type, entity_id)` sur : `events_outbox` + `tasks`

---

### 2.9.15.5 — Note contract-first (important)

- Toute table / champ ajouté dans ce patch implique :
    - migration versionnée
    - mise à jour OpenAPI V1
    - mise à jour Events métier V1 (si impact)
    - mise à jour RBAC matrix (si impact)

**Fin Patch V1.1**

---

## 2.9.16 — Patch V1.2 (Correctifs & Ajouts — décisions OWNER 2026-02-20)

Référence décisions: Q2-B, Q3-A, Q5-B, Q6-B, Q7-C, Q8-C, Q9-A, Q10-A+B.

---

### A) `rfp_contact_logs` (anti-désintermédiation — Q6-B)

**But :** tracer les contacts entre agences et clients post-RFP pour faire valoir la période de protection contractuelle.

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `rfp_id` (uuid, FK → `rfp_requests.id`)
- `contact_type` (enum: email|phone|meeting|platform_message)
- `counterpart_tenant_id` (uuid) — agence ou client contacté
- `occurred_at` (timestamptz)
- `protection_expires_at` (timestamptz) — calculé: `occurred_at + 365 jours`
- `notes` (text, nullable)
- `created_by_user_id` (uuid, FK → `users.id`)
- `created_at` (timestamptz)

**Index recommandés:**
- `(tenant_id, rfp_id)`
- `(tenant_id, protection_expires_at)` — pour alertes de fin de période

---

### B) `sipsi_declarations` (formulaire SIPSI structuré — Q10-A+B)

**But :** stocker les déclarations SIPSI assistées V1 (formulaire + preuves uploadées).

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `compliance_case_id` (uuid, FK → `compliance_cases.id`)
- `employer_name` (string)
- `employer_country` (string: PT|RO|PL|FR)
- `employer_registration_id` (string)
- `host_site_address` (text)
- `worker_ids` (jsonb — array of uuid)
- `planned_start_date` (date)
- `planned_end_date` (date)
- `representative_in_fr_name` (string)
- `representative_in_fr_contact` (string)
- `declaration_date` (date)
- `status` (enum: draft|submitted|acknowledged)
- `proof_file_ids` (jsonb — array of file_id, preuves uploadées Q10-B)
- `created_by_user_id` (uuid, FK → `users.id`)
- `created_at`, `updated_at` (timestamptz)

**Règle:** la création d'un `sipsi_declarations` crée automatiquement un `compliance_requirement` { requirement_code: SIPSI_DECLARATION }.

**Index recommandés:**
- `(tenant_id, compliance_case_id)`
- `(tenant_id, status)`

---

### C) `worker_push_subscriptions` (Web Push natif — Q3-A)

**But :** stocker les abonnements push navigateur (Web Push API, sans FCM).

- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `worker_id` (uuid, FK → `workers.id`)
- `endpoint` (text) — URL du service push navigateur
- `keys_p256dh` (text) — clé publique chiffrée
- `keys_auth` (text) — secret d'authentification chiffré
- `is_active` (bool, default true)
- `created_at`, `updated_at` (timestamptz)

**Contraintes:**
- `unique(tenant_id, worker_id)` — 1 abonnement actif par worker
- Champs `keys_*` chiffrés au repos (AES-256-GCM, cohérent avec baseline 10.D)

---

### D) `worker_skills` — retrait de "(option V1)" (Q9-A)

**Décision:** table `worker_skills` livrée en V1 (n'est plus optionnelle).

Définition inchangée par rapport à 2.9.6:
- `id` (uuid, PK)
- `tenant_id` (uuid, index, FK → `tenants.id`)
- `worker_id` (uuid, FK → `workers.id`)
- `skill_name` (string)
- `level` (integer 1-5)
- `created_at`, `updated_at` (timestamptz)

**Contrainte ajoutée:** `unique(tenant_id, worker_id, skill_name)` — pas de doublon skill par worker.

---

### E) `rfp_requests` — ajout champ `visibility` (Q5-B)

**Ajouter à la table `rfp_requests` existante:**
- `visibility` (enum: private|public, default private)

**Règle d'enforcement:** si `visibility=public` et `marketplace_access.status != active` → 422 `marketplace_access_required`.

---

### F) Durée cumulée mission — clarification champ (Q7-C)

**Clarification du champ `compliance_cases.cumulative_duration_days`:**

- **Périmètre:** cumul par worker × mission individuelle (chaque mission a sa propre durée).
- **Calcul:** jours calendaires entre `missions.start_date` et `missions.end_date` (ou date du jour si mission active).
- **Alertes:**
  - `cumulative_duration_days >= 300` → event `ComplianceDurationAlert` reason `DURATION_WARNING_300` (non-bloquant)
  - `cumulative_duration_days >= 365` → enforcement flag `can_activate_mission=false`, reason `DURATION_EXCEEDED_365`
- **Recalcul:** batch nocturne + à chaque modification de `missions.end_date`.

---

### G) Convention de nommage — code neutre (Q8-C)

**Règle gravée (non-table):** aucune référence à une marque dans le code.
- Interdit: "yojob", "YoJob" dans routes, variables, noms de tables, clés i18n, fichiers config.
- Convention: nommage par domaine fonctionnel uniquement (ex: `tenants`, `workers`, `compliance_cases`).
- Branding = V2 uniquement — aucune table `platform_settings` en V1.

---

### 2.9.16 — Index recommandés (nouvelles tables)

- `(tenant_id, rfp_id)` sur `rfp_contact_logs`
- `(tenant_id, protection_expires_at)` sur `rfp_contact_logs`
- `(tenant_id, compliance_case_id)` sur `sipsi_declarations`
- `(tenant_id, status)` sur `sipsi_declarations`
- `(tenant_id, worker_id)` sur `worker_push_subscriptions`
- `(tenant_id, worker_id, skill_name)` sur `worker_skills`

### 2.9.16 — Note contract-first (important)

- Toute table / champ ajouté dans ce patch implique:
  - migration versionnée
  - mise à jour OpenAPI V1.2 PATCH (déjà fait dans 2.11.a)
  - mise à jour Events métier (déjà fait dans 2.10 addendum)
  - mise à jour RBAC (déjà fait dans 2.12.a)

**Fin Patch V1.2**
