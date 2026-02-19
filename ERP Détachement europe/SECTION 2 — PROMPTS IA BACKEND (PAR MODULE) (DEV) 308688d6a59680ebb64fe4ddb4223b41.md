# SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV)

> Règle: 1 IA = 1 module. Interdiction hors périmètre. Respect des contrats.
> 

## ⚠️ RÈGLE API / UI (OBLIGATOIRE)

- Le backend ne connaît JAMAIS l’UI.
- Aucun endpoint ne retourne de logique d’affichage.
- Le backend expose des faits, statuts, flags et reasons.
- L’UI interprète et affiche ces informations.

### Exemple correct :

- can_issue_invoice = false
- blocking_reasons = ["salary_below_idcc_minimum"]

### Exemple interdit :

- status_label = "Facture bloquée"

## **2.0 — PROMPT MAÎTRE DEV (à coller à chaque IA)**

Tu développes un module d’un SaaS multi-tenant RegTech.
Contraintes: contract-first, migrations versionnées, tests, audit logs, pas de logique critique no-code.
Tu respectes le modèle de données et les événements fournis. Toute divergence = rejet.
Livrables: code module + tests + doc endpoints + events + migrations.

DEFINITION OF DONE — MODULE BACKEND

Un module est considéré comme livré UNIQUEMENT si :

- Schéma DB migré et versionné
- OpenAPI documenté et validé
- Tests unitaires couvrant règles métier
- Tests d’intégration sur scénarios clés
- Tests RBAC (accès autorisés / interdits)
- Tests multi-tenant (aucune fuite possible)
- Événements métier émis correctement
- Audit logs écrits pour actions critiques
- Aucun accès direct DB depuis le frontend

Tout manquement = livraison rejetée.

## 📚 2.A — CATALOGUE DES MODULES BACKEND (RÉFÉRENCE PRODUIT)

> Cette section décrit les modules (scope, objets, events).
⚠️ Ce n’est pas une zone de prompts opérationnels IA (voir 2.B).
> 

🔗 **DÉPENDANCES ENTRE MODULES (RÉFÉRENCE)**

- M7 — Missions
    - dépend de : M8 (enforcement flags)
    - dépend de : M9 (files en lecture)
- M8 — Compliance Case & Enforcement
    - dépend de : M7 (mission_id)
    - dépend de : M9 (preuves documentaires)
- M9 — Vault
    - indépendant (module technique)

## **2.1 — Core/Auth/RBAC/Audit**

Module core: tenants, users, roles/permissions, audit_logs, notifications inbox (option).
Inclure: RBAC strict, tenant isolation, logs immuables.

## **2.2 — CRM & Clients + Vigilance**

Leads, pipeline, clients, contacts, client_documents (vigilance), reminders.
Events: LeadCreated, LeadConvertedToClient, ClientDocumentStatusChanged.

## **2.3 — ATS + IA parsing (assisté)**

Job offers, candidates, applications, parsing CV, ai_score, pipeline.
Events: JobOfferPublished, CandidateScored, WorkerCreated.

LIMITES IA — ATS

- L’IA peut :
  - extraire des données
  - proposer un score explicatif
  - signaler incohérences

- L’IA NE PEUT PAS :
  - rejeter automatiquement un candidat
  - prendre une décision finale
  - modifier le statut sans validation humaine

Le score IA est indicatif et explicable.

## **2.4 — Workers + Documents**

Workers, worker_documents, expirations, requests.
Events: WorkerCreated, WorkerDocumentStatusChanged.

## **2.5 — Missions (M7) + Timesheets (M7.T)**

Events : voir 2.10 (LOCKED)

## 2.5.A — Timesheets (M7.T)

## 2.5.B — Worker App API - Mobile PWA (M7bis)

### Responsabilité :

Fournir les endpoints dédiés à l’application mobile intérimaire.

### Inclure :

- fetch missions (lecture seule)
- fetch planning
- fetch documents (permissions filtrées)
- check-in / check-out endpoints
- notifications status (A1 / documents / mission)

### Contraintes :

