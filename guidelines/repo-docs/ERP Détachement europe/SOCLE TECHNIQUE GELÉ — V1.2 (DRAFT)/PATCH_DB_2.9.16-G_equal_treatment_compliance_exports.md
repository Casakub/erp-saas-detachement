# PATCH DB — 2.9.16-G — equal_treatment_checks + compliance_exports

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — tables requises par CDC_COMPLETIONS_FROM_AUDIT §1 et §2

---

## Contexte & Justification

Ce patch consolide deux tables complémentaires identifiées lors de l'audit fonctionnel :

| Table | Module | Lot | Blocage résolu |
|---|---|---|---|
| `equal_treatment_checks` | M8 (Conformité) | 7 | Obligation Directive 2018/957/UE — M8.3 |
| `compliance_exports` | M8 (Conformité) | 7 | Livrable obligatoire Checklist 6.0 ligne 113 — M8.4 |

### Références sources

| Source | Référence | Contenu |
|---|---|---|
| `SECTION 6 — Checklist 6.0 ligne 113` | Export dossier | "Export dossier 'inspection-ready' (PDF) fonctionnel" — livrable V1 obligatoire |
| `CDC_COMPLETIONS_FROM_AUDIT §1` | equal_treatment | DDL + endpoints M8.3 Égalité de traitement |
| `CDC_COMPLETIONS_FROM_AUDIT §2` | compliance_exports | DDL + flow async M8.4 Export dossier |
| `PATCH_OPENAPI_V1.3` | Endpoints | `POST /v1/compliance-cases/{id}:export-dossier` + `GET .../exports/{id}` |
| `Directive 2018/957/UE Art.3` | Légal | Obligation égalité de traitement travailleurs détachés |

---

## DDL SQL — Table A : `equal_treatment_checks`

### Naming convention migrations (SECTION 9)

Format : `YYYYMMDDHHMMSS__lot<N>_m<M>_<slug>.sql`
→ `20260222000005__lot7_m8_equal_treatment_checks.sql`

### Contexte légal

La Directive 2018/957/UE (révision de la Directive 96/71/CE) impose que les travailleurs détachés bénéficient des mêmes conditions de rémunération que les travailleurs locaux du pays hôte. Le contrôle V1 est **manuel et assisté** (saisie agent) — l'automatisation via API externe des salaires de référence est V2.

Les snapshots sont **immuables** (pas de `updated_at`) — même comportement que `worker_remuneration_snapshot` (2.9 LOCKED).

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-G (Table A) — equal_treatment_checks
-- Lot 7 — M8 (Conformité Détachement — extension Égalité de Traitement)
-- Convention: 20260222000005__lot7_m8_equal_treatment_checks.sql
-- ============================================================

