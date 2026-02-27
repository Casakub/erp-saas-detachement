# PATCH OPENAPI V1.4 — Platform Admin Surfaces (`/v1/admin/platform/*`)

**Statut** : DRAFT (addendum contractuel)
**Version** : 1.4
**Date** : 2026-02-22

---

## Objectif

Ajouter au contrat OpenAPI les surfaces platform admin deja definies dans :
- `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` (matrice RBAC)
- `DECISIONS_OWNER_V1.2.md` (decision D1)

Ce patch couvre uniquement les endpoints `/v1/admin/platform/*` et supprime l'ambiguite contractuelle "RBAC present mais OpenAPI absent".

---

## Endpoints ajoutes

### 1) GET `/v1/admin/platform/stats`
- Summary: KPIs globaux cross-tenant de la plateforme.
- RBAC: `platform_admin` uniquement.
- Reponses:
  - `200`: `{ active_tenants_count, active_agencies_count, active_missions_count, compliance_alerts_count, marketplace_active_agencies }`
  - `403`: role non autorise

### 2) GET `/v1/admin/platform/tenants`
- Summary: liste paginee des tenants.
- RBAC: `platform_admin` uniquement.
- Query params: `status`, `page`, `limit`.
- Reponses:
  - `200`: `{ items: [...], page, limit, total }`
  - `403`: role non autorise

### 3) GET `/v1/admin/platform/tenants/{tenant_id}`
- Summary: detail tenant (profil + indicateurs agregés).
- RBAC: `platform_admin` uniquement.
- Reponses:
  - `200`: `{ tenant, agency_profile, stats }`
  - `404`: tenant introuvable
  - `403`: role non autorise

### 4) PATCH `/v1/admin/platform/tenants/{tenant_id}/status`
- Summary: activer/suspendre un tenant.
- RBAC: `platform_admin` uniquement.
- Request body: `{ status: "active|suspended", reason?: string }`
- Reponses:
  - `200`: `{ tenant_id, status, updated_at }`
  - `404`: tenant introuvable
  - `403`: role non autorise

### 5) GET `/v1/admin/platform/compliance-overview`
- Summary: agregats conformite cross-tenant.
- RBAC: `platform_admin` uniquement.
- Reponses:
  - `200`: `{ tenants_with_critical_alerts, tenants_with_marketplace_suspended, top_compliance_issues }`
  - `403`: role non autorise

---

## RBAC attendu

- Autorise: `platform_admin` uniquement.
- Refuse (403): `tenant_admin`, `agency_user`, `consultant`, `client_user`, `worker`.
- Source: `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` (sections "1) Administration plateforme" et checklist de validation).

---

## Events

- Aucun nouvel event ajoute.
- Ce patch ne modifie pas le catalogue `2.10` / `2.10.4.11`.

---

## Tables impactees (lecture/ecriture)

Aucune table nouvelle. Appui sur tables existantes :
- `tenants`, `tenant_settings`, `agency_profiles`, `marketplace_access` (configuration plateforme)
- `missions`, `compliance_cases` (lecture agregee)

Sources DB: `2 9 - Schéma DB V1 1 (V1 + Patch)`.

---

## Tests a ajouter / adapter

- RBAC:
  - `platform_admin` -> `200` sur les 5 endpoints.
  - tout autre role -> `403` sur `/v1/admin/platform/*`.
- Audit:
  - `PATCH /v1/admin/platform/tenants/{tenant_id}/status` trace une entree `audit_logs`.
- Multi-tenant:
  - endpoints platform exposent une vue cross-tenant uniquement pour `platform_admin`.

---

## Notes de tracabilite

- Justification NON TROUVE (OpenAPI absent) resolue par ce patch.
- Ce document n'altere aucun document LOCKED; il agit comme addendum contractuel V1.4.