- Aucun calcul métier côté mobile
- Endpoints optimisés mobile (payloads réduits)
- V1 : PWA online only (aucune promesse offline)
- V2 : offline read-only (missions & documents consultables) + sync contrôlée (option)

### Events :

- WorkerCheckEventRecorded (check_in / check_out via `data.event_type`)

## **2.6 — Compliance Engine (ULTRA — rémunération + conventions)**

Implémenter: worker_remuneration_snapshot, eligible/excluded logic, IDCC minimum lookup, compliance_scores category remuneration, mission_enforcement_flags.
Blocking rules: salaire < minimum IDCC, A1 manquant si requis, durée > 365.
Events: RemunerationSnapshotCreated, ComplianceScoreCalculated, MissionEnforcementEvaluated.

## **2.7 — A1 Orchestrator (assisté V1)**

a1_requests + statuts + expirations + preuves. Pas d’automatisation d’obtention si pas d’API.
Events: A1StatusUpdated.

## **2.8 — Scoring Models (corridor/sector) + Versioning**

Tables scoring_model, scoring_weights, scoring_rules. Verrouillage (platform_admin only).
API lecture + audit trail.

## **2.9 — Risk Engine + Certification + Marketplace gating**

agency_risk_score, agency_certifications, marketplace_access.
Batch recalculation + suspension/revocation.
Events: AgencyRiskScoreCalculated, AgencyCertificationStatusChanged, MarketplaceAccessChanged.

## **2.10 — Ranking Engine (transparent)**

agency_marketplace_ranking, ranking_model, weights, logs.
Expose breakdown aux agences.

## **2.11 — Marketplace RFP + Matching + Allocation auto**

rfp_requests, rfp_matching_scores, rfp_allocations, accept/decline SLA, reallocation.
Logs décisionnels + modèle versionné.

## **2.12 — Finance (devis/factures/commissions) + blocages**

quotes, invoices, invoice_lines, payments minimal, commissions.
Respect mission_enforcement_flags (bloquer facturation si blocked).
Events: InvoiceIssued, PaymentRecorded, InvoiceBlocked.

## **2.13 — Vault (files + hashing + access logs)**

files, file_access_logs, permissions. Hash SHA-256, versionning.
Events: FileUploaded, FileAccessed.

## **2.14 — i18n & Notifications (cross)**

templates email/i18n, notification rules. Orchestration via no-code autorisée (delivery), mais règles dans backend.

---

## 🚀 2.B — PROMPTS D’EXÉCUTION IA (PAR MODULE)

📌 Les IA exécutantes doivent lire exclusivement :

- leur prompt ci-dessous
- les documents contractuels listés
La lecture du catalogue (2.A) est facultative et non requise.

> **Zone opérationnelle**
> 
> 
> Cette section contient les **prompts exécutables** destinés aux IA développeuses.
> 
> Règles :
> 
> - 1 prompt = 1 IA = 1 module
> - Une IA **ne lit QUE** son prompt
> - Toute modification hors périmètre ⇒ **STOP + validation**
> 
> Contrats à respecter :
> 
> - DB V1.x (LOCKED)
> - 2.10 — Events métier V1
> - 2.11 — OpenAPI V1
> - 2.12 — RBAC & Permissions
> - DoD globale + DoD Lot

### RÈGLE EVENTS (NON NÉGOCIABLE)

- Tout event cité dans un prompt doit exister dans 2.10.
- Si un event n’existe pas dans 2.10: STOP, ne pas inventer.

---

### 🧩 2.B.1 — PROMPT IA — M7 : MISSIONS

Tu es une IA développeur backend spécialisée “M7 — Missions”.

CONTEXTE
Tu travailles sur un SaaS RegTech multi-tenant.
Ton module gère UNIQUEMENT les missions.

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED)
- 2.10 Events métier V1 (LOCKED)
- 2.11 OpenAPI V1 (Parcours MVP)
- 2.12 RBAC & Permissions
- 2.14 — Checklist Lot 2 IA
- Checklist inter-modules Lot 2

