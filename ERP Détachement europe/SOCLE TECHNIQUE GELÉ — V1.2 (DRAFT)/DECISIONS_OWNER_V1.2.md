# DÉCISIONS OWNER — V1.2 (FORMALISATIONS POST-AUDIT)

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code) — à valider formellement par OWNER
- **Portée**: Décisions architecturales et produit issues de l'audit 2026-02-22 — figées pour le build V1.

---

> **Usage** : Ce document enregistre les décisions formelles prises lors de l'audit fonctionnel du 2026-02-22.
> Chaque décision est liée à un patch ou document de référence. Les items marqués ⚠️ OWNER requièrent
> une validation formelle explicite du Product Owner avant build.

---

## SECTION DECISIONS V1.2

---

### DÉCISION D1 — platform_admin : Architecture Option A retenue

**Question initiale** : Q4 — Quelle architecture pour le rôle `platform_admin` ?

| Option | Description |
|---|---|
| **Option A (retenue)** ✅ | `platform_admin` avec `tenant_id = null` — bypass RLS via policy dédiée |
| Option B (rejetée) | Tenant système séparé (`tenant_id = PLATFORM_TENANT_UUID`) |
| Option C (rejetée) | Flag `is_platform_admin` dans la table users |

#### Décision formelle

> **V1 : platform_admin avec `tenant_id = null` (Option A)**

**Claims JWT `platform_admin`** :
```json
{
  "sub": "uuid",
  "role_type": "platform_admin",
  "tenant_id": null,
  "exp": 1234567890,
  "jti": "uuid"
}
```

**Permissions V1 accordées** :
- `SELECT` sur toutes les tables métier (bypass RLS via policy dédiée `rls_*_platform_admin`)
- `INSERT/UPDATE/DELETE` sur tables de configuration : `tenants`, `tenant_settings`, `agency_profiles`, `marketplace_access`
- `PATCH /v1/admin/platform/tenants/{id}/status` → activer / suspendre un tenant

**Permissions V1 explicitement interdites** :
- `INSERT/UPDATE/DELETE` sur `compliance_cases`, `missions`, `timesheets`, `invoices`, `workers` (données métier des tenants)
- Tout endpoint `/v1/` hors préfixe `/v1/admin/platform/*` (sauf lecture agrégée)

**Endpoints dédiés V1 MINIMAL** :
```json
GET  /v1/admin/platform/stats                         (KPIs globaux cross-tenant)
GET  /v1/admin/platform/tenants                       (liste tenants paginée)
GET  /v1/admin/platform/tenants/{tenant_id}           (détail tenant)
PATCH /v1/admin/platform/tenants/{tenant_id}/status   (activer/suspendre)
GET  /v1/admin/platform/compliance-overview           (agrégats conformité)
```

**Référence patch** : [`PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md`](./PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md)

**Justification Option A** :
- Simplicité maximale : pas de tenant fictif à gérer
- JWT déjà utilisé pour RBAC — extension naturelle via `role_type`
- RLS : une policy `platform_admin` suffit sur chaque table (pattern identique à `rls_etc_platform_admin`)
- Migration triviale vers Option B en V2 si besoin multi-platform-admin

**Statut validation** : ⚠️ DÉCISION À VALIDER FORMELLEMENT PAR OWNER (retenue par défaut audit 2026-02-22)

---

### DÉCISION D2 — ATS Scoring : V1 = règles-based (sans LLM)

**Question initiale** : Q7 — Quel modèle de scoring pour le module ATS M5 ?

| Option | Description |
|---|---|
| **Règles-based V1 (retenu)** ✅ | Algorithme déterministe 4 composantes (skills, expérience, langues, certifications) |
| LLM scoring (rejeté V1) | Appel modèle de langage pour matching sémantique + explication |

#### Décision formelle

> **V1 : scoring rules-based, `model_version = "rules-v1.0"`, sans appel LLM**
> **LLM scoring explanation = V2 uniquement**

**Algorithme** : voir [`PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md`](./PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md)

**Composantes** :
- Skills match : 50%
- Expérience years : 30%
- Langues : 15%
- Certifications : 5%

**Output** : `ai_score` [0-100] + `score_breakdown` JSONB + `model_version = "rules-v1.0"`

**Justification** :
- Déterminisme requis (audit trail, score immuable reproductible)
- Pas de coût LLM par candidature
- Latence compatible avec flow synchrone post-`CandidateParsed`
- Conforme pattern "assisted, rules-first" du SOCLE V1

**Statut validation** : ⚠️ DÉCISION À VALIDER FORMELLEMENT PAR OWNER (retenue par défaut audit 2026-02-22)

---

### DÉCISION D3 — Mobile PWA : online-only en V1 (offline = V2)

**Question initiale** : Contradiction SOCLE §M13 vs Checklist 6.0 ligne 82

#### Décision formelle

> **V1 : PWA worker online-only**
> **Offline partiel = V2 uniquement**

**Hiérarchie documentaire appliquée** : SOCLE LOCKED (H1) prime sur Checklist 6.0 (H3)

**Action documentaire** : Checklist 6.0 ligne 82 marquée V2 (correction déjà appliquée 2026-02-22)

**Référence ERRATA** : `ERRATA — Clarifications contractuelles V1.1 §Clarification C2`

**Statut validation** : ✅ Résolu par hiérarchie documentaire — pas de validation OWNER requise

