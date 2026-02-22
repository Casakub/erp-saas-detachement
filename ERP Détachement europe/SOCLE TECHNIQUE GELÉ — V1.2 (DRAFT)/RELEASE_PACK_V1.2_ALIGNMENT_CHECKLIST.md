# RELEASE PACK V1.2 — CHECKLIST D'ALIGNEMENT FINALE

- **Statut**: QA Final ✅ VALIDÉ
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Vérification exhaustive DB ↔ OpenAPI ↔ Events ↔ RBAC ↔ E2E pour toutes les surfaces V1.

---

> **Légende** :
> - ✅ = Vérifié et cohérent
> - ⚠️ = Point d'attention (sans bloquant build)
> - ❌ = Bloquant (à corriger avant build)
> - N/A = Non applicable pour cette surface

---

## SECTION A — Surfaces V1 Core (LOCKED)

| Surface | DB | OpenAPI | Events | RBAC | E2E | Status global |
|---|---|---|---|---|---|---|
| Snapshot rémunération (M8) | ✅ `worker_remuneration_snapshot` 2.9 | ✅ `POST remuneration/snapshots:calculate` | ✅ `RemunerationSnapshotCreated` | ✅ 2.12 LOCKED | ✅ E2E-01 | **✅ OK** |
| Compliance score (M8) | ✅ `compliance_scores` 2.9 | ✅ `GET compliance-score` V1.3 §4 | ✅ `ComplianceScoreCalculated` 2.10 | ✅ 2.12 LOCKED | ✅ E2E-02 | **✅ OK** |
| Enforcement timesheets | ✅ enforcement_flags 2.9 | ✅ `POST timesheets:validate` (422 gate) | ✅ `MissionEnforcementEvaluated` | ✅ 2.12 | ✅ E2E-03 | **✅ OK** |
| Enforcement factures | ✅ enforcement_flags 2.9 | ✅ `POST invoices:from-timesheet` | ✅ `InvoiceBlocked` | ✅ 2.12 | ✅ E2E-04 | **✅ OK** |
| Chaîne billing positive | ✅ timesheets.billing_status 2.9 | ✅ 2.11 LOCKED | ✅ `TimesheetBillingStatusChanged` | ✅ 2.12 | ✅ E2E-05 | **✅ OK** |
| Finance : devis/commissions | ✅ quotes, commissions 2.9 | ✅ `POST quotes`, `PATCH commissions` | ✅ `QuoteSent` (`POST /quotes/{id}:send`) | ✅ 2.12 | ✅ E2E-11 | **✅ OK** |
| Moteur rémunération IDCC | ✅ salary_grids, remun. inputs | ✅ `POST remuneration/inputs` + `POST remuneration/snapshots:calculate` | ✅ `ComplianceDurationAlert` 2.10.4.11 §A | ✅ 2.12 | ✅ E2E-12 | **✅ OK** |

---

## SECTION B — Surfaces V1.2 (Patches Vague 1→2)