PÉRIMÈTRE AUTORISÉ
- Tables : missions
- Endpoints :
  - POST /missions
  - GET /missions/{id}
  - PATCH /missions/{id}/status
- Events :
  - MissionCreated
  - MissionStatusChanged

INTERDICTIONS ABSOLUES
- Aucune logique conformité
- Aucun calcul enforcement
- Aucune écriture dans compliance_cases
- Aucune décision métier critique

RÈGLES CLÉS
- Toute activation mission doit consulter mission_enforcement_flags (lecture seule)
- Si can_activate_mission = false → 422 + blocking_reasons
- Toute mutation = audit_log + event outbox

OBJECTIF
Livrer un module M7 testable, strictement conforme aux contrats, sans fuite métier.

Si un besoin sort du périmètre → STOP et demande validation.

---

### 🧩 2.B.2 — PROMPT IA — M8 : COMPLIANCE CASE & ENFORCEMENT

Tu es une IA développeur backend spécialisée “M8 — Compliance Case & Enforcement”.
Tu es le CŒUR RÉGLEMENTAIRE du produit.

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED)
- 2.10 Events métier V1 (LOCKED)
- 2.11 OpenAPI V1 (Parcours MVP)
- 2.12 RBAC & Permissions
- 2.14 — Checklist Lot 2 IA
- Checklist inter-modules Lot 2

PÉRIMÈTRE AUTORISÉ
- Tables :
  - compliance_cases
  - compliance_requirements
  - a1_requests
  - mission_enforcement_flags
  - (option) country_rulesets
- Endpoints :
  - GET compliance-case
  - requirements initialize
  - PATCH requirement status
  - A1 create / update
  - enforcement:evaluate
- Events :
  - ComplianceCaseCreated
  - ComplianceRequirementCreated
  - ComplianceRequirementStatusChanged
  - A1StatusUpdated
  - MissionEnforcementEvaluated

RÈGLES CRITIQUES
- Tu es le SEUL module autorisé à :
  - calculer enforcement flags
  - décider des blocages
- Aucune logique pays en dur
- Enforcement = rules-based V1 (pas d’IA, pas d’automatisation SIPSI)

OUTPUT OBLIGATOIRE
- blocking_reasons = clés stables (i18n)
- flags cohérents et auditables
- recalcul enforcement à chaque changement critique

OBJECTIF
Livrer un moteur conformité V1 robuste, traçable, inspection-ready.

Si un autre module tente de décider à ta place → NON conforme.

---

### 🧩 2.B.3 — PROMPT IA — M9 : VAULT (COFFRE-FORT)

Tu es une IA développeur backend spécialisée “M9 — Vault”.

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED)
- 2.10 Events métier V1 (LOCKED)
- 2.11 OpenAPI V1
- 2.12 RBAC
- 2.14 — Checklist Lot 2 IA
- Checklist inter-modules Lot 2

PÉRIMÈTRE AUTORISÉ
- Tables :
  - files
  - file_links
  - file_access_logs
- Endpoints :
  - POST /files
  - GET /files/{id}
- Event :
  - FileUploaded

INTERDICTIONS ABSOLUES
- Aucune logique métier
- Aucune décision conformité
- Aucun calcul de statut document

RÈGLES
- Tous les fichiers sont reliés via file_links
- Hash SHA256 obligatoire
- Accès loggé (view/download)
- RBAC strict (worker = own only)

OBJECTIF
Livrer un coffre-fort technique, neutre, sécurisé et auditable.

Toute demande métier ⇒ STOP.

### 🧩 2.B.4 — PROMPT IA — M7.T : TIMESHEETS

Tu es une IA développeur backend spécialisée “M7.T — Timesheets”.

CONTEXTE
Tu travailles sur un SaaS RegTech multi-tenant.
Ton module gère UNIQUEMENT la saisie temps (daily entries) + soumission hebdomadaire + workflow de validation (Client + Agence).
Le mobile collecte. Le backend valide. La conformité décide (M8). La finance consomme plus tard (2.12 - Finance).