CREATE TABLE equal_treatment_checks (
  -- Identité
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Isolation multi-tenant (RLS)
  tenant_id                   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Liens métier (1 check = 1 compliance_case = 1 mission = 1 worker)
  compliance_case_id          UUID        NOT NULL REFERENCES compliance_cases(id) ON DELETE RESTRICT,
  mission_id                  UUID        NOT NULL REFERENCES missions(id) ON DELETE RESTRICT,
  worker_id                   UUID        NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,

  -- Périmètre géographique du check
  check_date                  DATE        NOT NULL DEFAULT CURRENT_DATE,
  host_country                CHAR(2)     NOT NULL DEFAULT 'FR',

  -- Salaire de référence du pays hôte (source: IDCC local ou salaire minimum légal)
  -- Saisi MANUELLEMENT en V1 par tenant_admin / agency_user
  -- V2 : récupération automatique via API externe
  host_country_reference_wage NUMERIC(12,2),
  reference_period_type       TEXT        CHECK (reference_period_type IN ('hourly', 'monthly')),
  reference_source            TEXT,       -- Description de la source (ex: "SMIC FR 2026", "CCN BTP-1702")

  -- Rémunération admissible calculée par M8 Salary Engine
  -- Récupérée depuis le dernier worker_remuneration_snapshot
  worker_eligible_wage        NUMERIC(12,2),
  worker_period_type          TEXT        CHECK (worker_period_type IN ('hourly', 'monthly')),

  -- Vérifications items obligatoires Directive 2018/957/UE Art.3
  working_time_compliant      BOOLEAN,    -- Durée maximum légale respectée (pays hôte)
  paid_leave_compliant        BOOLEAN,    -- Jours de congés payés conformes
  health_safety_compliant     BOOLEAN,    -- Conditions hygiène & sécurité conformes
  accommodation_compliant     BOOLEAN,    -- Logement conforme si fourni par l'employeur

  -- Classification des allocations (Art.3 §1bis — traitement comme salaire ou remboursement)
  allowances_treatment_type   TEXT        CHECK (allowances_treatment_type IN ('wage', 'reimbursement', 'mixed')),

  -- Résultat du check
  is_compliant                BOOLEAN,
  gap_amount                  NUMERIC(12,2),   -- worker_eligible - host_reference (négatif = non conforme)
  gap_percentage              NUMERIC(5,2),    -- écart en % (négatif = non conforme)

  -- Notes libres et justification
  notes                       TEXT,

  -- Détail complet du calcul
  calculation_details         JSONB,
  -- Structure recommandée calculation_details :
  -- {
  --   "items_checked": ["working_time", "paid_leave", "health_safety", "accommodation"],
  --   "items_failing": ["working_time"],
  --   "wage_comparison": { "worker": 12.5, "host_reference": 13.0, "gap": -0.5 },
  --   "notes_per_item": { "working_time": "Heures sup non rémunérées" }
  -- }

  engine_version              TEXT        NOT NULL DEFAULT 'etreq-1.0',

  -- SNAPSHOT IMMUABLE — même règle que worker_remuneration_snapshot
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                  UUID        NOT NULL REFERENCES users(id)
  -- PAS de updated_at — snapshot immuable (audit-ready, inspection-ready)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_etc_tenant_id
  ON equal_treatment_checks (tenant_id);

CREATE INDEX idx_etc_compliance_case_id
  ON equal_treatment_checks (compliance_case_id);

CREATE INDEX idx_etc_worker_id
  ON equal_treatment_checks (worker_id);

CREATE INDEX idx_etc_tenant_compliant
  ON equal_treatment_checks (tenant_id, is_compliant)
  WHERE is_compliant IS NOT NULL;

CREATE INDEX idx_etc_host_country
  ON equal_treatment_checks (tenant_id, host_country);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE equal_treatment_checks ENABLE ROW LEVEL SECURITY;

-- Politique 1 : tenant_admin + agency_user — accès complet à leur tenant
CREATE POLICY rls_etc_tenant_staff
  ON equal_treatment_checks
  FOR ALL
  TO authenticated
  USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 2 : worker — lecture seule de ses propres checks
CREATE POLICY rls_etc_worker_read
  ON equal_treatment_checks
  FOR SELECT
  TO authenticated
  USING (
    worker_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'worker'
  );

-- Politique 3 : platform_admin — bypass global
CREATE POLICY rls_etc_platform_admin
  ON equal_treatment_checks
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

### Politiques RLS — equal_treatment_checks

| Rôle | SELECT | INSERT | UPDATE | DELETE | Condition |
|---|---|---|---|---|---|
| `tenant_admin` | ✅ | ✅ | ❌ (immuable) | ❌ (audit trail) | `tenant_id` JWT |
| `agency_user` | ✅ | ✅ | ❌ (immuable) | ❌ | `tenant_id` JWT |
| `worker` | ✅ (ses) | ❌ | ❌ | ❌ | `worker_id` = JWT `sub` |
| `platform_admin` | ✅ | ✅ | ❌ | ❌ | bypass — immuabilité préservée |
| `client_user` | ❌ | ❌ | ❌ | ❌ | exclu |
| `consultant` | ❌ | ❌ | ❌ | ❌ | exclu |

**Règle DELETE / UPDATE** : Table immuable par conception — aucun UPDATE ni DELETE autorisé (même pour `tenant_admin`). Nouveau check = nouveau record.

---

## DDL SQL — Table B : `compliance_exports`

### Naming convention migrations (SECTION 9)

→ `20260222000006__lot7_m8_compliance_exports.sql`

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-G (Table B) — compliance_exports
-- Lot 7 — M8 (Conformité Détachement — Export Dossier Inspection-Ready)
-- Convention: 20260222000006__lot7_m8_compliance_exports.sql
-- ============================================================

CREATE TABLE compliance_exports (
  -- Identité
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Isolation multi-tenant (RLS)
  tenant_id             UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Compliance case exporté
  compliance_case_id    UUID        NOT NULL REFERENCES compliance_cases(id) ON DELETE RESTRICT,

  -- Demandeur
  requested_by          UUID        NOT NULL REFERENCES users(id),

  -- Statut du job asynchrone
  -- pending    : en attente de traitement par le worker job
  -- processing : en cours de génération (verrouillé par le job)
  -- ready      : PDF généré et disponible au téléchargement
  -- failed     : échec de génération (voir error_message)
  status                TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'failed')),

  -- Format (V1 = PDF uniquement; V2 pourra ajouter JSON, DOCX)
  format                TEXT        NOT NULL DEFAULT 'pdf'
    CHECK (format IN ('pdf')),

  -- Sections incluses dans l'export (array des noms de sections)
  -- Valeurs possibles : 'remuneration_snapshot', 'equal_treatment', 'a1_tracking',
  --   'sipsi_declaration', 'compliance_documents', 'enforcement_history',
  --   'compliance_score_timeline'
  -- Vide = toutes les sections disponibles (comportement par défaut)
  included_sections     TEXT[]      DEFAULT '{}',

  -- Résultat du job
  storage_path          TEXT,       -- Chemin relatif Supabase Storage
  file_size_bytes       BIGINT,

  -- Erreur (si status = 'failed')
  error_message         TEXT,
  error_code            TEXT,       -- Code technique (ex: 'PDF_GENERATION_TIMEOUT')

  -- Horodatages lifecycle
  requested_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_started_at TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,

  -- TTL: le fichier PDF expire 7 jours après génération
  -- Calculé automatiquement par la colonne générée
  expires_at            TIMESTAMPTZ GENERATED ALWAYS AS
    (completed_at + INTERVAL '7 days') STORED
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Lookup par compliance_case (polling frontend)
CREATE INDEX idx_cexp_compliance_case_id
  ON compliance_exports (compliance_case_id);

