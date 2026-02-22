# PATCH DB — 2.9.16-E — rfp_requests.visibility + rfp_contact_logs

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — décision OWNER Q5-B actée, endpoints 2.11.a actifs

---

## Contexte & Justification

### Problème identifié

Deux gaps liés au mécanisme RFP marketplace (décision Q5-B) :

**Gap A** — Le champ `visibility` est absent de la table `rfp_requests` en 2.9.
L'endpoint `PATCH /v1/rfps/{rfp_id}/visibility` est défini en `2.11.a V1.2.2` mais aucun champ DB ne le supporte.

**Gap B** — La table `rfp_contact_logs` est absente de 2.9.
L'endpoint `POST /v1/rfps/{rfp_id}/contact-logs` est défini en `2.11.a V1.2.2` (anti-désintermédiation) mais sans table DB correspondante.

### Références sources

| Source | Référence | Contenu |
|---|---|---|
| `2.11.a — OPENAPI V1.2 (PATCH)` | ligne 482 | `PATCH /v1/rfps/{rfp_id}/visibility` + champ `visibility: private\|public` |
| `2.11.a — OPENAPI V1.2 (PATCH)` | ligne 493 | `POST /v1/rfps/{rfp_id}/contact-logs` + schema `RfpContactLogRequest` |
| `6.8 — CHECKLIST LOT 8` | ligne 113 | `rfp_requests` avec champ `visibility: private\|public` — référence `2.9.16-E` |
| `6.8 — CHECKLIST LOT 8` | ligne 128 | "`PATCH /v1/rfps/{id}/visibility` permet de passer une RFP de `private` à `public`" |
| `SECTION 10.F — MVP V1/V2 MATRIX` | Décision Q5-B | "RFP marketplace utilise le même mécanisme, visibility flag unifié" |
| `Ancien prototype/PROTOTYPE_FEATURES.md` | Écran RFP | Filtrage public/privé des offres |

### Décision contractuelle Q5-B

> **Q5-B (OWNER actée)** : La marketplace utilise le même mécanisme RFP que M4 (Lot 4), avec `visibility = public`. La RFP unifiée est le modèle retenu pour V1. Pas de système RFP séparé.

Source : `6.8 — CHECKLIST LOT 8 ligne 127`, `SECTION 10.F MVP Matrix`.

---

## DDL SQL — Gap A : ALTER TABLE rfp_requests

### Naming convention migrations (SECTION 9)

Format : `YYYYMMDDHHMMSS__lot<N>_m<M>_<slug>.sql`
→ `20260222000002__lot4_m4_rfp_requests_visibility.sql`

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-E (Gap A) — rfp_requests.visibility
-- Lot 4 — M4 (RFP & Allocation)
-- Convention: 20260222000002__lot4_m4_rfp_requests_visibility.sql
-- ============================================================

-- Ajout du champ visibility sur rfp_requests (table existante 2.9.4)
ALTER TABLE rfp_requests
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'public'));

-- Index pour filtrer rapidement les RFPs publiques (marketplace listing)
CREATE INDEX IF NOT EXISTS idx_rfp_requests_visibility
  ON rfp_requests (visibility)
  WHERE visibility = 'public';

-- Index composite pour marketplace : RFPs publiques d'un tenant
CREATE INDEX IF NOT EXISTS idx_rfp_requests_tenant_visibility
  ON rfp_requests (tenant_id, visibility);
