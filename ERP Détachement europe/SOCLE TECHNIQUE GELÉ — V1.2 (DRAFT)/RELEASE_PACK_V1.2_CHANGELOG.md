# RELEASE PACK V1.2 — CHANGELOG CONSOLIDÉ (Vague 1→3)

- **Statut**: DRAFT V1.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Historique complet de tous les fichiers créés/modifiés lors de l'audit et des 3 vagues de corrections.

---

> **Convention** :
> - 🆕 = fichier créé
> - ✏️ = fichier modifié
> - 🔒 = LOCKED (non modifiable)
> - ⚠️ = correction de divergence
> - Source entre parenthèses = justification de l'existence du changement

---

## VAGUE 1 — Audit initial & Patches fondamentaux (2026-02-22)

### Objectif

Identifier les gaps dans le CDC et créer les patches manquants pour les surfaces bloquantes (DB sans table, events référencés mais non définis, RBAC platform_admin absent).

---

### 🆕 PATCH_DB_2.9.16-C_worker_push_subscriptions.md

**Raison** : `2.11.a` définit `POST/DELETE /v1/worker/push-subscription` mais aucune table `worker_push_subscriptions` n'existe dans `2.9 LOCKED`.

**Contenu créé** :
- DDL `worker_push_subscriptions` (id, tenant_id, user_id, worker_id, endpoint, p256dh, auth, created_at)
- RLS : worker_own, platform_admin
- Index : idx_wps_worker, idx_wps_tenant
- Migration : `20260222000001__lot3_m13_worker_push_subscriptions.sql`

**Sources** : `2.11.a §Worker App Mobile`, `SECTION 10.E E2E-09`, `6.3 Checklist Lot 3`

---

### 🆕 PATCH_DB_2.9.16-E_rfp_visibility_contact_logs.md

**Raison** : Q6-B (anti-désintermédiation) exige traçabilité contacts RFP. Colonne `rfp_requests.visibility` et table `rfp_contact_logs` absentes de `2.9 LOCKED`.

**Contenu créé** :
- Colonne `rfp_requests.visibility` (enum: private, public)
- DDL `rfp_contact_logs` (id, tenant_id, rfp_id, agency_id, counterpart_tenant_id, contact_type, occurred_at, notes, logged_by)
- Retention policy : 12 mois minimum
- RLS : tenant_staff, platform_admin
- Migration : `20260222000003__lot4_m4_rfp_contact_logs.sql`

**Sources** : `6.5 Checklist Lot 4`, `SECTION 10.E E2E-06`, `2.11.a`

---

### 🆕 PATCH_DB_2.9.16-F_sipsi_declarations.md

**Raison** : M8 référence la SIPSI comme obligation légale V1 (Directive 96/71). Aucune table `sipsi_declarations` dans `2.9 LOCKED`.

**Contenu créé** :
- DDL `sipsi_declarations` (id, tenant_id, compliance_case_id, mission_id, worker_id, host_country, status, external_ref, pdf_path, ...)
- Status enum : draft → submitted → validated → rejected
- RLS : tenant_staff, platform_admin
- Migration : `20260222000004__lot2_m8_sipsi_declarations.sql`

**Sources** : `CDC §M8 SIPSI`, `2.11.a §SIPSI endpoints`, `6.7 Checklist Lot 7`

---

### 🆕 PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md

**Raison** : Tables nécessaires pour M8.3 (Égalité traitement — Directive 2018/957/UE) et M8.4 (Export dossier inspection-ready — livrable obligatoire 6.0 ligne 113). Absentes de `2.9 LOCKED`.

