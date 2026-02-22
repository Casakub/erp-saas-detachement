# PATCH DB — 2.9.16-F — sipsi_declarations

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — bloque endpoint SIPSI assisté (2.11.a V1.2.2)

---

## Contexte & Justification

### Problème identifié

Le document `2.11.a — OPENAPI V1.2 (PATCH)` définit l'endpoint suivant pour le SIPSI assisté V1 :

```
POST /v1/compliance-cases/{compliance_case_id}/sipsi-declaration
```

Cet endpoint nécessite une table de persistance pour stocker les déclarations SIPSI. Or, le schéma DB `2.9 - Schéma DB V1.1` ne contient **aucune table `sipsi_declarations`** (vérifié : sections 2.9.1 à 2.9.15).

### Références sources

| Source | Référence | Contenu |
|---|---|---|
| `2.11.a — OPENAPI V1.2 (PATCH)` | Section SIPSI | `POST /v1/compliance-cases/{id}/sipsi-declaration` |
| `SECTION 6 — Checklist Globale 6.0` | ligne 163 | "Génération automatique SIPSI → Hors scope V1" (assisté = V1) |
| `SECTION 10.F — MVP V1/V2 MATRIX` | Ligne SIPSI | "SIPSI assisté = V1, SIPSI automatique (connecteur) = V2" |
| `SOCLE TECHNIQUE GELÉ V1` | §Conformité | SIPSI assisté mentionné comme livrable conformité V1 |
| `Ancien prototype/PROTOTYPE_FEATURES.md` | Écran Conformité | Onglet "Pré-déclarations" (SIPSI-like) visible |

### Scope V1 vs V2

```
V1 — SIPSI ASSISTÉ :
  ✅ Formulaire pré-rempli depuis données mission/worker/compliance_case
  ✅ Stockage déclaration en base (sipsi_declarations)
  ✅ Statut de suivi (draft → submitted → confirmed/rejected)
  ❌ Connexion directe API SIPSI → V2
  ❌ Soumission automatique → V2
```

**Source** : `SECTION 10.F MVP V1/V2 MATRIX`, `SECTION 6 ligne 163`.

### Contexte réglementaire SIPSI

SIPSI = Système d'Information sur les Prestations de Services Internationales.
Obligatoire en France pour toute prestation de services avec travailleurs détachés (Directive 96/71/CE, Code du Travail L.1262-2-1).
L'employeur doit déclarer **avant** le début de la mission.

---

## DDL SQL — Table `sipsi_declarations`

### Naming convention migrations (SECTION 9)

Format : `YYYYMMDDHHMMSS__lot<N>_m<M>_<slug>.sql`
→ `20260222000004__lot2_m8_sipsi_declarations.sql`

> Note : Classé Lot 2 / M8 car la conformité SIPSI est liée au Compliance Case (M8).

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-F — sipsi_declarations
-- Lot 2 / extension — M8 (Conformité Détachement)
-- Convention: 20260222000004__lot2_m8_sipsi_declarations.sql
-- ============================================================