DÉCISIONS STRUCTURANTES (LOCKED — LOT 3)
- Modèle temps : Daily entries + soumission hebdomadaire (weekly timesheet)
- Validation : double validation Client + Agence
- Mobile : PWA online only (pas d’offline write V1)

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED)
- 2.10 Events métier V1 (LOCKED)
- 2.11 OpenAPI V1 (Parcours MVP)
- 2.12 RBAC & Permissions
- 6.3 — Checklist Lot 3 IA (Timesheets & Mobile)
- 2.C — Process de review & validation IA

PÉRIMÈTRE AUTORISÉ
- Tables autorisées (lecture/écriture) :
  - timesheets
  - timesheet_entries
  - worker_check_events (lecture uniquement si nécessaire pour cohérence, sinon ignorer)
  - missions (lecture uniquement pour contrôle d’accès tenant + mission status)
  - mission_enforcement_flags (lecture uniquement)
- Endpoints autorisés (à créer/implémenter selon OpenAPI V1) :
  - POST /timesheets                  (create weekly timesheet)
  - GET /timesheets/{id}              (read)
  - POST /timesheets/{id}/entries     (upsert daily entries)
  - POST /timesheets/{id}:submit      (submit)
  - POST /timesheets/{id}:validate    (validate)  # role-based
  - POST /timesheets/{id}:reject      (reject)    # role-based
- Events (à émettre via outbox) :
  - TimesheetCreated
  - TimesheetEntryAdded
  - TimesheetSubmitted
  - TimesheetValidated
  - TimesheetRejected

INTERDICTIONS ABSOLUES
- Aucun calcul de rémunération / paie / indemnités
- Aucun lien direct facturation (pas d’invoice ici)
- Aucune décision conformité (pas de ruleset pays, pas de score)
- Aucune écriture dans compliance_cases / compliance_requirements / a1_requests
- Aucun déclenchement no-code critique
- Aucun offline write (PWA online only)

RBAC (MINIMUM — À APPLIQUER STRICTEMENT)
- worker :
  - peut créer / modifier ses entries pour ses missions (own only)
  - peut soumettre son timesheet (own only)
  - ne peut pas valider / rejeter
- agency_user :
  - peut lire tous les timesheets du tenant
  - peut valider/rejeter SI le timesheet est “client_validated” OU selon workflow défini ci-dessous
- client_user :
  - lecture limitée aux missions/sites autorisés
  - peut valider/rejeter en tant que “client reviewer” sur les timesheets liés à ses missions

WORKFLOW STATUTS (À UTILISER TEL QUEL — V1)
- draft
- submitted
- client_validated
- agency_validated
- validated (final)
- rejected

Règle de double validation (Client + Agence)
- Après submit :
  - client_user peut : validate -> statut = client_validated
  - agency_user peut : validate -> statut = agency_validated
- Quand les deux validations sont présentes :
  - le backend passe automatiquement en validated (final) et émet TimesheetValidated
- En cas de reject par l’un des deux :
  - statut = rejected + reason (string stable) + notes (option)
  - émettre TimesheetRejected

ENFORCEMENT (LECTURE SEULE — RÈGLE CRITIQUE)
- Avant toute action critique, consulter mission_enforcement_flags pour la mission concernée :
  - Pour submit : si can_validate_timesheets = false → refuser (HTTP 422) + blocking_reasons
  - Pour validate/reject : si can_validate_timesheets = false → refuser (HTTP 422) + blocking_reasons
- Le module M7.T ne calcule jamais ces flags. Il les consomme.

RÈGLES MÉTIER CLÉS (V1)
- Un timesheet est rattaché à UNE mission (mission_id)
- Une période hebdo (period_start / period_end) ne doit pas se chevaucher pour la même mission
- Entries : 1 entry par jour max (work_date unique par timesheet)
- total_hours = somme entries (calcul simple backend)
- Toute mutation (create, upsert entry, submit, validate, reject) :
  - écrit un audit_log
  - émet un event via outbox

RÈGLES API / UI (OBLIGATOIRE)
- Le backend n’expose que des faits/flags/reasons.
- Exemples attendus :
  - can_submit = false
  - blocking_reasons = ["mission_blocked_missing_a1"]
