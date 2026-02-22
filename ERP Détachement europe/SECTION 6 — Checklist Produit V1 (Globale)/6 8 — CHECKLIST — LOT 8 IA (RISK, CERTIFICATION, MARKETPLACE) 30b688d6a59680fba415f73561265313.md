# 6.8 — CHECKLIST — LOT 8 IA (RISK, CERTIFICATION, MARKETPLACE)

- Statut: READY
- Version: 1.1
- Date: 2026-02-20
- Portée: checklist opérationnelle complète du Lot 8 (M11 Marketplace, M12 Risk & Certification).
- Règles: aucun changement aux documents LOCKED (2.9/2.10/2.11/2.12). Complément opérationnel uniquement.
- Références SOCLE:
  - `SOCLE LOCKED:501` — plan d'exécution lots
  - `SOCLE LOCKED:537-541` — périmètre Lot 8 (risk, certification, marketplace)
  - `SOCLE LOCKED:267-277` — catalogue modules M11/M12

---

## Cadrage V1 vs V2 (lecture obligatoire avant implémentation)

Ce lot est le plus impacté par la distinction V1/V2. La matrice SECTION 10.F fait référence.

| Surface | V1 (assisté) | V2 (automatisé) |
| --- | --- | --- |
| Risk score agence | Calculé batch par M12 (règles-based) | Moteur ML avancé |
| Certification agence | Gating manuel validé admin + score | Gating automatique |
| Marketplace listing | Catalogue filtrable + RFP unifiée (visibility flag) | Allocation auto RFP |
| Ranking marketplace | Score statique calculé (batch) | Score dynamique ML |
| RFP externe (M11) | RFP privée/publique via visibility flag (Q5-B) | Connecteurs partenaires |

**Règle de build**: implémenter uniquement les surfaces V1. Tout ce qui est V2 ci-dessus reste hors scope.

---

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope | Notes |
| --- | --- | --- | --- |
| M11 | Marketplace (Catalogue + RFP Externe) | oui | Listing agences, RFP unified, filtres. |
| M12 | Risk & Certification | oui | Risk score, certification gating, ranking. |
| M8 | Conformité Détachement | non | Fournit signaux en lecture — Lot 7. |
| M10 | Finance | non | Lot 6. |
| M13 | i18n & Comms | non | Transverse. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé (Foundation)
- [ ] Lot 2 validé (Core Métier + enforcement flags)
- [ ] Lot 3 validé (Timesheets & Mobile)
- [ ] Lot 4 validé (CRM/Clients/RFP)
- [ ] Lot 5 validé (ATS/Workers)
- [ ] Lot 6 validé (Finance/Billing)
- [ ] Lot 7 validé (Compliance Engine Rémunération — fournit compliance_scores)

---

## M12 — Risk & Certification

### Ancres contractuelles

- DB: `agency_risk_scores`, `agency_certifications`, `marketplace_access`, `agency_marketplace_ranking`, `agency_profiles` (2.9 LOCKED)
- OpenAPI: endpoints M12 référencés dans 2.11 LOCKED (risk score calculation, certification status)
- Events: `AgencyRiskScoreCalculated`, `AgencyCertificationStatusChanged`, `MarketplaceAccessChanged`, `MarketplaceRankingUpdated`, `AgencyProfileUpdated` (2.10.4.9, 2.10.4.10 LOCKED)
- RBAC: `tenant_admin` en lecture/écriture sur risk/certification; `agency_user` en lecture sur son propre score; `client_user`, `worker`, `consultant` exclus (2.12 LOCKED)

### Règles métier V1

**Risk Score:**
- Calculé en batch (quotidien ou déclenché sur event compliance) par M12.
- Inputs: `compliance_scores` (M8), historique violations, ratio timesheets non conformes, durées cumulées hors seuil.
- Output: `agency_risk_score` avec `risk_score` (0-100, 0=meilleur), `model_version`.
- Stocké dans `agency_risk_scores` — versioning: chaque calcul crée un nouveau record (historique conservé).
- Event `AgencyRiskScoreCalculated` publié après chaque calcul.

