# 2.12.b — RBAC & PERMISSIONS — platform_admin (PATCH)

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — rôle existant en DB sans matrice RBAC définie
- **Complète**: `2.12.a — RBAC V1.2 (PATCH)` et `2.12 LOCKED V1`

---

## Contexte & Justification

### Problème identifié

Le rôle `platform_admin` est présent dans :
- DB 2.9 LOCKED : enum `role_type` contient `platform_admin`
- SOCLE TECHNIQUE GELÉ §0 : personas, rôle décrit
- `Ancien prototype/PROTOTYPE_FEATURES.md` : 11 écrans dédiés (dashboard, analytics, gestion agences, permissions)

Mais **absent de** :
- `2.12 LOCKED` : aucune colonne `platform_admin` dans les matrices
- `2.12.a V1.2.2` : aucune mention du rôle
- Tout JWT middleware ou politique RLS dédiée

**Impact** : Les développeurs ne savent pas quelles permissions accorder à `platform_admin`. Risque de sur-permission (bypass non intentionnel) ou sous-permission (rôle inutilisable).

### Références sources

| Source | Référence | Contenu |
|---|---|---|
| `2.9 LOCKED §2.9.2` | Table `users.role_type` enum | `platform_admin` listé comme valeur valide |
| `SOCLE TECHNIQUE GELÉ §0` | Personas | "platform_admin : gère la plateforme SaaS globale" |
| `Ancien prototype` | 11 écrans | Dashboard KPIs, Analytics, Gestion Agences, Gestion Permissions |
| `CDC_COMPLETIONS_FROM_AUDIT §3` | M1.2 | Architecture platform_admin V1 MINIMAL — Option A retenue |

### Architecture retenue (V1 — Décision Q4 Option A)

```json
ARCHITECTURE V1 :
  platform_admin = rôle JWT avec tenant_id = null (ou valeur sentinel)
  Bypass RLS via policies dédiées sur toutes les tables
  Pas de tenant système séparé en V1

CLAIMS JWT platform_admin :
  {
    sub: "<uuid>",
    role_type: "platform_admin",
    tenant_id: null,          ← différence clé vs autres rôles
    exp: <timestamp>,
    jti: "<uuid>"
  }

RÈGLE FONDAMENTALE :
  platform_admin NE peut PAS modifier les données métier des tenants
  (compliance_cases, missions, timesheets, invoices, worker data)
  platform_admin peut : lire tout, gérer les tenants (configuration), suspendre/activer
```

---

## Matrice RBAC platform_admin

### Principe de la matrice

| Symbole | Signification |
|---|---|
| ✅ | Autorisé |
| 👁️ | Lecture seule |
| ❌ | Interdit (403) |
| 🚫 | Interdit par principe d'architecture (ne pas implémenter) |

### 1) Administration plateforme (endpoints /v1/admin/platform/*)

*Ces endpoints sont nouveaux — définis dans `CDC_COMPLETIONS_FROM_AUDIT §3`.*

| Endpoint | platform_admin | tenant_admin | agency_user | Tous autres |
|---|---|---|---|---|
| `GET /v1/admin/platform/stats` | ✅ | ❌ | ❌ | ❌ |
| `GET /v1/admin/platform/tenants` | ✅ | ❌ | ❌ | ❌ |
| `GET /v1/admin/platform/tenants/{id}` | ✅ | ❌ | ❌ | ❌ |
| `PATCH /v1/admin/platform/tenants/{id}/status` | ✅ | ❌ | ❌ | ❌ |
| `GET /v1/admin/platform/compliance-overview` | ✅ | ❌ | ❌ | ❌ |

> Note : Tous les endpoints `/v1/admin/platform/*` sont exclusivement `platform_admin`. Un `tenant_admin` qui tente d'y accéder reçoit **403**.

### 2) Données métier des tenants (lecture seule cross-tenant)

*Ces endpoints existent déjà en 2.11 LOCKED et 2.11.a — on ajoute la colonne `platform_admin`.*

| Endpoint | platform_admin | Notes |
|---|---|---|
| `GET /v1/missions` | 👁️ cross-tenant | Lecture agrégée, ne peut pas modifier |
| `GET /v1/missions/{id}` | 👁️ cross-tenant | Lecture détail |
| `GET /v1/compliance-cases/{id}` | 👁️ cross-tenant | Lecture dossier conformité |
| `GET /v1/workers/{id}` | 👁️ cross-tenant | Lecture fiche worker |
| `GET /v1/agency-profiles` | ✅ cross-tenant | Gestion profils agences |
| `PATCH /v1/agency-profiles/{id}` | ✅ cross-tenant | Modification profil agence (si autorisé) |
| `GET /v1/marketplace/agencies` | ✅ cross-tenant | Vue globale marketplace |
| `GET /v1/leads` | 👁️ cross-tenant | Lecture CRM tous tenants |
| `GET /v1/invoices` | 👁️ cross-tenant | Lecture facturation tous tenants |