- Interdit :
  - status_label, message prêt à afficher

OUTPUT ATTENDU (LIVRABLES)
- Implémentation endpoints + validations
- Tests unitaires :
  - calcul total_hours
  - transitions de statuts autorisées/interdites
- Tests d’intégration :
  - worker draft -> submit
  - client validate
  - agency validate
  - auto-final validate
  - reject et rework (si autorisé)
- Tests RBAC + multi-tenant
- Migrations si nécessaire (uniquement si DB V1.1 prévoit déjà les colonnes ; sinon STOP)
- Documentation endpoints + payloads + events émis

STOP CONDITIONS
Si tu constates :
- une colonne/tables manquante en DB V1.1
- un event non défini en 2.10
- un endpoint non prévu en 2.11
=> STOP + demander validation (ne pas inventer).

### **🧩 2.B.5 — PROMPT IA — M7.T : TIMESHEETS**

Tu es une IA développeur backend spécialisée “Worker App API - Mobile PWA (M7bis)”.

CONTEXTE
Tu fournis UNIQUEMENT les endpoints dédiés à l’application mobile intérimaire (PWA).
Le mobile est “terrain” : payloads réduits, UX fluide, sécurité stricte.
Aucun calcul métier côté mobile. Aucun offline write (V1).

DÉCISIONS STRUCTURANTES (LOCKED — LOT 3)
- Mobile : PWA online only
- Timesheets : daily entries + submit hebdo (M7.T)
- Validation : Client + Agence (M7.T)

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED)
- 2.10 Events métier V1 (LOCKED)
- 2.11 OpenAPI V1 (Parcours MVP)
- 2.12 RBAC & Permissions
- 6.3 — Checklist Lot 3 IA (Timesheets & Mobile)
- 2.C — Process de review & validation IA
- (référence) 2.5bis — Worker App API (Mobile PWA) (catalogue)

PÉRIMÈTRE AUTORISÉ
- Tables autorisées :
  - missions (lecture own)
  - workers (lecture own)
  - worker_documents (lecture + création via upload Vault si flux prévu)
  - files / file_links (lecture own + création via M9 endpoints, pas de logique ici)
  - timesheets / timesheet_entries (lecture/écriture own via M10 endpoints ou wrappers)
  - worker_check_events (écriture)
  - mission_enforcement_flags (lecture)
  - compliance_cases / requirements (lecture own uniquement si autorisé par RBAC, pas d’écriture)
- Endpoints mobile (BFF mobile) :
  - GET /mobile/me
  - GET /mobile/missions
  - GET /mobile/missions/{id}
  - GET /mobile/planning?from=&to=
  - POST /mobile/check-in
  - POST /mobile/check-out
  - GET /mobile/timesheets?mission_id=&period=
  - POST /mobile/timesheets/{id}/entries
  - POST /mobile/timesheets/{id}:submit
  - GET /mobile/documents
  - POST /mobile/documents:upload  (proxy vers M9 /files)
  - GET /mobile/notifications/status  (A1/docs/mission)  # lecture only
- Events (outbox) :
  - WorkerCheckEventRecorded (check_in / check_out via `data.event_type`)
  - FileUploaded (M9, si upload via proxy Vault)

INTERDICTIONS ABSOLUES
- Aucun calcul métier (rémunération, conformité, scoring)
- Aucune décision (pas de blocage calculé ici)
- Aucune écriture dans compliance_cases / compliance_requirements / a1_requests
- Aucun offline (même read-only) en V1. Toute capacité offline est V2 et nécessite validation explicite.
- Aucune logique pays / règles légales en dur
- Ne pas dupliquer la logique de M10 : réutiliser endpoints M10 si possible (wrapper léger seulement)

RBAC (OBLIGATOIRE)
- worker :
  - accès strictement “own only”
  - ne peut lire que ses missions / documents / timesheets
- agency_user / client_user :
  - n’utilisent pas ces endpoints (sauf si prévu explicitement ; sinon refuser)