-- Lookup par tenant (dashboard admin)
CREATE INDEX idx_cexp_tenant_id
  ON compliance_exports (tenant_id);

-- Jobs en attente (dispatcher batch)
CREATE INDEX idx_cexp_pending_status
  ON compliance_exports (status, requested_at ASC)
  WHERE status IN ('pending', 'processing');

-- Nettoyage TTL (purge automatique)
CREATE INDEX idx_cexp_expires_at
  ON compliance_exports (expires_at)
  WHERE expires_at IS NOT NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE compliance_exports ENABLE ROW LEVEL SECURITY;

-- Politique 1 : tenant_admin + agency_user — accès complet à leur tenant
CREATE POLICY rls_cexp_tenant_staff
  ON compliance_exports
  FOR ALL
  TO authenticated
  USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 2 : system — accès pour le job worker (mise à jour statut + storage_path)
CREATE POLICY rls_cexp_system_worker
  ON compliance_exports
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'system'
  );

-- Politique 3 : platform_admin — bypass global
CREATE POLICY rls_cexp_platform_admin
  ON compliance_exports
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

### Politiques RLS — compliance_exports

| Rôle | SELECT | INSERT | UPDATE | DELETE | Condition |
|---|---|---|---|---|---|
| `tenant_admin` | ✅ | ✅ | ❌ (job only) | ❌ | `tenant_id` JWT |
| `agency_user` | ✅ | ✅ | ❌ | ❌ | `tenant_id` JWT |
| `system` | ✅ | ✅ | ✅ | ❌ | Service account job export |
| `platform_admin` | ✅ | ✅ | ✅ | ✅ | bypass global |
| `worker` | ❌ | ❌ | ❌ | ❌ | exclu |
| `client_user` | ❌ | ❌ | ❌ | ❌ | exclu |