### 3) Configuration plateforme

| Endpoint | platform_admin | Notes |
|---|---|---|
| `GET /v1/admin/salary-grids` | ✅ | Import et lecture grilles salariales globales |
| `POST /v1/admin/salary-grids` | ✅ | Création grille (équivalent `system`) |
| `POST /v1/admin/mandatory-pay-items` | ✅ | Équivalent `system` |
| `GET /v1/admin/country-rulesets` | ✅ | Lecture rulesets pays |
| `PATCH /v1/admin/country-rulesets/{id}` | ✅ | Modification seuils durée (pays) |

### 4) INTERDIT — données métier en écriture (protection)

| Catégorie | Endpoints | Raison d'interdiction |
|---|---|---|
| Missions | `POST/PATCH /v1/missions/*` | Données métier tenant — non modifiable cross-tenant |
| Compliance | `POST /v1/compliance-cases/*` | Données conformité tenant — intégrité audit |
| Timesheets | `POST/PATCH /v1/timesheets/*` | Données opérationnelles tenant |
| Invoices | `POST /v1/invoices*` | Facturation tenant — impact financier |
| Workers | `POST/PATCH /v1/workers/*` | Dossiers workers — données RH tenant |
| SIPSI | `POST /v1/*/sipsi-declaration` | Données déclaratives tenant |

> **Règle** : `platform_admin` lit tout, administre la plateforme, ne touche pas aux données métier des tenants.

### 5) Endpoints V1.3 (PATCH_OPENAPI_V1.3 — nouveaux)

| Endpoint | platform_admin | Notes |
|---|---|---|
| `GET /v1/marketplace/agencies` | ✅ | Vue cross-tenant |
| `POST /v1/leads/{id}/activities` | 👁️ lire seulement via GET | Pas d'écriture CRM cross-tenant |
| `GET /v1/leads/{id}/activities` | 👁️ cross-tenant | Lecture audit |
| `POST /v1/compliance-cases/{id}:export-dossier` | ✅ | Peut exporter pour inspection |
| `GET /v1/compliance-cases/{id}/exports/{export_id}` | ✅ | Lecture statut export |
| `GET /v1/compliance-cases/{id}/compliance-score` | 👁️ cross-tenant | Lecture score |
| `POST /v1/compliance-cases/{id}/equal-treatment-check` | 🚫 | Données métier tenant |
| `GET /v1/compliance-cases/{id}/equal-treatment-check` | 👁️ cross-tenant | Lecture audit |

---

## Implémentation JWT middleware

### Vérification du rôle platform_admin

```typescript
// middleware/rbac.ts

export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  const claims = req.jwtClaims; // extrait par middleware JWT Supabase

  if (claims.role_type !== 'platform_admin') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'This endpoint requires platform_admin role'
    });
  }

  // tenant_id = null pour platform_admin
  // Pas d'injection de tenant_id dans les queries — bypass RLS
  next();
}

// Pour les routes cross-tenant (lecture) :
export function allowPlatformAdminCrossTenant(req: Request, res: Response, next: NextFunction) {
  const claims = req.jwtClaims;

  if (claims.role_type === 'platform_admin') {
    // Bypass RLS — passer en mode service_role ou via headers Supabase
    req.bypassRls = true;
    req.tenantId = null; // pas de filtre tenant
  } else {
    req.bypassRls = false;
    req.tenantId = claims.tenant_id;
  }

  next();
}
```

### Politique RLS Supabase (modèle générique à appliquer sur toutes les tables)

```sql
-- Template à appliquer sur CHAQUE table qui n'a pas encore de policy platform_admin :

CREATE POLICY rls_<table>_platform_admin
  ON <table>
  FOR ALL  -- ou FOR SELECT si lecture seule
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );

-- IMPORTANT : Pour les tables avec données métier (missions, compliance_cases, etc.)
-- restreindre à FOR SELECT uniquement :
CREATE POLICY rls_missions_platform_admin
  ON missions
  FOR SELECT
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

> Les patches DB 2.9.16-C, E, F, G incluent déjà les politiques `platform_admin` pour les nouvelles tables. Les tables existantes (LOCKED 2.9) nécessitent une migration dédiée pour ajouter ces politiques.

---

## Migration dédiée RLS platform_admin (tables existantes)

### Naming convention

→ `20260222000007__lot1_m1_rls_platform_admin_policies.sql`

### DDL

```sql
-- ============================================================
-- PATCH RBAC — platform_admin policies sur tables existantes
-- Lot 1 — M1 (Foundation / RBAC)
-- Convention: 20260222000007__lot1_m1_rls_platform_admin_policies.sql
-- ============================================================