**Contenu créé** :
- DDL `equal_treatment_checks` (snapshot immuable — pas d'updated_at) — migration 5
- DDL `compliance_exports` (job async tracking, TTL 7j, signed URL) — migration 6
- RLS : tenant_staff, worker_read (equal_treatment), platform_admin
- `expires_at GENERATED ALWAYS AS (completed_at + INTERVAL '7 days') STORED`

**Sources** : `CDC_COMPLETIONS_FROM_AUDIT §C1+C2`, `Directive 2018/957/UE`, `6.0 Checklist ligne 113`

---

### 🆕 PATCH_EVENTS_2.10.4.11.md (version initiale — §A→D)

**Raison** : `2.10 EVENTS MÉTIER V1 (LOCKED)` s'arrête à la section 2.10.4.10. Les documents 6.6, 6.7, SECTION 9 référencent `2.10.4.11` comme source d'events (ComplianceDurationAlert, WorkerSkillAdded) mais cette section n'existe pas.

**Contenu créé (§A→D)** :
- §A — `ComplianceDurationAlert` (M8, batch quotidien, alert_level warning/critical)
- §B — `WorkerSkillAdded` (M6, POST skills endpoint)
- §C — `SipsiDeclarationCreated` + `SipsiDeclarationStatusChanged` (M8, SIPSI workflow)
- §D — `ComplianceDossierExportRequested` + `ComplianceDossierExportCompleted` (M8, export async)

**Sources** : `6.7 ligne 41`, `2.11.a ligne 371`, `SECTION 9 §Outbox`, `PATCH_DB_2.9.16-F`

---

### 🆕 PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md (version initiale — §1→4)

**Raison** : Surfaces référencées dans Checklists/E2E mais absentes de `2.11 LOCKED` et `2.11.a V1.2.2`.

**Contenu créé (§1→4)** :
- §1 — `GET /v1/marketplace/agencies` (catalogue agences certifiées, filtres, pagination)
- §2 — `POST/GET /v1/leads/{lead_id}/activities` (CRUD CRM activities, DB existante 2.9.3)
- §3 — `POST /v1/compliance-cases/{id}:export-dossier` (async 202, include_sections)
- §4 — `GET /v1/compliance-cases/{id}/exports/{export_id}` (polling statut) + `GET .../compliance-score`

**Sources** : `E2E-10`, `6.8 ligne 138`, `6.0 ligne 113`, `DB 2.9.3`

---

### 🆕 PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md

**Raison** : Rôle `platform_admin` absent de la matrice `2.12 LOCKED`. Dashboard admin plateforme (M1.2) nécessite un rôle cross-tenant.

**Contenu créé** :
- JWT claims `platform_admin` : `{ sub, role_type: "platform_admin", tenant_id: null, ... }`
- Permissions SELECT globales (bypass RLS) — lecture seule données métier
- Permissions write sur config : tenants, tenant_settings, agency_profiles
- Endpoints dédiés `/v1/admin/platform/*`
- Matrice RBAC par endpoint

**Sources** : `SOCLE §RBAC`, `CDC_COMPLETIONS §C3`, `Décision D1`

---

### 🆕 CDC_COMPLETIONS_FROM_AUDIT.md

**Raison** : Blocs prêts-à-intégrer dans les documents CDC existants — centralisés dans un seul fichier.

**Contenu créé** :
- C1 — M8.3 Égalité de traitement (DDL + endpoints + events + GWT)
- C2 — M8.4 Export dossier (DDL + contenu PDF 9 sections + DoD)
- C3 — M1.2 Dashboard admin plateforme V1 MINIMAL
- C4 — Corrections narratif SOCLE (ERRATA-ready, clarifications C1/C2/C3)
- C5 — DB Patch 2.9.16-G (résumé)

---

### ✏️ ERRATA — Clarifications contractuelles V1.1

**Statut changé** : DRAFT → **LOCKED**

**Ajouts** :
- Clarification C2 : offline mobile = V2 (résolution SOCLE §M13 vs Checklist 6.0)
- Clarification C3 : 2.10.4.11 = addendum officiel (résolution référence orpheline)

**Sources** : Hiérarchie H1 > H3 pour C2 ; `PATCH_EVENTS_2.10.4.11.md` pour C3

---

### ✏️ SECTION 6 — Checklist Globale 6.0

**Modifications** :
- Ligne 82 : "Offline partiel validé" → marqué **V2** (résolution C2 ERRATA)
- "Certification automatique" → **"manuelle V1"** (3 items)
- Ajout lien vers `6.9 CHECKLIST LOT 7 BIS IA`

---

### ✏️ SECTION 10.D — Security Baseline

**Statut changé** : DRAFT → **READY**

**Modifications** :
- 3 contradictions internes corrigées : Encryption / Retention / Key rotation

---

### 🆕 6.9 — CHECKLIST — LOT 7 BIS IA (EGALITE DE TRAITEMENT).md

**Raison** : Module M8.3 totalement absent du CDC — obligation légale Directive 2018/957/UE.

**Contenu créé** :
- Contexte légal Art. 3 §1bis
- Algorithme V1 (règles-based, 3 étapes)
- GWT (7 scénarios)
- DoD M8.3

---

## VAGUE 2 — Compléments SIPSI, E2E-06→12 et surfaces V1.2.2 (2026-02-20→21)

> Note : Ces modifications sont antérieures au run d'audit 2026-02-22 mais incluses ici pour complétude.

### ✏️ SECTION 10.E — ACCEPTANCE TESTS E2E

**Version 1.2 (2026-02-20)** : Ajout E2E-06 à E2E-11 (RFP contact-logs, ATS shortlist, Worker Skills, Web Push, Marketplace gating, Finance).

**Version 1.3 (2026-02-21)** : Ajout E2E-12 (Lot 7 — moteur rémunération IDCC + éligibilité + durées cumulées). Statut DRAFT → **READY**.

---

## VAGUE 3 — Finalisation Ready-to-Build (2026-02-22)

### Objectif

Clore les derniers gaps : E2E-13, égalité traitement (OpenAPI+Events), ATS scoring Q7, platform_admin décision formelle, QA Final, Release Pack.

---

### ✏️ SECTION 10.E — ACCEPTANCE TESTS E2E (v1.4)

**Ajout** : Scénario **E2E-13** — Export dossier inspection-ready (async flow).
- Flow : `POST :export-dossier` → 202 + export_id + poll_url → polling → `status: ready` + download_url → TTL 7j
- Cas d'échec : `status: failed` + error_message
- RBAC : tenant_admin/agency_user OK ; worker/client_user/consultant → 403
- Cross-tenant : 404 (RLS)

**Sources** : `PATCH_DB_2.9.16-G §Table B`, `PATCH_OPENAPI_V1.3 §3+4`, `PATCH_EVENTS_2.10.4.11 §D`

---

### ✏️ PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md (V1.3.1)

**Ajout** : §5 — `POST + GET /v1/compliance-cases/{id}/equal-treatment-check`

**Raison** : Endpoints définis dans `CDC_COMPLETIONS §C1` et requis par `6.9 Checklist` mais absents de tous les patches OpenAPI existants.

**Contenu ajouté** :
- POST : contrat complet (RBAC, requestBody, 201 response, events_outbox §E, backend_rules)
- GET : dernier check par created_at, RBAC worker en lecture seule (rls_etc_worker_read)
- Tableau récapitulatif mis à jour (8 endpoints total)
- Checklist validation mise à jour (colonne equal-treatment-check)

---

### ✏️ PATCH_EVENTS_2.10.4.11.md (V1.2.3)

**Ajout** : §E — `EqualTreatmentCheckCreated` + `EqualTreatmentViolationDetected`

**Raison** : Events référencés dans `CDC_COMPLETIONS §C1` et `6.9 Checklist` mais absents du patch.

**Contenu ajouté** :
- `EqualTreatmentCheckCreated` : payload, consommateurs, règle de répétition (chaque POST = event distinct)
- `EqualTreatmentViolationDetected` : payload avec `items_failing[]`, consommateurs (M13 Notifs — criticité haute), règle (1 event par POST si is_compliant=false)
- Tableau récapitulatif mis à jour (8 events total §A→E)

---

### ✏️ 6.9 — CHECKLIST LOT 7 BIS IA (v1.1)

**Corrections** :
- Référence `§D` → `§E` pour events EqualTreatment (§D = export dossier — erreur de référence initiale)
- Ajout référence `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES §5` (contrats API formalisés)
- Alignement total sans divergence références croisées

---

### 🆕 PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md

**Raison** : Q7 (modèle scoring ATS) non défini — gap bloquant le build M5. Décision figée : V1 = rules-based.

**Contenu créé** :
- Décision D2 : rules-based, `model_version = "rules-v1.0"`, LLM = V2
- Algorithme 4 composantes (skills 50%, expérience 30%, langues 15%, certifications 5%)
- Format output : `ai_score [0-100]` + `score_breakdown` JSONB (skills_matched, skills_missing, raisons)
- 3 GWT reproductibles (match partiel 83, zero match 20, scoring différé)
- DoD 11 critères

**Sources** : `6.6 §M5 DoD Scoring`, `2.10.4.4 CandidateScored`, `SECTION 10.E E2E-07`

---

### 🆕 DECISIONS_OWNER_V1.2.md

**Raison** : Formaliser officiellement les décisions architecturales prises lors de l'audit.

**Contenu créé** :
- D1 — platform_admin Option A (tenant_id=null) — ⚠️ OWNER
- D2 — ATS scoring rules-based — ⚠️ OWNER
- D3 — PWA online-only — ✅ Résolu
- D4 — Facturation timesheets V1 — ✅ Résolu
- D5 — Export dossier V1 scope — ✅ Confirmé
- D6 — Égalité traitement V1 manuel — ⚠️ OWNER
- Tableau récapitulatif + checklist alignement global

---

### ⚠️ PATCH_DB_2.9.16-C_worker_push_subscriptions.md — Correction QA Final

**Divergence corrigée** : `/v1/workers/push-subscription` → `/v1/worker/push-subscription` (singulier)

**Raison** : Le contrat autoritaire `2.11.a — OPENAPI V1.2 §Worker App Mobile` utilise le singulier `/v1/worker/`. Les tests E2E-09, la matrice RBAC et les checklists utilisaient également le singulier. Seul le patch DB utilisait le pluriel incorrectement.

**Fichiers concernés** : Toutes les occurrences dans `PATCH_DB_2.9.16-C` (6 remplacements).

---

### 🆕 RELEASE_PACK_V1.2_INDEX.md (ce dossier)

**Contenu** : Index complet, hiérarchie documentaire, catalogue patches, V1 vs V2, gates READY-TO-CODE.

---

### 🆕 RELEASE_PACK_V1.2_CHANGELOG.md (ce fichier)

**Contenu** : Historique complet Vague 1→3.

---

### 🆕 RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md

**Contenu** : Tableau de validation finale DB ↔ OpenAPI ↔ Events ↔ RBAC ↔ E2E.

---

### 🆕 RELEASE_PACK_V1.2_OPEN_ITEMS.md

**Contenu** : Items encore ouverts post-QA.

---

## Résumé statistique

| Type | Vague 1 | Vague 2 | Vague 3 | Total |
|---|---|---|---|---|
| Fichiers créés | 8 | 0 | 6 | **14** |
| Fichiers modifiés | 3 | 1 | 3 | **7** |
| Divergences corrigées | 0 | 0 | 2 | **2** |
| Events définis | 6 | 0 | 2 | **8** |
| Endpoints définis | 6 | 0 | 2 | **8** |
| Décisions formalisées | 3 | 0 | 3 | **6** |
| E2E scénarios ajoutés | 0 | 7 | 1 | **8** |

## Mini-changelog

- 2026-02-22 : Création — Consolide Vague 1 (patches fondamentaux), Vague 2 (surfaces V1.2.2 + E2E-06→12), Vague 3 (E2E-13, equal-treatment, ATS Q7, platform_admin, QA Final).