---

### DÉCISION D4 — Facturation depuis timesheets : V1 actif (sans feature flag)

**Question initiale** : Contradiction SOCLE §M10 ("facturation V2") vs OPENAPI LOCKED (endpoint présent)

#### Décision formelle

> **V1 : `POST /v1/invoices:from-timesheet` actif, sans feature flag**
> **L'OpenAPI LOCKED fait autorité**

**Référence ERRATA** : `ERRATA — Clarifications contractuelles V1.1 §Clarification C1`

**Statut validation** : ✅ Résolu par hiérarchie documentaire (OpenAPI H1 > narratif SOCLE §M10)

---

### DÉCISION D5 — Export dossier inspection-ready : V1 scope confirmé

**Question initiale** : Checklist 6.0 ligne 113 liste cet export comme livrable V1. DB et endpoints manquants.

#### Décision formelle

> **V1 : export PDF inspection-ready asynchrone (202 + polling)**
> - Table `compliance_exports` créée via `PATCH_DB_2.9.16-G §Table B`
> - Endpoint `POST /v1/compliance-cases/{id}:export-dossier` + polling `GET …/exports/{export_id}`
> - Events : `ComplianceDossierExportRequested` + `ComplianceDossierExportCompleted`
> - Signed URL Supabase Storage, TTL fichier 7 jours, signed URL 1h

**Références** :
- [`PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md §Table B`](./PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md)
- [`PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md §3`](./PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md)
- [`PATCH_EVENTS_2.10.4.11.md §D`](./PATCH_EVENTS_2.10.4.11.md)
- `SECTION 10.E — E2E-13`

**Statut validation** : ✅ Livrable obligatoire confirmé (Checklist 6.0 ligne 113)

---

### DÉCISION D6 — Égalité de traitement (Directive 2018/957) : V1 manuel assisté

**Question initiale** : Module M8.3 totalement absent du CDC initial.

#### Décision formelle

> **V1 : check égalité de traitement manuel assisté — saisie manuelle référence salariale**
> - Table `equal_treatment_checks` snapshot immuable
> - Algorithme rules-based 3 étapes (voir CDC_COMPLETIONS §C1)
> - Pas de blocage enforcement automatique en V1 (alerte uniquement)
> - **API externe salaires minimaux pays hôte = V2**

**Références** :
- [`PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md §Table A`](./PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md)
- [`PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md §5`](./PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md)
- [`PATCH_EVENTS_2.10.4.11.md §E`](./PATCH_EVENTS_2.10.4.11.md)
- `6.9 — CHECKLIST — LOT 7 BIS IA`
- `CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1`

**Statut validation** : ⚠️ DÉCISION À VALIDER FORMELLEMENT PAR OWNER (obligation légale Directive 2018/957/UE)

---

## Tableau récapitulatif des décisions

| ID | Sujet | Décision V1 | Statut validation |
|---|---|---|---|
| D1 | platform_admin architecture | Option A (`tenant_id=null`) | ⚠️ OWNER |
| D2 | ATS scoring modèle | Règles-based (`rules-v1.0`) | ⚠️ OWNER |
| D3 | Mobile PWA offline | Online-only V1 | ✅ Résolu |
| D4 | Facturation depuis timesheets | V1 actif sans feature flag | ✅ Résolu |
| D5 | Export dossier inspection-ready | V1 async PDF | ✅ Confirmé |
| D6 | Égalité de traitement M8.3 | V1 manuel assisté | ⚠️ OWNER |

---

## Checklist d'alignement global (Vague 3 — 2026-02-22)

| Surface | DB | OpenAPI | Events | RBAC | E2E | Statut |
|---|---|---|---|---|---|---|
| Export dossier | ✅ 2.9.16-G §B | ✅ V1.3 §3 | ✅ 2.10.4.11 §D | ✅ 2.12.b | ✅ E2E-13 | **COMPLET** |
| Égalité de traitement | ✅ 2.9.16-G §A | ✅ V1.3 §5 | ✅ 2.10.4.11 §E | ✅ 2.9.16-G RLS | ✅ 6.9 GWT | **COMPLET** |
| ATS Scoring Q7 | ✅ applications.ai_score | ✅ CandidateScored | ✅ 2.10.4.4 | ✅ 6.6 §M5 | ✅ E2E-07 | **DÉCISION FIGÉE** |
| platform_admin | ✅ RLS policies | ✅ /admin/platform/* | N/A | ✅ 2.12.b | ✅ 6.6 DoD | **DÉCISION FIGÉE** |

---

## Notes de traçabilité

- Ce document ne modifie aucun document LOCKED.
- Les décisions D1, D2, D6 nécessitent une validation formelle OWNER avant de lancer le build.
- Les décisions D3, D4, D5 sont déjà résolues par la hiérarchie documentaire ou les livrables obligatoires.
- En l'absence de contre-indication OWNER dans les 5 jours ouvrés, les décisions ⚠️ sont considérées tacitement approuvées et le build peut démarrer.

## Mini-changelog

- 2026-02-22 : Création. 6 décisions formalisées issues de l'audit fonctionnel. D1 (platform_admin Option A), D2 (ATS scoring rules-based), D3 (PWA online-only), D4 (facturation V1), D5 (export dossier), D6 (égalité traitement V1 manuel). Checklist d'alignement global incluse.