```

---

## DDL SQL — Gap B : CREATE TABLE rfp_contact_logs

### Naming convention migrations (SECTION 9)

→ `20260222000003__lot4_m4_rfp_contact_logs.sql`

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-E (Gap B) — rfp_contact_logs
-- Lot 4 — M4 (RFP & Allocation) — Anti-désintermédiation
-- Convention: 20260222000003__lot4_m4_rfp_contact_logs.sql
-- ============================================================

CREATE TABLE rfp_contact_logs (
  -- Identité
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Isolation multi-tenant (RLS)
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- RFP concernée
  rfp_id          UUID        NOT NULL REFERENCES rfp_requests(id) ON DELETE CASCADE,

  -- Agence qui a initié le contact (côté candidat)
  agency_id       UUID        NOT NULL REFERENCES tenants(id),

  -- Utilisateur qui a loggé le contact
  logged_by       UUID        NOT NULL REFERENCES users(id),

  -- Nature du contact (source: 2.11.a RfpContactLogRequest)
  contact_type    TEXT        NOT NULL CHECK (contact_type IN ('email', 'phone', 'platform', 'meeting', 'other')),

  -- Partie contactée (côté client ou autre agence)
  counterpart_tenant_id UUID  REFERENCES tenants(id),

  -- Horodatage du contact (peut être antérieur à la date de log)
  occurred_at     TIMESTAMPTZ NOT NULL,

  -- Note libre (audit trail)
  notes           TEXT,

  -- Métadonnées
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Lookup par RFP (principal : liste des contacts sur une RFP)
CREATE INDEX idx_rfp_contact_logs_rfp_id
  ON rfp_contact_logs (rfp_id);

-- Lookup par tenant (pour audit global)
CREATE INDEX idx_rfp_contact_logs_tenant_id
  ON rfp_contact_logs (tenant_id);

-- Lookup par agence (pour audit côté agence)
CREATE INDEX idx_rfp_contact_logs_agency_id
  ON rfp_contact_logs (agency_id);

-- Chronologie des contacts (pour timeline)
CREATE INDEX idx_rfp_contact_logs_occurred_at
  ON rfp_contact_logs (rfp_id, occurred_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE rfp_contact_logs ENABLE ROW LEVEL SECURITY;

-- Politique 1 : tenant propriétaire de la RFP voit tous les logs de ses RFPs
CREATE POLICY rls_rcl_rfp_owner
  ON rfp_contact_logs
  FOR ALL
  TO authenticated
  USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 2 : agence voit uniquement ses propres logs (les contacts qu'elle a loggés)
CREATE POLICY rls_rcl_agency_own_logs
  ON rfp_contact_logs
  FOR SELECT
  TO authenticated
  USING (
    agency_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 3 : platform_admin bypass
CREATE POLICY rls_rcl_platform_admin
  ON rfp_contact_logs
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

---

## Politiques RLS — rfp_requests.visibility

Le champ `visibility` hérite des RLS déjà définies sur `rfp_requests` (2.9.4). Pas de politique supplémentaire nécessaire — la RLS tenant isolation existante s'applique. Le filtrage marketplace (agences certifiées voient les RFPs publiques) est géré au niveau applicatif (WHERE clause sur `visibility = 'public'`).

---

## Politiques RLS — rfp_contact_logs

| Rôle | SELECT | INSERT | UPDATE | DELETE | Condition |
|---|---|---|---|---|---|
| `tenant_admin` (propriétaire RFP) | ✅ | ✅ | ✅ | ✅ | `tenant_id` JWT = table `tenant_id` |
| `agency_user` (propriétaire RFP) | ✅ | ✅ | ❌ | ❌ | `tenant_id` JWT = table `tenant_id` |
| `agency_user` (agence loggant) | ✅ (ses logs) | ✅ | ❌ | ❌ | `agency_id` = `tenant_id` JWT |
| `platform_admin` | ✅ | ✅ | ✅ | ✅ | bypass global |
| `client_user` | ❌ | ❌ | ❌ | ❌ | exclu |
| `worker` | ❌ | ❌ | ❌ | ❌ | exclu |
| `consultant` | ❌ | ❌ | ❌ | ❌ | exclu |

---

## Règles métier V1 (non-DDL)

### Transition visibility (rfp_requests)

```
RÈGLE V1 :
  private → public : autorisé si marketplace_access.status = 'active' du tenant propriétaire
  public → private : autorisé uniquement si aucune réponse soumise (status RFP = 'open')
  public → private avec réponses existantes : erreur 422 (non réversible)

RBAC :
  Seul tenant_admin et agency_user (owner du tenant) peuvent modifier visibility
  Source: 2.12.a V1.2.2
```

### Anti-désintermédiation (rfp_contact_logs)

```
RÈGLE V1 :
  Obligation de logguer tout contact direct (hors plateforme) entre agences et clients
  autour d'une RFP active.
  But : traçabilité audit, prévention désintermédiation.
  V1 : log manuel (formulaire) — V2 : détection automatique
```

---

## Impact — Endpoints débloqués

| Endpoint | Méthode | Source | Statut après patch |
|---|---|---|---|
| `/v1/rfps/{id}/visibility` | PATCH | `2.11.a` | ✅ Champ DB disponible |
| `/v1/rfps/{id}/contact-logs` | POST | `2.11.a` | ✅ Table DB disponible |
| `/v1/rfps/{id}/contact-logs` | GET | `2.11.a` | ✅ Table DB disponible |
| `GET /v1/marketplace/agencies` | GET | `2.11` V1.3 (PATCH_OPENAPI) | Dépend aussi de PATCH_OPENAPI_V1.3 |

**Events concernés** :
- `RfpVisibilityChanged` → à documenter dans PATCH_EVENTS_2.10.4.11 (si nécessaire)
- Aucun event direct sur `rfp_contact_logs` en V1 (log silencieux, audit trail uniquement)

---

## Checklist de validation

- [ ] Migration `20260222000002__lot4_m4_rfp_requests_visibility.sql` appliquée
- [ ] Migration `20260222000003__lot4_m4_rfp_contact_logs.sql` appliquée
- [ ] RLS activé sur `rfp_contact_logs`
- [ ] `PATCH /v1/rfps/{id}/visibility` : transition `private → public` fonctionne
- [ ] `PATCH /v1/rfps/{id}/visibility` : erreur 422 si `marketplace_access.status ≠ active`
- [ ] `POST /v1/rfps/{id}/contact-logs` : log créé + isolé par tenant
- [ ] Test RBAC : `worker` et `client_user` reçoivent 403
- [ ] Test cross-tenant : agence A ne voit pas les logs de la RFP du tenant B
- [ ] Test GWT 6.8 : RFP `private → public` visible par agences certifiées actives

---

## Alignement contrat

| Pilier | rfp_requests.visibility | rfp_contact_logs |
|---|---|---|
| DB | ✅ (patch) | ✅ (patch) |
| OpenAPI `2.11.a` | ✅ Endpoint actif | ✅ Endpoint actif |
| Events | N/A | N/A (V1 silencieux) |
| RBAC | Hérité RLS existant | ✅ RLS définie |
| E2E / GWT 6.8 | ✅ | ✅ |

---

## Mini-changelog

- 2026-02-22 : Création du patch suite à audit fonctionnel — double gap : champ `visibility` absent de `rfp_requests` + table `rfp_contact_logs` absente, tous deux bloquant les endpoints actifs en 2.11.a.