**Certification:**
- `agency_certification.certification_level`: `none → controlled → verified → certified`.
- Gating V1: `certification_level ≥ controlled` requis pour accéder à la marketplace.
- Condition V1 pour `controlled`: `risk_score ≤ 40` + dossier vigilance complet + au moins 1 mission V1 clôturée sans blocage.
- Changement de certification → `AgencyCertificationStatusChanged` → mise à jour `marketplace_access`.
- En V1: validation certification = action manuelle `tenant_admin` (pas d'automatisation).

**Marketplace Access:**
- `marketplace_access.status`: `pending | active | suspended`.
- Suspendu si: `risk_score > 70` OU certification révoquée.
- Event `MarketplaceAccessChanged` publié sur changement de statut.

### Critères d'acceptation (GWT)

**Given** agence avec `risk_score=25`, dossier vigilance complet, 1 mission clôturée → **When** admin valide la certification → **Then** `certification_level` passe à `controlled`, `MarketplaceAccessChanged` publié, `marketplace_access.status = active`.

**Given** agence avec `risk_score=75` → **When** batch calcule le score → **Then** `AgencyRiskScoreCalculated` publié, `marketplace_access.status` passe à `suspended`, `AgencyCertificationStatusChanged` publié.

**Given** agence suspendue tentant d'accéder à la marketplace → **Then** 403 (gating).

**Given** `agency_user` → **When** `GET` de son propre risk score → **Then** 200 (lecture only). **When** tentative de modification → **Then** 403.

**Given** cross-tenant sur risk scores → **Then** 403/404 (RLS).

### Definition of Done (M12)

- [ ] Tables `agency_risk_scores`, `agency_certifications`, `marketplace_access`, `agency_marketplace_ranking`, `agency_profiles` migrées avec RLS
- [ ] Algorithme risk score V1 implémenté (règles-based, batch quotidien)
- [ ] Gating certification: `controlled` requis pour marketplace access
- [ ] Certification V1: validation manuelle `tenant_admin` + critères documentés
- [ ] Suspension automatique si `risk_score > 70`
- [ ] Events `AgencyRiskScoreCalculated`, `AgencyCertificationStatusChanged`, `MarketplaceAccessChanged`, `MarketplaceRankingUpdated` publiés via outbox
- [ ] RBAC validé (unit tests par rôle)
- [ ] Historique risk scores conservé (pas de delete)
- [ ] Tests: unit + integration + RBAC + multi-tenant

---

## M11 — Marketplace (Catalogue + RFP Externe)

### Ancres contractuelles

- DB: `rfp_requests` (avec champ `visibility: private|public` — 2.9.16-E, décision Q5-B), `agency_marketplace_ranking` (2.9 LOCKED)
- OpenAPI: endpoints marketplace listing + RFP unifiée (visibility flag via `PATCH /v1/rfps/{id}/visibility` — 2.11.a V1.2.2)
- Events: `MarketplaceRankingUpdated`, `RfpAllocated` (2.10.4.3, 2.10.4.9 LOCKED)
- RBAC: `tenant_admin` + `agency_user` sur listing/RFP; `client_user` en lecture catalogue selon settings; `worker` exclu (2.12 LOCKED + 2.12.a V1.2.2)

### Règles métier V1

**Catalogue marketplace:**
- Liste des agences certifiées (`certification_level ≥ controlled`, `marketplace_access.status = active`).
- Filtrable par: secteur, corridor (origin_country→host_country), certification_level, compliance_score.
- Ranking: `agency_marketplace_ranking.ranking_score` calculé batch (composite: `compliance_score` + `risk_score` + ratio missions réussies).
- Event `MarketplaceRankingUpdated` publié après chaque recalcul.

**RFP Marketplace (unifiée — décision Q5-B):**
- La marketplace utilise le même mécanisme RFP que M4 (Lot 4), avec `visibility = public`.
- `PATCH /v1/rfps/{id}/visibility` permet de passer une RFP de `private` à `public` (accessible à toutes les agences certifiées).
- Allocation assistée V1: attribution manuelle par `agency_user`/`tenant_admin` après comparaison des réponses.
- Allocation automatique → V2 (hors scope Lot 8 V1).

**Interdiction stricte V1:**
- Pas de connecteurs partenaires (job boards, plateformes externes) → V2.
- Pas d'algorithme d'allocation automatique → V2.

### Critères d'acceptation (GWT)

**Given** agence avec `marketplace_access.status = active` → **When** `GET /v1/marketplace/agencies` → **Then** agence visible dans le catalogue.

**Given** agence avec `marketplace_access.status = suspended` → **Then** non visible dans le catalogue (filtrée en backend).

**Given** RFP avec `visibility = private` → **When** `PATCH /v1/rfps/{id}/visibility` `{ visibility: "public" }` → **Then** RFP visible par toutes les agences certifiées actives.

**Given** agence répondant à un RFP public → **When** `POST /v1/rfps/{id}/responses` → **Then** réponse enregistrée, score comparateur calculé.

**Given** allocation manuelle → **When** `POST /v1/rfps/{id}:allocate` → **Then** `RfpAllocated` publié, mission draft créée (M7).

**Given** `worker` tentant d'accéder à la marketplace → **Then** 403.

### Definition of Done (M11)

- [ ] Catalogue marketplace: endpoint listing agences certifiées avec filtres (secteur, corridor, certification)
- [ ] Ranking: `agency_marketplace_ranking.ranking_score` calculé batch
- [ ] RFP visibility flag: `PATCH /v1/rfps/{id}/visibility` fonctionnel (dépend Lot 4)
- [ ] RFP publique visible aux agences certifiées actives uniquement
- [ ] Allocation assistée: `POST /v1/rfps/{id}:allocate` fonctionnel
- [ ] Event `MarketplaceRankingUpdated` publié après chaque recalcul ranking
- [ ] RBAC validé par endpoint
- [ ] Tests: unit + integration + RBAC + multi-tenant

---

## Intégration M11 ↔ M12 (points de contact)

- M12 fournit `marketplace_access.status` et `agency_marketplace_ranking.ranking_score` → M11 les lit en lecture seule.
- M12 ne modifie jamais une table M11 directement — tout passe par events.
- M8 (Lot 7) fournit `compliance_scores` → M12 les consomme pour calculer le risk score.
- Frontière stricte: M11 ne calcule jamais de score de conformité.

---

## Livrables obligatoires (Lot 8 global)

- [ ] DB / migrations (M11 + M12: agency_risk_scores, agency_certifications, marketplace_access, agency_marketplace_ranking, agency_profiles)
- [ ] Algorithme risk score V1 (batch quotidien)
- [ ] Algorithme ranking V1 (batch quotidien)
- [ ] Events outbox: `AgencyRiskScoreCalculated`, `AgencyCertificationStatusChanged`, `MarketplaceAccessChanged`, `MarketplaceRankingUpdated`, `AgencyProfileUpdated`
- [ ] OpenAPI contrat respecté (endpoints 2.11 LOCKED + visibility flag 2.11.a V1.2.2)
- [ ] Gating marketplace: certification + suspension automatique
- [ ] RBAC: tous rôles testés par endpoint
- [ ] Tests (unit, integration, RBAC, multi-tenant)
- [ ] Historique scores conservé (audit-ready)

## Ready-to-code gate

- [ ] Gate ready-to-code validée (tous DoD ci-dessus cochés)

---

## Notes de traçabilité

- Contrats référencés: SOCLE V1 LOCKED + 2.9 DB (V1.1) + 2.9.16-E (rfp visibility patch) + 2.10 Events (V1.1) + 2.11 OpenAPI LOCKED + 2.11.a V1.2.2 (visibility flag) + 2.12 RBAC LOCKED.
- Décision OWNER intégrée: Q5-B (RFP visibility flag unifié, marketplace utilise le même mécanisme).
- Aucune modification des documents LOCKED.

## Out of scope

- M2/M3/M4 (CRM/Clients/RFP) → Lot 4 (la RFP marketplace utilise les endpoints Lot 4).
- M5/M6 (ATS/Workers) → Lot 5.
- M8 extension rémunération → Lot 7 (fournit des signaux en entrée).
- Allocation automatique RFP → V2.
- Connecteurs partenaires (job boards, plateformes externes) → V2.
- Algorithme ML avancé risk/ranking → V2.

## Mini-changelog

- 2026-02-18: création du squelette documentaire (sans contenu métier).
- 2026-02-18: ancrage explicite Lot 8 → modules M11/M12 (SOCLE).
- 2026-02-20: réécriture complète READY — cadrage V1/V2 explicite, ancres contractuelles, règles métier M11/M12, GWT, DoD par module. Décision Q5-B (RFP visibility marketplace) intégrée.
