# CDC COMPLETIONS FROM AUDIT — Compléments prêts à coller

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Compléments CDC découlant de l'audit fonctionnel — à intégrer dans les documents cibles référencés.

---

> **Mode d'emploi** : Ce document contient des blocs prêts à intégrer dans les documents CDC existants. Chaque section indique le document cible et l'emplacement d'insertion exact. Les blocs sont rédigés au format Notion-ready (Markdown compatible).

---

## COMPLÉMENT 1 — M8.3 Égalité de Traitement (Directive 2018/957/UE)

**Document cible** : Nouveau fichier à créer dans `SECTION 6 — Checklist Produit V1 (Globale)/`
**Nom suggéré** : `6.9 — CHECKLIST — LOT 7 BIS IA (EGALITE DE TRAITEMENT).md`
**Ou** : À intégrer dans `6.7 — CHECKLIST — LOT 7 IA` comme section M8.3

### Contexte légal obligatoire

**Directive 2018/957/UE** (révision Directive 96/71/CE) — Art. 3, §1bis :
> "Les États membres veillent à ce que les travailleurs détachés bénéficient, en ce qui concerne les éléments de la rémunération rendus obligatoires par des dispositions législatives, réglementaires ou administratives ainsi que par des conventions collectives ou sentences arbitrales (...) des mêmes conditions d'emploi que les travailleurs nationaux."

Cette obligation légale est **totalement absente du CDC actuel** (vérifié : 2.9 LOCKED, 2.10 LOCKED, 2.11 LOCKED, 2.12 LOCKED, SOCLE, SECTION 10.A à 10.F).

**Scope retenu** : V1 MINIMAL — traçabilité manuelle + statut + endpoints. Calcul avancé → V2.

---

### Table DB (Patch 2.9.16-G)

```sql
-- Naming: 20260222000005__lot7_m8_equal_treatment_checks.sql

CREATE TABLE equal_treatment_checks (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  compliance_case_id          UUID        NOT NULL REFERENCES compliance_cases(id) ON DELETE RESTRICT,
  mission_id                  UUID        NOT NULL REFERENCES missions(id) ON DELETE RESTRICT,
  worker_id                   UUID        NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,

  check_date                  DATE        NOT NULL DEFAULT CURRENT_DATE,
  host_country                CHAR(2)     NOT NULL DEFAULT 'FR',

  -- Rémunération de référence du pays hôte (source: IDCC hôte ou salaire minimum légal hôte)
  host_country_reference_wage NUMERIC(12,2),
  reference_period_type       TEXT        CHECK (reference_period_type IN ('hourly', 'monthly')),

  -- Rémunération admissible calculée par M8 Salary Engine
  worker_eligible_wage        NUMERIC(12,2),

  -- Vérifications items obligatoires Directive 2018/957
  working_time_compliant      BOOLEAN,    -- Durée max légale respectée
  paid_leave_compliant        BOOLEAN,    -- Congés payés conformes
  health_safety_compliant     BOOLEAN,    -- Conditions H&S conformes
  accommodation_compliant     BOOLEAN,    -- Logement conforme si fourni

  -- Classification allocations (salaire vs remboursement)
  allowances_treatment_type   TEXT        CHECK (allowances_treatment_type IN ('wage', 'reimbursement', 'mixed')),

  -- Résultat global
  is_compliant                BOOLEAN,
  gap_amount                  NUMERIC(12,2),   -- Écart si non conforme (worker_eligible - host_reference)
  gap_percentage              NUMERIC(5,2),    -- Écart en % si non conforme

  -- Notes et justification (manuel V1)
  notes                       TEXT,

  -- Détail breakdown complet
  calculation_details         JSONB,

  engine_version              TEXT        NOT NULL DEFAULT 'etreq-1.0',

  -- Snapshot immuable (comme worker_remuneration_snapshot)
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                  UUID        NOT NULL REFERENCES users(id)
  -- PAS de updated_at — snapshot immuable audit-ready
);

CREATE INDEX idx_etc_tenant        ON equal_treatment_checks(tenant_id);
CREATE INDEX idx_etc_case          ON equal_treatment_checks(compliance_case_id);
CREATE INDEX idx_etc_worker        ON equal_treatment_checks(worker_id);
CREATE INDEX idx_etc_compliant     ON equal_treatment_checks(tenant_id, is_compliant);

ALTER TABLE equal_treatment_checks ENABLE ROW LEVEL SECURITY;

-- RLS standard (cohérent avec worker_remuneration_snapshot)
CREATE POLICY rls_etc_tenant_staff ON equal_treatment_checks FOR ALL TO authenticated
  USING (tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
         AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user'));

CREATE POLICY rls_etc_worker_read ON equal_treatment_checks FOR SELECT TO authenticated
  USING (worker_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
         AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'worker');

CREATE POLICY rls_etc_platform_admin ON equal_treatment_checks FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');
```