CREATE TABLE sipsi_declarations (
  -- Identité
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Isolation multi-tenant (RLS)
  tenant_id           UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Liens métier (1 déclaration = 1 compliance_case = 1 mission = 1 worker)
  compliance_case_id  UUID        NOT NULL REFERENCES compliance_cases(id) ON DELETE RESTRICT,
  mission_id          UUID        NOT NULL REFERENCES missions(id) ON DELETE RESTRICT,
  worker_id           UUID        NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,

  -- Statut du cycle de vie de la déclaration
  -- draft     : saisie en cours (formulaire pré-rempli, non soumis)
  -- submitted : soumis manuellement (copie/envoi hors plateforme en V1)
  -- confirmed : confirmation reçue (manuelle en V1, API en V2)
  -- rejected  : rejeté par les autorités (avec motif)
  status              TEXT        NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'confirmed', 'rejected')),

  -- Référence externe SIPSI (numéro de déclaration attribué par SIPSI)
  -- Null en V1 tant que soumission est manuelle
  external_ref        TEXT,

  -- Pays hôte concerné par la déclaration (FR par défaut en V1)
  host_country        CHAR(2)     NOT NULL DEFAULT 'FR',

  -- Date de début de détachement déclarée (peut différer de mission.start_date)
  detachment_start_date DATE,

  -- Date de fin de détachement déclarée
  detachment_end_date   DATE,

  -- Payload JSON de la déclaration (données pré-remplies depuis mission + worker)
  -- Contient : identité worker, employeur, client, chantier/lieu, IDCC, durée
  payload_json        JSONB,

  -- Pièces jointes liées à la déclaration (références vault file_id)
  -- Array de UUIDs référençant files.id
  attached_file_ids   UUID[]      DEFAULT '{}',

  -- Note de rejet (si status = 'rejected')
  rejection_reason    TEXT,

  -- Horodatages
  submitted_at        TIMESTAMPTZ,   -- Date de soumission (manuelle V1)
  confirmed_at        TIMESTAMPTZ,   -- Date de confirmation
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

  -- Traçabilité auteur
  created_by          UUID           NOT NULL REFERENCES users(id),
  last_modified_by    UUID           REFERENCES users(id),
  last_modified_at    TIMESTAMPTZ,

  -- Contrainte : une seule déclaration active (non-rejetée) par compliance_case
  -- En cas de rejet, une nouvelle déclaration peut être créée (audit trail conservé)
  CONSTRAINT uq_sipsi_active_per_case
    EXCLUDE USING btree (compliance_case_id WITH =)
    WHERE (status IN ('draft', 'submitted', 'confirmed'))
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Lookup par compliance_case (principal : accès depuis dossier mission)
CREATE INDEX idx_sipsi_compliance_case_id
  ON sipsi_declarations (compliance_case_id);

