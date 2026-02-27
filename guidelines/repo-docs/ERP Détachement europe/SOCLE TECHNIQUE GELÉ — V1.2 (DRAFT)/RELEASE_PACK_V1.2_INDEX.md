# RELEASE PACK V1.2 — INDEX

- **Statut**: DRAFT V1.2 — QA Final validé
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Index complet de tous les documents V1.2 composant le socle technique prêt-à-coder.

---

## Objectif du Pack V1.2

Le Release Pack V1.2 consolide **toutes les décisions contractuelles** issues des vagues d'audit fonctionnel du 2026-02-22 au 2026-02-23. Il constitue la référence documentaire unique pour le build V1 de la plateforme SaaS détachement EU.

**État à l'issue du QA Final** : ✅ READY-TO-CODE V1.2
- Zéro surface sans contrat DB ↔ OpenAPI ↔ Events ↔ RBAC ↔ E2E
- 1 divergence nomenclature corrigée (push-subscription path singulier)
- 6 décisions OWNER formalisées (3 nécessitent validation formelle)

---

## Hiérarchie documentaire (H1 → H4)

```json
H1 — LOCKED (immuable, source de vérité primaire)
     ├── SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/
     │   ├── 2.9  — Schéma DB V1.1 (LOCKED)
     │   ├── 2.10 — Events Métier V1 (LOCKED)
     │   ├── 2.11 — OpenAPI V1 MVP (LOCKED)
     │   └── 2.12 — RBAC & Permissions V1 (LOCKED)
     └── ERRATA — Clarifications contractuelles V1.1 (LOCKED)

H1-bis — Patches faisant autorité (ne modifient pas LOCKED)
     └── SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/
         ├── 2.11.a — OPENAPI V1.2 (PATCH) — Surfaces manquantes
         ├── 2.12.a — RBAC & PERMISSIONS V1.2 (PATCH)
         ├── PATCH_DB_2.9.16-C à G
         ├── PATCH_EVENTS_2.10.4.11
         ├── PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES
         ├── PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES
         ├── PATCH_RBAC_2.12.b_PLATFORM_ADMIN
         ├── PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET
         ├── PATCH_M3A_DB_DATA_CONTRACTS
         ├── PATCH_M3B_OPENAPI_API_SURFACE
         ├── PATCH_M3C_EVENTS_ORCHESTRATION
         ├── PATCH_M3D_RBAC_SECURITY_COMPLIANCE
         ├── PATCH_M3E_TEST_SCENARIOS
         ├── PATCH_M3F_IMPLEMENTATION_TASK_PACK
         ├── PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION
         ├── PATCH_ATS_SCORING_Q7_V1_RULES_BASED
         └── DECISIONS_OWNER_V1.2

H2 — CDC / SOCLE (READY)
     └── CDC_COMPLETIONS_FROM_AUDIT.md

H3 — Checklists opérationnelles (Lots 1-8)
     └── SECTION 6 — Checklist Produit V1 (Globale)/

H4 — Prototypes (non normatifs)
     └── Ancien prototype/
```

**Règle** : En cas de contradiction, H1 prime. Les patches H1-bis priment sur H2-H4 pour les surfaces qu'ils couvrent.
Règle complémentaire M3: `If conflict: PATCH_M3A (DB) is the source of truth.`
Règle complémentaire M3 (courte): `If conflict: PATCH_M3A is source of truth.`

---

## Catalogue complet des patches V1.2

### Patches DB (Schéma)