---

### Endpoints OpenAPI (pour intégration dans PATCH_OPENAPI_V1.3 ou patch V1.4)

```yaml
POST /v1/compliance-cases/{compliance_case_id}/equal-treatment-check:
  summary: Créer un check égalité de traitement (snapshot immuable)
  lot: 7
  rbac: [tenant_admin, agency_user]
  requestBody:
    required: [host_country_reference_wage, reference_period_type]
    properties:
      host_country_reference_wage: number
      reference_period_type: { enum: [hourly, monthly] }
      working_time_compliant: boolean
      paid_leave_compliant: boolean
      health_safety_compliant: boolean
      accommodation_compliant: boolean
      allowances_treatment_type: { enum: [wage, reimbursement, mixed] }
      notes: string
  responses:
    201:
      properties:
        id: uuid
        is_compliant: boolean
        gap_amount: number
        gap_percentage: number

GET /v1/compliance-cases/{compliance_case_id}/equal-treatment-check:
  summary: Récupérer le dernier check égalité de traitement
  rbac: [tenant_admin, agency_user]
  responses:
    200: EqualTreatmentCheck object
    404: Aucun check créé pour ce case
```

---

### Events (référencer dans PATCH_EVENTS_2.10.4.11 si besoin)

```
EqualTreatmentCheckCreated
  Trigger: POST equal-treatment-check
  Payload: { compliance_case_id, mission_id, worker_id, is_compliant, gap_amount }

EqualTreatmentViolationDetected
  Trigger: POST si is_compliant = false
  Payload: { compliance_case_id, gap_amount, gap_percentage, items_failing[] }
  Consommateurs: M13 Notifications (alerte tenant_admin), Dashboard Conformité
```

---

### Règles métier V1

```
ALGORITHME V1 (règles-based, pas ML) :
  1. Récupérer worker_eligible_wage depuis worker_remuneration_snapshot (dernier)
  2. Comparer avec host_country_reference_wage (saisie manuelle V1)
  3. is_compliant = (worker_eligible_wage >= host_country_reference_wage)
  4. gap_amount = worker_eligible_wage - host_country_reference_wage (négatif = non conforme)

RÈGLE SPÉCIALE V1 : host_country_reference_wage est saisi MANUELLEMENT par tenant_admin/agency_user
  → V2 : récupération automatique depuis API externe (salaires minimums pays hôte)

SNAPSHOT IMMUABLE : même comportement que worker_remuneration_snapshot
  → Chaque check = nouveau record (audit trail complet)
  → Pas de DELETE
```

---

### Critères d'acceptation (GWT)

**Given** worker avec `eligible_wage=13 EUR/h`, `host_country_reference_wage=14 EUR/h` →
**Then** `is_compliant=false`, `gap_amount=-1.00`, `EqualTreatmentViolationDetected` publié.

**Given** worker avec `eligible_wage=15 EUR/h`, `host_country_reference_wage=14 EUR/h` →
**Then** `is_compliant=true`, `gap_amount=+1.00`.

**Given** `client_user` → **Then** 403 (exclu).

**Given** double check sur même `compliance_case_id` → **Then** second snapshot créé, premier conservé (audit trail).

### Definition of Done (M8.3 Égalité de Traitement)

- [ ] Table `equal_treatment_checks` migrée avec RLS
- [ ] Endpoint POST (création snapshot immuable) opérationnel
- [ ] Endpoint GET (lecture dernier check) opérationnel
- [ ] Events `EqualTreatmentCheckCreated` + `EqualTreatmentViolationDetected` publiés via outbox
- [ ] RBAC validé : `client_user`/`worker`/`consultant` exclus du POST
- [ ] Snapshot immuable (pas de `updated_at`, pas de DELETE)
- [ ] Tests : unit + RBAC + multi-tenant + audit trail