-- Lookup par worker (historique SIPSI d'un worker)
CREATE INDEX idx_sipsi_worker_id
  ON sipsi_declarations (worker_id);

-- Lookup par tenant (vue d'ensemble admin)
CREATE INDEX idx_sipsi_tenant_id
  ON sipsi_declarations (tenant_id);

-- Filtrage par statut (dashboard conformité)
CREATE INDEX idx_sipsi_status
  ON sipsi_declarations (tenant_id, status);

-- Filtrage par pays hôte (pour multi-pays futur)
CREATE INDEX idx_sipsi_host_country
  ON sipsi_declarations (tenant_id, host_country);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE sipsi_declarations ENABLE ROW LEVEL SECURITY;

-- Politique 1 : tenant_admin + agency_user voient les déclarations de leur tenant
CREATE POLICY rls_sipsi_tenant_staff
  ON sipsi_declarations
  FOR ALL
  TO authenticated
  USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 2 : worker voit uniquement ses propres déclarations (lecture seule)
CREATE POLICY rls_sipsi_worker_read
  ON sipsi_declarations
  FOR SELECT
  TO authenticated
  USING (
    worker_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'worker'
  );

-- Politique 3 : platform_admin bypass
CREATE POLICY rls_sipsi_platform_admin
  ON sipsi_declarations
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

---

## Politiques RLS détaillées

| Rôle | SELECT | INSERT | UPDATE | DELETE | Condition |
|---|---|---|---|---|---|
| `tenant_admin` | ✅ | ✅ | ✅ | ❌ (audit trail) | `tenant_id` JWT |
| `agency_user` | ✅ | ✅ | ✅ si status=draft | ❌ | `tenant_id` JWT |
| `worker` | ✅ (ses) | ❌ | ❌ | ❌ | `worker_id` = JWT `sub` |
| `platform_admin` | ✅ | ✅ | ✅ | ✅ | bypass global |
| `client_user` | ❌ | ❌ | ❌ | ❌ | exclu |
| `consultant` | ❌ | ❌ | ❌ | ❌ | exclu |
| `system` | ✅ | ✅ | ✅ | ❌ | futur batch V2 |

**Règle DELETE** : Les déclarations SIPSI ne sont jamais supprimées en V1 (audit trail légal). Seul le statut change.

---

## Structure du payload_json (V1)

```json
{
  "declaration_version": "sipsi-v1",
  "employer": {
    "name": "string",
    "siret": "string",
    "address": "string",
    "country": "FR"
  },
  "worker": {
    "first_name": "string",
    "last_name": "string",
    "birth_date": "YYYY-MM-DD",
    "nationality": "XX",
    "social_security_number": "string",
    "a1_certificate_ref": "string|null"
  },
  "mission": {
    "host_country": "FR",
    "client_name": "string",
    "client_address": "string",
    "work_location": "string",
    "sector": "BTP|METAL|TRANSPORT|OTHER",
    "idcc_code": "string|null",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "weekly_hours": 35
  },
  "representative": {
    "name": "string",
    "phone": "string",
    "address_in_host_country": "string|null"
  }
}
```

**Note** : Ce payload est pré-rempli côté backend depuis les données de `missions`, `workers`, `compliance_cases`, `clients`. Le frontend affiche un formulaire d'édition avant soumission.

---

## Workflow V1 (assisté)

```
1. Agence crée compliance_case (M8, Lot 2)
2. Agence déclenche POST /v1/compliance-cases/{id}/sipsi-declaration
   → Backend pré-remplit payload_json depuis données mission/worker/client
   → Statut = 'draft'
3. Agence vérifie/complète les données manquantes via PUT/PATCH
4. Agence imprime/copie la déclaration et la soumet manuellement sur sipsi.travail.gouv.fr
5. Agence met à jour statut = 'submitted' + saisit external_ref si obtenu
6. Agence met à jour statut = 'confirmed' / 'rejected' selon retour SIPSI
```

**V2** : Soumission directe via API SIPSI (connecteur), confirmation automatique.

---

## Impact — Endpoints débloqués

| Endpoint | Méthode | Source | Statut après patch |
|---|---|---|---|
| `/v1/compliance-cases/{id}/sipsi-declaration` | POST | `2.11.a` | ✅ Table DB disponible |
| `/v1/compliance-cases/{id}/sipsi-declaration` | GET | `2.11.a` | ✅ Table DB disponible |
| `/v1/compliance-cases/{id}/sipsi-declaration` | PATCH | Implicite V1 | ✅ Table DB disponible |

**Events outbox** à ajouter dans PATCH_EVENTS_2.10.4.11 :
- `SipsiDeclarationCreated` — publié au POST (statut draft)
- `SipsiDeclarationStatusChanged` — publié sur changement de statut

---

## Checklist de validation

- [ ] Migration `20260222000004__lot2_m8_sipsi_declarations.sql` appliquée
- [ ] Contrainte d'unicité active (pas de doublon déclaration active par case)
- [ ] RLS activé + politiques créées
- [ ] Index créés
- [ ] POST : payload pré-rempli depuis mission + worker + compliance_case
- [ ] PATCH : mise à jour statut + external_ref fonctionne
- [ ] Test : `client_user` reçoit 403
- [ ] Test : worker peut lire ses propres déclarations
- [ ] Test multi-tenant : isolation vérifiée
- [ ] Audit trail : aucune DELETE possible (erreur 405)

---

## Alignement contrat

| Pilier | Statut avant | Statut après |
|---|---|---|
| DB `sipsi_declarations` | ❌ Absent | ✅ |
| OpenAPI `2.11.a` endpoint SIPSI | ⚠️ Endpoint sans DB | ✅ |
| Events `SipsiDeclarationCreated` | ⚠️ Non documenté | Voir PATCH_EVENTS_2.10.4.11 |
| RBAC | ⚠️ Pas de RLS définie | ✅ |
| Checklist 6.0 (SIPSI assisté V1) | ⚠️ Bloqué DB | ✅ |

---

## Mini-changelog

- 2026-02-22 : Création du patch suite à audit fonctionnel — table absente de 2.9 V1.1 malgré endpoint SIPSI actif en 2.11.a. SIPSI assisté confirmé V1 par SECTION 10.F MVP Matrix.