| Fichier | Tables couvertes | Lot | Migration |
|---|---|---|---|
| `PATCH_DB_2.9.16-C_worker_push_subscriptions.md` | `worker_push_subscriptions` | 3 | `20260222000001__lot3_m13_worker_push_subscriptions.sql` |
| `PATCH_DB_2.9.16-E_rfp_visibility_contact_logs.md` | `rfp_requests.visibility`, `rfp_contact_logs` | 4 | `20260222000003__lot4_m4_rfp_contact_logs.sql` |
| `PATCH_DB_2.9.16-F_sipsi_declarations.md` | `sipsi_declarations` | 2/7 | `20260222000004__lot2_m8_sipsi_declarations.sql` |
| `PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md` | `equal_treatment_checks`, `compliance_exports` | 7 | `20260222000005/6__lot7_m8_*.sql` |
| `PATCH_M3A_DB_DATA_CONTRACTS.md` | `requests` (extension), `companies`, `company_documents`, `company_source_retrievals` | 4 (M3) | `20260223000007__lot4_m3_company_enrichment.sql` |

### Patches Events

| Fichier | Events couverts | Section |
|---|---|---|
| `PATCH_EVENTS_2.10.4.11.md` | ComplianceDurationAlert, WorkerSkillAdded, SipsiDeclarationCreated, SipsiDeclarationStatusChanged, ComplianceDossierExportRequested, ComplianceDossierExportCompleted, EqualTreatmentCheckCreated, EqualTreatmentViolationDetected | §A→E |
| `PATCH_M3C_EVENTS_ORCHESTRATION.md` | CompanyEnrichmentRequested, CompanyEnrichmentStarted, CompanyEnrichmentSourceFetched, CompanyEnrichmentCompleted | section unique |

### Patches OpenAPI