---

## COMPLÉMENT 2 — M8.4 Export Dossier Inspection-Ready

**Document cible** : À intégrer dans `6.7 — CHECKLIST — LOT 7 IA` comme section M8.4
**DB nécessaire** : Table `compliance_exports` (Patch 2.9.16-G, DDL ci-dessous)

### Contexte

`SECTION 6 — Checklist Globale 6.0 ligne 113` : *"Export dossier 'inspection-ready' (PDF) fonctionnel"*
Livrable obligatoire V1 — aucun endpoint ni table DB définis à ce jour.

### Table DB (Patch 2.9.16-G)

```sql
-- Naming: 20260222000006__lot7_m8_compliance_exports.sql

CREATE TABLE compliance_exports (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  compliance_case_id  UUID        NOT NULL REFERENCES compliance_cases(id) ON DELETE RESTRICT,
  requested_by        UUID        NOT NULL REFERENCES users(id),

  -- Statut du job async
  status              TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'failed')),

  -- Format (V1 = PDF uniquement)
  format              TEXT        NOT NULL DEFAULT 'pdf'
    CHECK (format IN ('pdf')),

  -- Sections incluses dans l'export
  included_sections   TEXT[]      DEFAULT '{}',

  -- Résultat
  storage_path        TEXT,       -- chemin Supabase Storage
  download_url        TEXT,       -- signed URL (régénéré à la demande)
  file_size_bytes     BIGINT,

  -- Erreur
  error_message       TEXT,

  -- Horodatages
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_started_at TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,

  -- Expiration du fichier généré (TTL 7 jours)
  expires_at          TIMESTAMPTZ GENERATED ALWAYS AS (completed_at + INTERVAL '7 days') STORED
);

CREATE INDEX idx_cexp_case     ON compliance_exports(compliance_case_id);
CREATE INDEX idx_cexp_tenant   ON compliance_exports(tenant_id);
CREATE INDEX idx_cexp_status   ON compliance_exports(status) WHERE status IN ('pending', 'processing');

ALTER TABLE compliance_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_cexp_tenant_staff ON compliance_exports FOR ALL TO authenticated
  USING (tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
         AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user'));

CREATE POLICY rls_cexp_platform_admin ON compliance_exports FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');
```

### Contenu du PDF inspection-ready

```
Sections (toutes optionnelles, toutes incluses par défaut) :
  1. En-tête : mission, worker, agence, client, corridor
  2. Rémunération : dernier snapshot worker_remuneration_snapshot (immuable)
  3. Égalité de traitement : dernier equal_treatment_check (si disponible)
  4. A1 : statut a1_requests (tracking assisté)
  5. SIPSI : dernière sipsi_declaration (si disponible)
  6. Documents vigilance : liste compliance_case.requirements (statuts)
  7. Enforcement flags : historique can_activate_mission / can_validate_timesheets / can_issue_invoice
  8. Score conformité : timeline compliance_score (derniers N calculs)
  9. Pied de page : date génération, version export, tenant, horodatage audit
```

### Endpoints → Voir PATCH_OPENAPI_V1.3 section 3

### Definition of Done (M8.4 Export)

- [ ] Table `compliance_exports` migrée
- [ ] `POST /v1/compliance-cases/{id}:export-dossier` retourne 202 + `export_id`
- [ ] Job async génère PDF depuis toutes les sections disponibles
- [ ] `GET /v1/compliance-cases/{id}/exports/{export_id}` retourne statut + download_url
- [ ] Signed URL Supabase Storage (expiration 1h, fichier TTL 7j)
- [ ] Events `ComplianceDossierExportRequested` + `ComplianceDossierExportCompleted` publiés
- [ ] Tests : création, polling, téléchargement, RBAC, multi-tenant

---

## COMPLÉMENT 3 — M1.2 Dashboard Admin Plateforme (V1 MINIMAL)

**Document cible** : À créer comme nouvelle section dans le SOCLE ou comme nouveau document `SECTION 10.G — ADMIN PLATEFORME V1`
**Source prototype** : `Ancien prototype/PROTOTYPE_FEATURES.md` — 11 écrans documentés

### Périmètre V1 MINIMAL retenu