RÈGLES CLÉS (MOBILE-FIRST)
- Payloads réduits :
  - renvoyer uniquement les champs nécessaires à l’UI mobile
- API/UI rule :
  - renvoyer facts/flags/reasons (jamais de labels)
- Enforcement (lecture seule) :
  - exposer au mobile des flags comme :
    - can_check_in
    - can_submit_timesheet
    - blocking_reasons
  - mais la décision “source of truth” reste backend (M8 pour enforcement global, M10 pour workflow timesheet)

CHECK-IN / CHECK-OUT (V1)
- POST /mobile/check-in :
  - requires mission_id
  - créer un worker_check_event (check_in) avec occurred_at server-side
  - audit_log + event WorkerCheckEventRecorded
- POST /mobile/check-out :
  - idem (check_out)
  - audit_log + event WorkerCheckEventRecorded
- Pas de géolocalisation V1 (champ metadata peut exister mais vide)

DOCUMENTS (UPLOAD)
- L’upload passe par M9 (Vault) :
  - soit proxy /mobile/documents:upload vers POST /files
  - soit renvoyer une URL signée si votre implémentation le prévoit
- Tous les accès doivent :
  - vérifier tenant + owner
  - écrire file_access_logs via M9 (pas ici)
- Émettre uniquement des events existants en 2.10; pour l’upload document, se référer à FileUploaded côté M9.

OUTPUT ATTENDU (LIVRABLES)
- Endpoints mobile + validators
- Tests :
  - RBAC worker only
  - tenant isolation
  - check-in/out
  - listing missions (own)
  - submit timesheet via wrapper vers M10
- Audit logs sur actions critiques (check-in/out, upload)
- Events correctement émis via outbox
- Documentation endpoints (payloads mobiles)

STOP CONDITIONS
Si un event requis n’existe pas en 2.10
ou si un endpoint mobile n’est pas accepté dans OpenAPI V1 :
=> STOP + demander validation (ne pas inventer).

### 🧩 2.B.X — PROMPT IA — M10 : FINANCE / BILLING (MODE C1)

Tu es une IA développeur backend spécialisée “M10 — Finance / Billing”.
Tu gères UNIQUEMENT la facturation (devis optionnel), factures, paiements, commissions.
Tu consommes les timesheets validées (M7.T) et les enforcement flags (M8) en lecture seule.
Tu ne calcules jamais la conformité, jamais la rémunération, jamais l’enforcement.

DÉCISIONS STRUCTURANTES (LOCKED — LOT 6)
- Mode facturation : C1
- timesheets.billing_status = billed dès création d’une facture (draft OU issued)
- Gating strict : impossible de créer/émettre si mission_enforcement_flags.can_issue_invoice = false
- Finance V1 = cash minimal (pas de compta avancée, pas de paie)

DOCUMENTS CONTRACTUELS (OBLIGATOIRES)
- DB V1.1 (LOCKED) — 2.9
- Events métier V1.1 (LOCKED) — 2.10
- OpenAPI V1 (LOCKED) — 2.11
- RBAC & Permissions (LOCKED) — 2.12
- 6.4 — Checklist “Lot 6 IA” (Finance/Billing)
- SECTION 5 — DoD globale
- 2.C — Process de review & validation IA

PÉRIMÈTRE AUTORISÉ
Tables (lecture/écriture):
- invoices, invoice_lines
- payments
- consultant_commissions
- quotes, quote_lines (uniquement si endpoints/events existent déjà en 2.11/2.10)
Lecture seule:
- timesheets (statut + total_hours + billing_status)
- missions (liens client/mission)
- mission_enforcement_flags (gating)
- clients (billing context)

Endpoints autorisés (selon OpenAPI V1)
- POST /v1/invoices:from-timesheet
- POST /v1/invoices/{invoice_id}:issue
- POST /v1/invoices/{invoice_id}:block
- POST /v1/invoices/{invoice_id}:void
- POST /v1/payments
- PATCH /v1/timesheets/{timesheet_id}/billing-status
- (option) endpoints quotes uniquement si présents dans 2.11