**Note** : Seul le `system` (service account du job async) peut mettre à jour `status`, `storage_path`, `completed_at`, `error_message`. Le frontend ne peut que créer (INSERT) et lire (SELECT).

---

## Workflow job async (compliance_exports)

```json
FLOW V1 :
  1. Frontend → POST /v1/compliance-cases/{id}:export-dossier
     → INSERT compliance_exports (status='pending') → 202 + export_id
     → Event ComplianceDossierExportRequested via outbox

  2. Job dispatcher (n8n ou Node.js worker, toutes les 60s) :
     → SELECT * FROM compliance_exports WHERE status='pending' ORDER BY requested_at ASC LIMIT 5
     → UPDATE status='processing', processing_started_at=now()
     → Génération PDF (fetche toutes les sections disponibles)
     → Stockage Supabase Storage : tenant_id/{export_id}/dossier_inspection.pdf
     → UPDATE status='ready', storage_path=..., completed_at=now()
     → Event ComplianceDossierExportCompleted via outbox

  3. Frontend polling → GET /v1/compliance-cases/{id}/exports/{export_id}
     → Si status='ready' : génère signed URL Supabase Storage (TTL 1h)
     → Retourne download_url

  4. Purge automatique (batch quotidien) :
     → DELETE FROM compliance_exports WHERE expires_at < now()
     → Suppression fichier Supabase Storage correspondant

TIMEOUT job :
  Si status='processing' depuis > 10 minutes → UPDATE status='failed', error_code='JOB_TIMEOUT'
  → Event ComplianceDossierExportCompleted avec status='failed'
```

---

## Contenu du PDF inspection-ready (spécification V1)

```json
SECTIONS DU DOSSIER (ordre d'affichage) :

1. EN-TÊTE
   - Nom agence, logo
   - Mission : numéro, titre poste, corridor (origine → hôte)
   - Worker : prénom, nom, nationalité
   - Client : nom, adresse site
   - Date de génération + version export

2. RÉMUNÉRATION (worker_remuneration_snapshot)
   - Dernier snapshot immuable
   - Champs : base_salary, eligible_amount, excluded_expenses, legal_minimum, is_compliant
   - IDCC appliqué + classification

3. ÉGALITÉ DE TRAITEMENT (equal_treatment_checks)
   - Dernier check (si disponible)
   - Champs : host_reference_wage, worker_eligible_wage, gap_amount, is_compliant
   - Items vérifiés (temps de travail, congés, H&S, hébergement)

4. A1 (a1_requests)
   - Statut de la demande A1 (pending/submitted/received/expired)
   - Référence externe si disponible

5. SIPSI (sipsi_declarations)
   - Dernière déclaration (si disponible)
   - Statut + référence externe SIPSI

6. DOCUMENTS VIGILANCE (compliance_case.requirements)
   - Checklist documents avec statuts (pending/approved/expired)
   - Alertes expirations

7. ENFORCEMENT (mission_enforcement_flags historique)
   - Historique flags : can_activate_mission, can_validate_timesheets, can_issue_invoice
   - Avec horodatages et raisons

8. SCORE CONFORMITÉ (compliance_score_timeline)
   - Derniers N scores calculés avec dates

9. PIED DE PAGE
   - "Généré par [plateforme] le [date] — confidentiel — usage inspection uniquement"
   - Hash d'intégrité du document
```

---

## Impact global — Endpoints débloqués