```
V1 MINIMAL (endpoints read-only + gestion agences basique) :
  ✅ Stats globales plateforme (KPIs)
  ✅ Gestion agences : liste, détail, statut
  ✅ Lecture conformité globale (vue platform_admin)
  ❌ Analytics avancées (4 onglets Croissance/Distribution/Conformité/Système) → V2
  ❌ Gestion plans tarifaires → V2
  ❌ Feature toggles avancés (Country Pack, API access) → V2

Source décision : Audit fonctionnel 2026-02-22, Q2 Option A retenue.
```

### RBAC platform_admin (décision Q4 — Option A retenue)

```
ARCHITECTURE RETENUE (V1) :
  platform_admin = rôle JWT avec tenant_id = null (bypass RLS)
  Pas de tenant système séparé en V1

Claims JWT platform_admin:
  { sub: uuid, role_type: "platform_admin", tenant_id: null, exp: ... }

Permissions:
  SELECT sur toutes les tables (bypass RLS via policy dédiée)
  INSERT/UPDATE/DELETE sur tables de configuration (tenants, tenant_settings, agency_profiles)
  INTERDIT : modifier compliance_cases, missions, timesheets (données métier des tenants)

Source: SOCLE §RBAC, Décision audit Q4 Option A
```

### Endpoints V1 MINIMAL (à intégrer dans PATCH_OPENAPI_V1.3 ou patch V1.4)

```yaml
# Stats globales
GET /v1/admin/platform/stats:
  summary: KPIs globaux de la plateforme (aggregats cross-tenant)
  rbac: [platform_admin]
  response:
    active_tenants_count: integer
    active_agencies_count: integer
    active_missions_count: integer
    total_detached_workers: integer
    compliance_alerts_count: integer
    marketplace_active_agencies: integer

# Liste tenants/agences
GET /v1/admin/platform/tenants:
  summary: Liste de tous les tenants actifs
  rbac: [platform_admin]
  parameters: [status, plan_type, page, limit]
  response: paginated tenants list

# Détail tenant
GET /v1/admin/platform/tenants/{tenant_id}:
  summary: Détail d'un tenant (metrics + settings)
  rbac: [platform_admin]
  response: tenant + agency_profile + stats

# Modifier statut tenant
PATCH /v1/admin/platform/tenants/{tenant_id}/status:
  summary: Activer / suspendre un tenant
  rbac: [platform_admin]
  body: { status: active|suspended, reason: string }

# Conformité globale (vue plateforme)
GET /v1/admin/platform/compliance-overview:
  summary: Vue agrégée conformité cross-tenant
  rbac: [platform_admin]
  response:
    tenants_with_critical_alerts: integer
    tenants_with_marketplace_suspended: integer
    top_compliance_issues: [{ code, count }]
```

### Definition of Done (M1.2 Dashboard Admin Plateforme V1)

- [ ] Endpoints `/v1/admin/platform/*` implémentés (RBAC `platform_admin` uniquement)
- [ ] Claims JWT `platform_admin` avec `tenant_id=null` gérés au niveau middleware
- [ ] RLS : policies `platform_admin` bypass sur toutes les tables concernées
- [ ] Stats agrégées cross-tenant (sans exposer données PII individuelles)
- [ ] Test RBAC : `tenant_admin` reçoit 403 sur `/v1/admin/platform/*`
- [ ] Test : `platform_admin` ne peut pas modifier compliance_cases d'un tenant (403)

---

## COMPLÉMENT 4 — Corrections narratif SOCLE (ERRATA-ready)

**Document cible** : ERRATA — Clarifications contractuelles V1.1 (mise à jour)
**Action** : Ajouter les clarifications suivantes si non déjà présentes

### Clarification C1 — Facturation depuis timesheets (déjà dans ERRATA V1.1)

Référence : ERRATA V1.1 existant. **Aucune action si déjà documentée.**

Vérification : l'ERRATA V1.1 mentionne-t-il explicitement que `POST /v1/invoices:from-timesheet` est **actif en V1** sans feature flag ?
→ Si oui : ✅ aucun ajout nécessaire
→ Si non : ajouter la clarification C1 ci-dessous