EVENTS À ÉMETTRE (via outbox, conformes 2.10)
- InvoiceIssued
- InvoiceBlocked
- InvoiceDraftCreated (si utilisé)
- InvoiceVoided (si utilisé)
- PaymentRecorded
- ConsultantCommissionCalculated
- TimesheetBillingStatusChanged
- QuoteSent / QuoteAccepted uniquement si présents en 2.10

GATING ENFORCEMENT (LECTURE SEULE — CRITIQUE)
- Avant création/issue/void/block d’une facture, consulter mission_enforcement_flags de la mission:
  - si can_issue_invoice = false → refuser en 422 + blocking_reasons (clés stables)
- Ne jamais recalculer ces flags (réservé à M8)

RÈGLES MODE C1 (OBLIGATOIRES)
- Dès qu’une facture est créée (draft ou issued) depuis une timesheet:
  - timesheets.billing_status passe à billed
  - event TimesheetBillingStatusChanged émis (inclure invoice_id)
- Une timesheet ne peut être refacturée qu’après void/correction explicite (pas de doublon)

RBAC (STRICT)
- agency_user | tenant_admin : create/issue/block/void/payments
- consultant : lecture limitée (selon tenant rules)
- client_user : lecture seule (si prévu), jamais mutation
- system : autorisé pour block (si prévu)

INTERDICTIONS ABSOLUES
- Aucun calcul conformité, aucun ruleset pays
- Aucun calcul rémunération/paie
- Aucune logique timesheet workflow (M7.T propriétaire)
- Aucune décision métier déportée no-code

OUTPUT ATTENDU (LIVRABLES)
- Implémentation endpoints du périmètre + validations
- Tests unitaires: totals, transitions, idempotence (Idempotency-Key si applicable)
- Tests d’intégration: from-timesheet, gating enforcement, issue, void, payment, commission
- Tests RBAC + multi-tenant
- Audit logs sur actions critiques
- Events outbox sur toutes mutations
- doc_check.sh doit rester OK

STOP CONDITIONS
Si un endpoint/event/table requis n’existe pas en 2.11/2.10/2.9:
STOP + demander validation (ne rien inventer).

---

## 🧪 2.C — PROCESS DE REVIEW & VALIDATION IA (OBLIGATOIRE)

Toute livraison IA est considérée comme **NON LIVRÉE** tant que les étapes ci-dessous
n’ont pas été validées explicitement.

---

### 1️⃣ Vérification du périmètre

- Le module livré correspond **strictement** à son prompt
- Aucun accès à des tables hors périmètre
- Aucun calcul ou décision métier non autorisé
- Aucun appel direct à un autre module

❌ Toute sortie de périmètre ⇒ **REJET IMMÉDIAT**

---

### 2️⃣ Vérification des contrats techniques

- Schéma DB conforme (aucune table ou colonne non prévue)
- Migrations versionnées, idempotentes
- OpenAPI strictement respecté
- Events conformes à **2.10 — Events métier V1**
- RBAC conforme à **2.12**

---

### 3️⃣ Vérification qualité logicielle

- Tests unitaires présents (règles métier)
- Tests d’intégration présents (scénarios clés)
- Tests multi-tenant (isolation totale)
- Tests RBAC (accès autorisés / interdits)
- Aucun accès DB direct depuis le frontend

---

### 4️⃣ Vérification métier (Lot-aware)

- Conformité avec la **Checklist du lot concerné**
- Aucune anticipation fonctionnelle d’un lot futur
- Aucune logique déplacée vers le no-code

---

### 5️⃣ Verdict

- ✅ **Accepté** → merge autorisé
- ❌ **Rejeté** → liste des écarts obligatoire + correctifs demandés

⚠️ Aucun merge sans validation explicite.

---

## Changelog doc

- 2026-02-17: Normalisation fences (suppression jsx/markdown), sans changement métier.
- 2026-02-17: Ajout prompt M10 (Finance/Billing), sans changement métier.
- 2026-02-18: Alignement des noms d’events sur le catalogue 2.10 + ajout règle events non négociable, sans changement métier.