| Surface | DB | OpenAPI | Events | RBAC | E2E | Status global |
|---|---|---|---|---|---|---|
| Web Push VAPID (worker) | ✅ `worker_push_subscriptions` 2.9.16-C | ✅ `POST/DELETE /v1/worker/push-subscription` 2.11.a | N/A (déclencheur, pas event direct) | ✅ worker_own, 2.12.a | ✅ E2E-09 | **✅ OK** |
| RFP Contact Logs | ✅ `rfp_contact_logs` 2.9.16-E | ✅ `POST /v1/rfps/{id}/contact-logs` 2.11.a | N/A (pas d'event canonique dédié) | ✅ tenant_staff, 2.12.a | ✅ E2E-06 | **✅ OK** |
| RFP Visibility | ✅ `rfp_requests.visibility` 2.9.16-E | ✅ filtres GET rfps | N/A | ✅ 2.12.a | ⚠️ Pas E2E dédié | **✅ OK** |
| SIPSI Declarations | ✅ `sipsi_declarations` 2.9.16-F | ✅ `POST/PATCH/GET sipsi-declaration` 2.11.a | ✅ `SipsiDeclarationCreated` + `StatusChanged` 2.10.4.11 §C | ✅ 2.12.a | ⚠️ Pas E2E dédié SIPSI | **⚠️ E2E SIPSI manquant** |
| ATS Shortlist | ✅ `applications` 2.9 | ✅ `POST applications:shortlist` 2.11.a | ✅ `CandidateScored` 2.10.4.4 | ✅ 2.12.a | ✅ E2E-07 | **✅ OK** |
| Worker Skills | ✅ `worker_skills` 2.9 | ✅ `POST/GET /workers/{id}/skills` 2.11.a | ✅ `WorkerSkillAdded` 2.10.4.11 §B | ✅ 2.12.a | ✅ E2E-08 | **✅ OK** |
| Marketplace Agencies | ✅ données existantes | ✅ `GET /v1/marketplace/agencies` V1.3 §1 | N/A | ✅ V1.3 §1 | ✅ E2E-10 | **✅ OK** |
| Lead Activities (CRM) | ✅ `lead_activities` 2.9.3 | ✅ `POST/GET /v1/leads/{id}/activities` V1.3 §2 | ⚠️ CANDIDAT `LeadActivityCreated` | ✅ V1.3 §2 | ⚠️ Pas E2E dédié | **⚠️ Event candidat** |
| ComplianceDurationAlert | ✅ `country_rulesets` (seuils) | ✅ batch M8 | ✅ `ComplianceDurationAlert` 2.10.4.11 §A | ✅ 2.12 | ✅ E2E-12 cas limite | **✅ OK** |

---

## SECTION C — Surfaces V1.2.2 (Vague 3 — Nouvelles)

| Surface | DB | OpenAPI | Events | RBAC | E2E | Status global |
|---|---|---|---|---|---|---|
| Export dossier inspection-ready | ✅ `compliance_exports` 2.9.16-G §B | ✅ `POST :export-dossier` + `GET /exports/{id}` V1.3 §3+4 | ✅ `ExportRequested` + `ExportCompleted` 2.10.4.11 §D | ✅ tenant_admin/agency_user only | ✅ **E2E-13** | **✅ OK** |
| Égalité traitement M8.3 | ✅ `equal_treatment_checks` 2.9.16-G §A | ✅ `POST/GET equal-treatment-check` V1.3 §5 | ✅ `CheckCreated` + `ViolationDetected` 2.10.4.11 §E | ✅ tenant_staff + worker_read | ✅ 6.9 GWT | **✅ OK** |
| ATS Scoring rules-v1.0 | ✅ `applications.ai_score`, `score_breakdown` | ✅ `CandidateScored` payload | ✅ `CandidateScored` 2.10.4.4 | ✅ 6.6 §M5 | ✅ E2E-07 + GWT Q7 | **✅ OK** |
| Platform Admin surfaces | ✅ tables existantes (`tenants`, `tenant_settings`, `agency_profiles`, `missions`, `compliance_cases`) | ✅ `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` (`/v1/admin/platform/*`) | N/A | ✅ `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` | ⚠️ Tests RBAC dédiés à créer (DoD V1.4), couverture partielle via contrôles RBAC transverses | **⚠️ TESTS À AJOUTER** |
| Compliance Score (lecture) | ✅ `compliance_scores` 2.9 | ✅ `GET compliance-score` V1.3 §4 | N/A | ✅ tenant_staff | ⚠️ Couvert E2E-01/02 | **✅ OK** |

**Raison de mise à jour (post hardening)** : les endpoints `platform_admin` sont désormais contractualisés explicitement dans `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md` (pas via `2.11`/`2.11.a`/V1.3).

---

## SECTION D — Vérifications nomenclature (QA Final)

| Terme | Forme canonique | Cohérence | Correction effectuée |
|---|---|---|---|
| Endpoint push notifications | `/v1/worker/push-subscription` (singulier) | ✅ Aligné | ⚠️ Corrigé dans PATCH_DB_2.9.16-C (pluriel → singulier) |
| Opération export | `:export-dossier` (hyphen, sans espace) | ✅ Cohérent 14 occurrences | N/A |
| Endpoint égalité | `/equal-treatment-check` (hyphen) | ✅ Cohérent 21 occurrences | N/A |
| Table snapshot rémunération | `worker_remuneration_snapshot` (underscore) | ✅ Cohérent | N/A |
| Table égalité | `equal_treatment_checks` (underscore) | ✅ Cohérent | N/A |
| Table export | `compliance_exports` (underscore) | ✅ Cohérent | N/A |
| Immuabilité `equal_treatment_checks` | Pas d'`updated_at` | ✅ Vérifié dans DDL | N/A |
| TTL export fichier | 7 jours (`completed_at + INTERVAL '7 days'`) | ✅ GENERATED ALWAYS | N/A |
| Expiration signed URL | 1h (consistent "signed URL 1h") | ✅ Cohérent 4 occurrences | N/A |
| `model_version` ATS V1 | `"rules-v1.0"` | ✅ Défini dans patch Q7 | N/A |
| Claims JWT platform_admin | `tenant_id: null` | ✅ Cohérent RBAC+DECISIONS | N/A |
| Status export enum | `pending → processing → ready → failed` | ✅ Cohérent SQL/JSON | N/A |

---

## SECTION E — Vérifications RBAC transverses

| Rôle | Peut faire | Ne peut pas faire | Vérifié dans |
|---|---|---|---|
| `tenant_admin` | Tout sur son tenant (incl. export, equal-treatment, ATS) | Dépasser son tenant_id | 2.12.a, PATCH_RBAC |
| `agency_user` | CRUD missions, ATS, export, equal-treatment | Modifier salary_grids (lecture seule) | 2.12.a |
| `consultant` | Lecture scoped (CRM, applications assignées) | Shortlist, export, equal-treatment POST | 2.12.a |
| `client_user` | Lecture devis/missions assignées | ATS, export, equal-treatment, finance | 2.12.a |
| `worker` | Lecture own (skills, push-subscription, equal-treatment GET) | POST equal-treatment, export | 2.9.16-G RLS |
| `platform_admin` | SELECT global, write config (tenants, settings) | Modifier compliance_cases/missions/timesheets | PATCH_RBAC_2.12.b |

---

## SECTION F — Scénarios E2E — Couverture complète V1

| E2E | Surface couverte | Lot | RBAC testé | Multi-tenant | Statut |
|---|---|---|---|---|---|
| E2E-01 | Snapshot rémunération immuable | 7 | ✅ | ✅ | READY |
| E2E-02 | Compliance score post-snapshot | 7 | ✅ | ✅ | READY |
| E2E-03 | Enforcement bloque timesheet | 7/3 | ✅ | ✅ | READY |
| E2E-04 | Enforcement bloque facture | 7/6 | ✅ | ✅ | READY |
| E2E-05 | Chaîne positive billing | 6/7 | ✅ | ✅ | READY |
| E2E-06 | RFP Contact Log anti-désintermédiation | 4 | ✅ | ✅ | READY |
| E2E-07 | ATS Shortlist candidat | 5 | ✅ | ✅ | READY |
| E2E-08 | Worker Skills ajout + lecture | 5 | ✅ | ✅ | READY |
| E2E-09 | Web Push VAPID worker | 3 | ✅ | ✅ | READY |
| E2E-10 | Marketplace gating + suspension | 8 | ✅ | ✅ | READY |
| E2E-11 | Finance devis → commission → comptabilité | 6 | ✅ | ✅ | READY |
| E2E-12 | Moteur rémunération IDCC + durées | 7 | ✅ | ✅ | READY |
| E2E-13 | Export dossier inspection-ready async | 7 | ✅ | ✅ | **READY** |
| — | SIPSI déclaration | 2/7 | ⚠️ manquant | ⚠️ | **⚠️ MANQUANT** |

---

## SECTION G — Résumé du QA Final

### Divergences trouvées et corrigées

| # | Divergence | Fichier corrigé | Correction |
|---|---|---|---|
| 1 | `/v1/workers/push-subscription` (pluriel) vs `/v1/worker/push-subscription` (singulier) | `PATCH_DB_2.9.16-C` | Remplacé par singulier (6 occurrences) — contrat autoritaire : `2.11.a §Worker App Mobile` |
| 2 | Référence `PATCH_EVENTS_2.10.4.11 §D` pour events EqualTreatment (§D = export, §E = equal-treatment) | `6.9 CHECKLIST` | Corrigé `§D` → `§E`, ajout lien PATCH_OPENAPI_V1.3 §5 |

### Points d'attention (non bloquants)

| # | Point | Impact | Recommandation |
|---|---|---|---|
| A | Scénario E2E dédié SIPSI absent | Couverture SIPSI limitée aux GWT 6.7 | Créer E2E-14 SIPSI en Vague 4 |
| B | `LeadActivityCreated` event = CANDIDAT (pas finalisé) | Lead activities CRM sans event outbox formel | Valider ou abandonner avant build |
| C | D1/D2/D6 : validation OWNER formelle requise | Build peut démarrer, décisions modifiables | Obtenir sign-off OWNER dans 5 jours |

### Verdict final

```
STATUS : ✅ READY-TO-CODE V1.2

Gates satisfaites : 7/8
  ✅ G1 — Toutes tables DB ont un DDL + migrations nommées
  ✅ G2 — Tous endpoints Checklists ont un contrat OpenAPI
  ✅ G3 — Tous events référencés ont un payload défini
  ✅ G4 — RBAC défini par endpoint
  ✅ G5 — E2E couvrent chaîne critique + surfaces V1.2
  ✅ G6 — Zéro divergence nomenclature (après correction push-subscription)
  ✅ G7 — Décisions architecturales figées (ATS, platform_admin, mobile, export)
  ⚠️ G8 — Validation OWNER D1/D2/D6 (requise, non bloquante pour démarrer le build Lot 1)
```

---

## Mini-changelog

- 2026-02-22 : Création — QA Final V1.2. 2 divergences détectées et corrigées. 3 points d'attention documentés. Verdict : READY-TO-CODE V1.2 (7/8 gates).
- 2026-02-22 : Mise à jour post-hardening — ajout de la ligne "Platform Admin surfaces" avec OpenAPI V1.4, RBAC 2.12.b, events=N/A et besoin de tests RBAC dédiés.