| Fichier | Endpoints couverts | Version |
|---|---|---|
| `2.11.a — OPENAPI V1.2 (PATCH)` | Web Push VAPID, SIPSI, RFP contact-logs, ATS shortlist, Worker Skills | V1.2.2 |
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` | marketplace/agencies, leads/activities, export-dossier (POST+GET polling), compliance-score, equal-treatment-check (POST+GET) | V1.3.1 |
| `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` | `/v1/admin/platform/stats`, `/v1/admin/platform/tenants`, `/v1/admin/platform/tenants/{tenant_id}`, `/v1/admin/platform/tenants/{tenant_id}/status`, `/v1/admin/platform/compliance-overview` | V1.4 |
| `PATCH_M3B_OPENAPI_API_SURFACE.md` | `POST /v1/requests`, `GET /v1/requests/{request_id}`, `POST /v1/requests/{request_id}:refresh-company` | V1.2.4 |

**Raison de mise à jour (post hardening)** : les surfaces API `platform_admin` sont désormais contractées via `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` (et non via `2.11` LOCKED, `2.11.a`, ni `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md`).

### Patches RBAC

| Fichier | Périmètre | Source |
|---|---|---|
| `2.12.a — RBAC & PERMISSIONS V1.2 (PATCH)` | Matrice complète V1.2.2 (tous lots) | Audit 2026-02-22 |
| `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` | Rôle platform_admin (tenant_id=null, bypass RLS) | Décision D1 |
| `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md` | RBAC endpoints M3, secrets backend-only, conformité data minimization, DoD QA doc | Split M3 V1.2.4 |

### Patches QA (Doc-only)

| Fichier | Périmètre | Source |
|---|---|---|
| `PATCH_M3E_TEST_SCENARIOS.md` | 12 scénarios Gherkin-like pré-build pour validation M3 (input, cache/lock, partial/fail, stale refresh, observabilité) | Suite QA optionnelle V1.2.4 |

### Patches Build Handover (Doc-only)

| Fichier | Périmètre | Source |
|---|---|---|
| `PATCH_M3F_IMPLEMENTATION_TASK_PACK.md` | 6 tâches build contract-first (DB/API/Worker/UI/RBAC/Tests) avec Inputs/Outputs/DoD/Do-not-change-contracts | Handover M3 V1.2.4 |

### Patches Intégration Source (Doc-only)

| Fichier | Périmètre | Source |
|---|---|---|
| `PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION.md` | Contrat de consommation Search API (provenance, fraîcheur, mapping params/payloads, pagination, erreurs, throttling) | Intégration M3 V1.2.4 |

### Décisions & Compléments

| Fichier | Contenu |
|---|---|
| `CDC_COMPLETIONS_FROM_AUDIT.md` | 5 compléments (M8.3, M8.4, M1.2, Corrections ERRATA, DB 2.9.16-G) |
| `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md` | Fil conducteur M3 (overview) et index vers `M3A/M3B/M3C/M3D` |
| `PATCH_M3E_TEST_SCENARIOS.md` | Suite QA doc-only M3 (12 scénarios Given/When/Then) |
| `PATCH_M3F_IMPLEMENTATION_TASK_PACK.md` | Task pack doc-only pour exécution build contract-first |
| `PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION.md` | Contrat intégration Search API (public mode) aligné sur upstream Search API/search-infra |
| `PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` | Algorithme scoring ATS V1 rules-v1.0, 3 GWT |
| `DECISIONS_OWNER_V1.2.md` | 6 décisions formelles D1→D6 |

### Release Pack (ce dossier)

| Fichier | Contenu |
|---|---|
| `RELEASE_PACK_V1.2_INDEX.md` | Ce fichier — index et hiérarchie |
| `RELEASE_PACK_V1.2_CHANGELOG.md` | Changelog Vague 1→4 |
| `RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md` | Tableau DB ↔ OpenAPI ↔ Events ↔ RBAC ↔ E2E |
| `RELEASE_PACK_V1.2_OPEN_ITEMS.md` | Items ouverts restants |

---

## Checklists opérationnelles (SECTION 6)

| Fichier | Lot | Module | Statut |
|---|---|---|---|
| `6 1 — CHECKLIST LOT 1 IA (FOUNDATION)` | 1 | M1 Foundation | READY |
| `6 2 — CHECKLIST LOT 2 IA (CORE MÉTIER)` | 2 | M2-M4 | READY |
| `6 2 A — CHECKLIST VALIDATION INTER-MODULES` | 2 | Transverse | READY |
| `6 3 — CHECKLIST LOT 3 IA (TIMESHEETS & MOBILE)` | 3 | M3, M13 | READY |
| `6 4 — CHECKLIST LOT 6 IA (FINANCE BILLING)` | 6 | M10 | READY |
| `6 5 — CHECKLIST LOT 4 IA (CRM, RFP)` | 4 | M2, M4 | READY |
| `6 6 — CHECKLIST LOT 5 IA (ATS, WORKERS)` | 5 | M5, M6 | READY |
| `6 7 — CHECKLIST LOT 7 IA (COMPLIANCE ENGINE)` | 7 | M8 | READY |
| `6 8 — CHECKLIST LOT 8 IA (RISK, MARKETPLACE)` | 8 | M11, M12 | READY |
| `6 9 — CHECKLIST LOT 7 BIS IA (EGALITE DE TRAITEMENT)` | 7 | M8.3 | DRAFT |

---

## Ce qui est V1 vs V2 (synthèse DECISIONS_OWNER_V1.2.md)

### V1 (Build immédiat)

| Surface | Décision V1 |
|---|---|
| ATS Scoring | Rules-based, `model_version="rules-v1.0"` — 4 composantes |
| platform_admin | `tenant_id=null`, bypass RLS, SELECT global + write config ; API `/v1/admin/platform/*` contractée via `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` |
| Égalité traitement | Check manuel assisté, snapshot immuable, events outbox |
| Export dossier | PDF async (202 + polling), signed URL 1h, TTL 7j |
| SIPSI | Déclaration assistée manuelle, pas de connecteur API |
| Mobile PWA | Online-only (pas d'offline) |
| Facturation | `POST /v1/invoices:from-timesheet` actif sans feature flag |

### V2 (Hors scope V1)

| Surface | Raison du report |
|---|---|
| LLM scoring ATS | Coût variable, latence, dépendances LLM — décision D2 |
| API externe salaires minimaux | Connecteurs pays hôte — décision D6 |
| Blocage enforcement = égalité traitement | Alerte V1, blocage auto V2 |
| Offline PWA | Complexité Service Worker — décision D3 |
| SIPSI connecteur API direct | API gouvernementale V2 |
| Analytics avancées multi-tenant | Tableau de bord OWNER V2 |
| Matching IA avancé RFP | Embeddings sémantiques V2 |
| Récupération automatique RFP | Allocation algo V2 |

---

## Gates READY-TO-CODE V1.2 (toutes satisfaites)

- [x] **Gate G1** — Toutes les tables DB V1 ont un DDL + migrations nommées
- [x] **Gate G2** — Tous les endpoints référencés dans Checklists ont un contrat OpenAPI
- [x] **Gate G3** — Tous les events référencés dans Checklists ont un payload défini
- [x] **Gate G4** — RBAC défini pour chaque endpoint (rôles autorisés + refusés)
- [x] **Gate G5** — Scénarios E2E couvrent la chaîne critique + toutes surfaces V1.2
- [x] **Gate G6** — Zéro divergence de nomenclature (DB/OpenAPI/Events/E2E alignés)
- [x] **Gate G7** — Décisions architecturales figées (ATS scoring, platform_admin, mobile)
- [ ] **Gate G8** — Validation OWNER formelle D1/D2/D6 (⚠️ requise avant build)

### Build Readiness Gate — M3 (post-freeze, GO/NO-GO)

- [ ] Enums canoniques uniques (M3A) référencés partout (pas de duplication)
- [ ] Minimum Success Fields validés (M3A) + utilisés dans M3C/M3B
- [ ] Payload d’erreur API unique (M3B) + `error_code` canonique (M3A)
- [ ] State machine unique (M3C) + transitions testées par M3E
- [ ] TTL/Lock/Retry uniques (M3C) + UI staleness (M3B) aligné
- [ ] RBAC matrix (M3D) couvre Company Card + docs/exports
- [ ] Contrat Search API M3G (params/paging/errors/throttling/freshness) est aligné avec M3A/M3B/M3C
- [ ] Source of truth: M3A présent dans overview/index/changelog

Règle d’activation build:
1. GO uniquement si tous les points ci-dessus sont cochés.
2. NO-GO si au moins un point n’est pas prouvé.

---

## Notes de traçabilité

- Ce document ne modifie aucun LOCKED.
- Source de vérité pour la cartographie documentaire V1.2.
- Toute modification d'un patch doit être tracée dans `RELEASE_PACK_V1.2_CHANGELOG.md`.
- Recommandation post-freeze M3: traiter `M3A/M3B/M3C/M3D/M3E` comme baseline stable.
- Toute correction post-freeze M3 doit passer par un patch `M3x_FIX`.

## Mini-changelog

- 2026-02-22 : Création — QA Final V1.2 réalisé. 1 divergence corrigée (push-subscription). 7/8 gates satisfaites.
- 2026-02-22 : Mise à jour post-hardening — ajout `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` dans le catalogue; contractualisation explicite des surfaces `platform_admin` via V1.4.
- 2026-02-23 : Ajout `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md` au catalogue V1.2 comme cadrage contract-first pour la capture obligatoire d'identifiant entreprise et l'enrichissement officiel FR.
- 2026-02-23 : Refactor M3 en 4 patches synchronisés (`M3A`, `M3B`, `M3C`, `M3D`) et ajout de la règle de priorité `PATCH_M3A` source of truth en cas de conflit.
- 2026-02-23 : Ajout optionnel `PATCH_M3E_TEST_SCENARIOS.md` pour industrialiser la QA documentaire M3 (12 scénarios Given/When/Then).
- 2026-02-23 : Ajout `Build Readiness Gate — M3` + `PATCH_M3F_IMPLEMENTATION_TASK_PACK.md` + gouvernance post-freeze `M3x_FIX`.
- 2026-02-23 : Ajustements minimaux post-freeze: required/optional sources, compteurs de failures dédiés, et Option A explicite (`SIRET` côté request).
- 2026-02-23 : Ajout `PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION.md` et alignement documentaire M3A/M3B/M3C sur provenance/freshness/rate-limit Search API.