| Endpoint | Méthode | Table requise | Statut après patch |
|---|---|---|---|
| `/v1/compliance-cases/{id}:export-dossier` | POST | `compliance_exports` | ✅ |
| `/v1/compliance-cases/{id}/exports/{export_id}` | GET | `compliance_exports` | ✅ |
| `/v1/compliance-cases/{id}/equal-treatment-check` | POST | `equal_treatment_checks` | ✅ |
| `/v1/compliance-cases/{id}/equal-treatment-check` | GET | `equal_treatment_checks` | ✅ |

**Events débloqués** (voir PATCH_EVENTS_2.10.4.11) :
- `EqualTreatmentCheckCreated` → table `equal_treatment_checks`
- `EqualTreatmentViolationDetected` → table `equal_treatment_checks`
- `ComplianceDossierExportRequested` → table `compliance_exports`
- `ComplianceDossierExportCompleted` → table `compliance_exports`

---

## Checklist de validation

### equal_treatment_checks

- [ ] Migration `20260222000005__lot7_m8_equal_treatment_checks.sql` appliquée
- [ ] Colonne `updated_at` absente (immuabilité garantie)
- [ ] RLS activé + 3 politiques créées
- [ ] Contrainte UPDATE/DELETE impossible confirmée (test)
- [ ] POST endpoint : snapshot créé avec `engine_version='etreq-1.0'`
- [ ] GET endpoint : retourne le dernier check par `compliance_case_id`
- [ ] Test RBAC : `client_user` / `consultant` reçoivent 403
- [ ] Test worker : lit uniquement ses propres checks
- [ ] Test multi-tenant : isolation vérifiée
- [ ] Events `EqualTreatmentCheckCreated` et `EqualTreatmentViolationDetected` publiés via outbox

### compliance_exports

- [ ] Migration `20260222000006__lot7_m8_compliance_exports.sql` appliquée
- [ ] RLS activé + 3 politiques créées
- [ ] Index `idx_cexp_pending_status` utilisé par le dispatcher (vérifier EXPLAIN)
- [ ] POST → 202 + `export_id` en < 100ms
- [ ] Job dispatcher traite les jobs pending en < 60s
- [ ] GET → polling retourne `download_url` si `status='ready'`
- [ ] Signed URL Supabase Storage expire en 1h
- [ ] Purge TTL : fichiers expirés supprimés après 7j
- [ ] Test timeout job (> 10min → `status='failed'`)
- [ ] Events `ComplianceDossierExportRequested` et `ComplianceDossierExportCompleted` publiés

---

## Alignement contrat global (après tous les patches 2.9.16-C/E/F/G)

| Table | DB | OpenAPI | Events | RBAC | E2E |
|---|---|---|---|---|---|
| `worker_push_subscriptions` | ✅ 2.9.16-C | ✅ 2.11.a | N/A | ✅ | ✅ E2E-09 |
| `rfp_requests.visibility` | ✅ 2.9.16-E | ✅ 2.11.a | N/A | ✅ | ✅ GWT 6.8 |
| `rfp_contact_logs` | ✅ 2.9.16-E | ✅ 2.11.a | N/A | ✅ | ✅ |
| `sipsi_declarations` | ✅ 2.9.16-F | ✅ 2.11.a | ✅ 2.10.4.11 | ✅ | ⚠️ pas E2E dédié |
| `equal_treatment_checks` | ✅ 2.9.16-G | ✅ CDC_COMPLETIONS | ✅ 2.10.4.11 | ✅ | ⚠️ GWT dans CDC |
| `compliance_exports` | ✅ 2.9.16-G | ✅ PATCH V1.3 | ✅ 2.10.4.11 | ✅ | ⚠️ À créer E2E-13 |

---

## Mini-changelog

- 2026-02-22 : Création du patch consolidé 2.9.16-G — deux tables : `equal_treatment_checks` (Directive 2018/957/UE, snapshot immuable) et `compliance_exports` (export dossier inspection-ready async, TTL 7j). DDL complet avec RLS, indexes, workflow job.