```markdown
### Clarification C1 — Facturation depuis timesheets : V1 actif (résolution SOCLE vs OpenAPI)

**Contradiction** : Le narratif SOCLE §M10 évoque "facturation depuis timesheets = V2".
L'endpoint `POST /v1/invoices:from-timesheet` est présent dans `2.11 OPENAPI LOCKED`.

**Décision OWNER (2026-02-20)** : L'OpenAPI fait autorité. L'endpoint est **actif en V1**, sans feature flag.
`timesheets.billing_status` = `'billed'` est positionné lors de la création de la facture (Mode C1).

**Source** : `2.11 LOCKED`, `2.9.15.2-C` (champ `billing_status`), `ERRATA V1.1`.
```

### Clarification C2 — Offline mobile : V2 (résolution SOCLE vs Checklist 6.0)

```markdown
### Clarification C2 — Mobile PWA : online-only en V1 (résolution SOCLE vs Checklist 6.0)

**Contradiction** :
  - SOCLE TECHNIQUE GELÉ V1 (LOCKED) §M13 : "PWA online-only (V1) — offline = V2"
  - SECTION 6 — Checklist Globale 6.0 ligne 82 : "Offline partiel validé (lecture missions & documents)"

**Résolution par hiérarchie documentaire** : SOCLE (H1) prime sur Checklist 6.0 (H3).

**Décision confirmée** : La PWA worker est **online-only en V1**.
L'item "Offline partiel validé" de la Checklist 6.0 est **hors scope V1** — reporté V2.

**Action** : Checklist 6.0 ligne 82 → marquée V2 (voir corrections documentaires).
**Source** : SOCLE §Mobile, SECTION 6 ligne 82.
```

### Clarification C3 — Section 2.10.4.11 : patch addendum

```markdown
### Clarification C3 — Section 2.10.4.11 : addendum events (résolution référence orpheline)

**Problème** : Les documents 6.7 (ligne 41), 6.6, SECTION 9 référencent "2.10.4.11" comme source d'events
(`ComplianceDurationAlert`, `WorkerSkillAdded`) mais cette section n'existe pas dans `2.10 EVENTS MÉTIER V1 LOCKED`.

**Résolution** : Fichier patch `PATCH_EVENTS_2.10.4.11.md` créé dans `SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/`.
Ce patch fait autorité pour les events `ComplianceDurationAlert`, `WorkerSkillAdded`, `SipsiDeclarationCreated`,
`SipsiDeclarationStatusChanged`, `ComplianceDossierExportRequested`, `ComplianceDossierExportCompleted`.

**Le document 2.10 LOCKED n'est pas modifié** — le patch est l'addendum officiel V1.2.2.
**Source** : `PATCH_EVENTS_2.10.4.11.md` (ce repo).
```

---

## COMPLÉMENT 5 — DB Patch 2.9.16-G (tables complémentaires)

**Résumé** : Ce patch consolide les tables manquantes non couvertes par 2.9.16-C/E/F.

| Table | Lot | Blocage résolu |
|---|---|---|
| `equal_treatment_checks` | 7 | Endpoint égalité de traitement (complément 1) |
| `compliance_exports` | 7 | Endpoint export inspection-ready (complément 2) |

**DDL** : voir sections complément 1 et complément 2 ci-dessus.

**Naming migrations** :
- `20260222000005__lot7_m8_equal_treatment_checks.sql`
- `20260222000006__lot7_m8_compliance_exports.sql`

---

## Récapitulatif — Fichiers impactés par ces completions

| Complément | Document cible | Type d'action |
|---|---|---|
| C1 — Égalité de traitement | Créer `6.9` ou ajouter dans `6.7` | Nouveau |
| C1 — DB equal_treatment_checks | Patch 2.9.16-G | Nouveau |
| C2 — Export dossier | Ajouter dans `6.7` comme M8.4 | Nouveau |
| C2 — DB compliance_exports | Patch 2.9.16-G | Nouveau |
| C3 — Dashboard Admin V1 MINIMAL | Créer `SECTION 10.G` | Nouveau |
| C4 — ERRATA clarifications | `ERRATA V1.1` | Mise à jour si absent |
| C5 — DB 2.9.16-G | Patch consolidé | Nouveau |

---

## Mini-changelog

- 2026-02-22 : Création initiale. 5 compléments CDC : M8.3 Égalité de traitement, M8.4 Export dossier, M1.2 Admin plateforme, Corrections narratif SOCLE, Patch DB 2.9.16-G. Tous sourcés sur documents internes vérifiés.