-- Tables FONDATION (2.9.1 tenants + 2.9.2 users)
CREATE POLICY rls_tenants_platform_admin ON tenants
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_users_platform_admin ON users
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables CRM / CLIENTS / RFP (lecture seule)
CREATE POLICY rls_leads_platform_admin ON leads
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_clients_platform_admin ON clients
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_rfp_requests_platform_admin ON rfp_requests
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables MISSIONS / COMPLIANCE (lecture seule — données métier tenant)
CREATE POLICY rls_missions_platform_admin ON missions
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_compliance_cases_platform_admin ON compliance_cases
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_timesheets_platform_admin ON timesheets
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables WORKERS / ATS (lecture seule)
CREATE POLICY rls_workers_platform_admin ON workers
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables FINANCE (lecture seule)
CREATE POLICY rls_invoices_platform_admin ON invoices
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_quotes_platform_admin ON quotes
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables MARKETPLACE (lecture + écriture certification/ranking)
CREATE POLICY rls_agency_risk_scores_platform_admin ON agency_risk_scores
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_agency_certifications_platform_admin ON agency_certifications
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_marketplace_access_platform_admin ON marketplace_access
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables CONFIGURATION (lecture + écriture globales)
CREATE POLICY rls_salary_grids_platform_admin ON salary_grids
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

CREATE POLICY rls_country_rulesets_platform_admin ON country_rulesets
  FOR ALL TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables AUDIT (lecture seule — jamais d'écriture directe)
CREATE POLICY rls_audit_logs_platform_admin ON audit_logs
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');

-- Tables EVENTS (lecture seule pour monitoring)
CREATE POLICY rls_events_outbox_platform_admin ON events_outbox
  FOR SELECT TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin');
```

---

## Résumé des droits par catégorie

| Catégorie | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Config plateforme (tenants, tenant_settings) | ✅ | ✅ | ✅ | ❌ (soft delete seulement) |
| Marketplace (certifications, rankings, access) | ✅ | ✅ | ✅ | ❌ |
| Données métier (missions, compliance, timesheets) | ✅ | 🚫 | 🚫 | 🚫 |
| Données financières (invoices, quotes) | ✅ | 🚫 | 🚫 | 🚫 |
| Workers / CRM / RFP | ✅ | 🚫 | 🚫 | 🚫 |
| Salary grids / country_rulesets | ✅ | ✅ | ✅ | ❌ |
| Audit logs / events_outbox | ✅ | 🚫 | 🚫 | 🚫 |
| Exports dossiers | ✅ | ✅ | 🚫 | 🚫 |

**Légende** : 🚫 = Techniquement bloqué par absence de policy INSERT/UPDATE + principe d'architecture

---

## Checklist de validation

- [ ] Migration `20260222000007__lot1_m1_rls_platform_admin_policies.sql` appliquée
- [ ] JWT middleware : `platform_admin` avec `tenant_id=null` géré correctement
- [ ] Test : `platform_admin` peut lire toutes les missions cross-tenant (GET /v1/missions)
- [ ] Test : `platform_admin` NE peut PAS créer une mission (POST /v1/missions → 403)
- [ ] Test : `platform_admin` peut suspendre un tenant (PATCH /v1/admin/platform/tenants/{id}/status)
- [ ] Test : `tenant_admin` reçoit 403 sur `/v1/admin/platform/*`
- [ ] Test : authentification avec `tenant_id=null` ne déclenche pas d'erreur applicative
- [ ] Pas de fuite de données PII individuelle dans les stats agrégées
- [ ] Audit log : toutes les actions `platform_admin` tracées dans `audit_logs`

---

## Notes de traçabilité

- Contrats référencés : `2.9 LOCKED §2.9.2` (enum role_type), `SOCLE §0` (personas), `CDC_COMPLETIONS_FROM_AUDIT §3` (architecture Option A), `2.12 LOCKED` (matrice existante sans platform_admin).
- Ce patch ne modifie pas 2.12 LOCKED ni 2.12.a.
- Il est l'addendum officiel pour le rôle `platform_admin` jusqu'à intégration dans une révision LOCKED.

## Mini-changelog

- 2026-02-22 : Création. Résout GAP-08 (platform_admin sans matrice RBAC). Architecture Option A retenue (tenant_id=null, bypass RLS). 7 catégories de droits définies. Migration RLS dédiée pour les tables existantes.
