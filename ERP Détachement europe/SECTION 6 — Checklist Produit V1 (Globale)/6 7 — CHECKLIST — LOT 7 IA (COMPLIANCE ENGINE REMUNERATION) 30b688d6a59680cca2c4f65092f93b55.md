# 6.7 — CHECKLIST — LOT 7 IA (COMPLIANCE ENGINE RÉMUNÉRATION)

- Statut: READY
- Portée: checklist opérationnelle complète du Lot 7 — moteur conformité rémunération V1 (M8 extension salary engine).
- Règles: aucun changement aux documents LOCKED (2.9/2.10/2.11/2.12). Complément opérationnel uniquement.
- Références SOCLE:
  - `SOCLE LOCKED:501` — plan d'exécution lots
  - `SOCLE LOCKED:532-536` — périmètre Lot 7 (salary engine, snapshots, explicabilité)
  - `SOCLE LOCKED:213` — principe backend décide (pas de logique dans no-code)
  - `SOCLE LOCKED:335` — moteur conformité rémunération V1

---

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope | Notes |
| --- | --- | --- | --- |
| M8 | Conformité Détachement | oui | Extension: salary engine, snapshots, enforcement flags, durées. |
| M10 | Finance | non | Lot 6 (Finance billing). |
| M11 | Marketplace | non | Lot 8. |
| M12 | Risk & Certification | non | Lot 8. |
| M13 | i18n & Comms | non | Transverse. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé (Foundation: tenant, users, RBAC, Vault)
- [ ] Lot 2 validé (Core Métier: missions, compliance_case base, enforcement flags)
- [ ] Lot 3 validé (Timesheets & Mobile)
- [ ] Lot 4 validé (CRM/Clients/RFP)
- [ ] Lot 5 validé (ATS/Workers)
- [ ] Lot 6 validé (Finance/Billing)

---

## M8 — Moteur Conformité Rémunération V1

### Ancres contractuelles

- DB: `worker_remuneration_snapshot`, `remuneration_inputs`, `salary_grids`, `mandatory_pay_items`, `country_rulesets`, `mission_enforcement_flags`, `compliance_cases` (2.9 LOCKED + 2.9.16-D, 2.9.16-F)
- OpenAPI: `POST /v1/compliance-cases/{id}/remuneration/inputs`, `POST /v1/compliance-cases/{id}/remuneration/snapshots:calculate`, `GET /v1/admin/salary-grids`, `POST /v1/admin/salary-grids`, `POST /v1/admin/mandatory-pay-items`, `GET /v1/admin/country-rulesets` (2.11 LOCKED + 2.11.a V1.2.2)
- Events: `RemunerationSnapshotCreated`, `MissionEnforcementEvaluated`, `ComplianceDurationAlert`, `ComplianceScoreCalculated`, `ComplianceStatusChanged` (2.10.4.7, 2.10.4.11)
- RBAC: `tenant_admin` + `agency_user` lecture/écriture; `system` sur admin salary-grids (import batch); `client_user`, `worker`, `consultant` exclus du moteur (2.12.a V1.2.2 Q2-B)

### Algorithme moteur rémunération V1 (5 étapes)

```
ENTRÉES:
  compliance_case_id
  remuneration_inputs (base_salary, primes[], expense_items[])
  date_debut_mission, date_fin_mission
  idcc_code (ex: "BTP-1702", "METAL-3109", "TRANSPORT-16")
  classification_code (ex: "N3P1", "OUVRIER_C1")
  country_host (ex: "FR")

ÉTAPE 1 — Récupérer le référentiel salary_grids
  → Chercher la grille active pour (idcc_code, classification_code, date_debut_mission)
  → Si non trouvé: warning "référentiel manquant", non bloquant en V1 (v1_mode.assisted_only=true)
  → Grille contient: legal_minimum_amount (montant brut horaire ou mensuel), period_type (hourly|monthly)

ÉTAPE 2 — Calculer les éléments admissibles
  → eligible_remuneration_amount = base_salary
  → Pour chaque prime[] de remuneration_inputs:
      Si is_reimbursable=false ET présente dans mandatory_pay_items → inclure dans eligible
      Si is_reimbursable=true → exclure (= expense_item)
  → excluded_expenses_amount = Σ expense_items (logement, transport, repas, perdiem)
  → RÈGLE: logement + transport + repas + perdiem sont TOUJOURS exclus du calcul admissible

ÉTAPE 3 — Comparer avec le minimum légal
  → Si period_type=hourly: comparer eligible_remuneration_amount/h vs legal_minimum_amount/h
  → Si period_type=monthly: comparer eligible_remuneration_amount/mois vs legal_minimum_amount/mois
  → is_compliant = (eligible_remuneration_amount >= legal_minimum_amount)

ÉTAPE 4 — Générer le snapshot immuable
  → Créer worker_remuneration_snapshot:
      compliance_case_id, snapshot_id (uuid), worker_id, mission_id
      is_compliant (bool)
      eligible_remuneration_amount
      excluded_expenses_amount
      legal_minimum_amount
      calculation_details (jsonb — breakdown complet: chaque prime, son statut inclus/exclu, raison)
      engine_version (ex: "pay-1.0")
      created_at (immuable — jamais de updated_at)
  → Snapshot JAMAIS modifié après création (audit-ready)

ÉTAPE 5 — Mettre à jour les enforcement flags
  → Si is_compliant=false:
      can_activate_mission=false, reason=["SALARY_BELOW_MIN"]
      can_validate_timesheets=false (si mission non encore active)
      can_issue_invoice=false
  → Si is_compliant=true:
      Re-évaluer tous les flags (A1, docs, durée) → MissionEnforcementEvaluated
  → Publier RemunerationSnapshotCreated + MissionEnforcementEvaluated (via outbox)
```

### Données IDCC V1 (décision Q2-B)

Plan de données grilles salariales V1:

| IDCC | Secteur | Couverture V1 | Source |
| --- | --- | --- | --- |
| BTP-1702 | Bâtiment et Travaux Publics | Ouvriers N1→N4, ETAM | Grille nationale BTP, màj annuelle |
| METAL-3109 | Métallurgie (CCN 2024) | Coefficients 215→365 | CCN Métallurgie 2024, classifications mensuelles |
| TRANSPORT-16 | Transports routiers | Niveaux I→V | Annexe I CCN Transport |

- Import initial: admin panel `POST /v1/admin/salary-grids` (RBAC: `tenant_admin` + `system`)
- `system` autorisé uniquement pour import batch (Q2-C futur, V1 = import manuel via admin panel)
- `salary_grids` versionné: chaque grille a `effective_date`, `model_version`. Historique conservé (jamais de delete).
- `mandatory_pay_items`: primes obligatoires qui s'ajoutent au salaire admissible (non remboursables par définition).
- `country_rulesets`: seuils de durée par pays (300j warning, 365j critical pour la France) — configurables par `tenant_admin`.

### Contrôle des durées cumulées (décision Q7-C)

- `cumulative_duration_days` calculé per worker × per mission individuelle (pas cross-missions).
- Seuils configurables dans `country_rulesets.duration_thresholds`:
  - `warning_days`: défaut 300 (France)
  - `critical_days`: défaut 365 (France)
- Batch quotidien M8:
  - Recalcule `cumulative_duration_days` pour chaque mission active
  - Si franchissement seuil → publie `ComplianceDurationAlert` (2.10.4.11)
  - Alert re-publiée chaque jour tant que le seuil reste dépassé
  - `alert_level = "warning"` si 300d ≤ durée < 365d
  - `alert_level = "critical"` si durée ≥ 365d
- Correspondance enforcement: durée > `critical_days` → peut déclencher `can_activate_mission=false` selon règles pays (configuré dans `country_rulesets`)

### Règles de validation & cas limites

| Cas | Comportement V1 |
| --- | --- |
| `base_salary < 0` | Erreur validation 422 — calcul refusé |
| IDCC non trouvé pour la période | Warning non-bloquant, snapshot créé avec `is_compliant=null`, `warning_code="REF_MISSING"` |
| IDCC trouvé, `eligible < legal_min` | `is_compliant=false`, enforcement flags bloquants |
| Primes obligatoires non incluses | Erreur si `mandatory_pay_items` requis manquants dans les inputs |
| Snapshot déjà existant pour le même `compliance_case_id` | Nouveau snapshot créé (l'ancien est conservé — audit trail complet) |
| Mission déjà active, snapshot mis à jour | Re-évaluation enforcement sans blocage rétroactif si déjà active (policy V1: audit uniquement) |

### Critères d'acceptation (GWT)

**Given** worker avec `base_salary=12 EUR/h`, IDCC BTP minimum = `13 EUR/h` →
**Then** `is_compliant=false`, `can_activate_mission=false`, `reason=["SALARY_BELOW_MIN"]`, snapshot créé avec `engine_version="pay-1.0"`.

**Given** worker avec `base_salary=14 EUR/h`, `expense_logement=200 EUR/sem` (is_reimbursable=true), IDCC min = `13 EUR/h` →
**Then** `excluded_expenses_amount=200`, `eligible_remuneration_amount=14 EUR/h`, `is_compliant=true`.

**Given** `mandatory_pay_item` prime de transport obligatoire `is_reimbursable=false`, incluse dans inputs →
**Then** prime incluse dans `eligible_remuneration_amount`.

**Given** IDCC non référencé pour la période →
**Then** warning non-bloquant, `is_compliant=null`, `warning_code="REF_MISSING"`, snapshot créé, mission non bloquée en V1.

**Given** snapshot calculé et stocké →
**Then** `updated_at` absent, snapshot immuable, nouveau calcul crée un nouveau snapshot (l'ancien conservé).

**Given** batch quotidien, `cumulative_duration_days=305`, seuil warning=300 →
**Then** `ComplianceDurationAlert` publié avec `alert_level="warning"`, `threshold_days=300`.

**Given** `cumulative_duration_days=370`, seuil critical=365 →
**Then** `ComplianceDurationAlert` publié avec `alert_level="critical"`, enforcement flags mis à jour selon `country_rulesets`.

**Given** `client_user` tentant `POST /v1/compliance-cases/{id}/remuneration/inputs` ou `POST /v1/compliance-cases/{id}/remuneration/snapshots:calculate` →
**Then** 403 Forbidden.

**Given** `agency_user` accédant `GET /v1/admin/salary-grids` →
**Then** lecture autorisée (lecture seule — écriture réservée `tenant_admin` + `system`).

### Definition of Done (M8 Lot 7)

- [ ] Tables `salary_grids`, `mandatory_pay_items`, `country_rulesets` migrées avec RLS + versioning
- [ ] Table `worker_remuneration_snapshot` migrée — champ `updated_at` absent (immuabilité garantie)
- [ ] Algorithme moteur rémunération en 5 étapes implémenté (backend uniquement)
- [ ] 3 IDCC V1 chargés: BTP, Métallurgie, Transport (via admin panel ou fixtures)
- [ ] Seuils durée `country_rulesets` configurables (300d/365d France par défaut)
- [ ] Batch quotidien: `ComplianceDurationAlert` publiés pour seuils franchis
- [ ] Enforcement flags mis à jour après chaque snapshot
- [ ] Events publiés via outbox: `RemunerationSnapshotCreated`, `MissionEnforcementEvaluated`, `ComplianceDurationAlert`
- [ ] Admin endpoints `salary-grids`, `mandatory-pay-items`, `country-rulesets` implémentés + RBAC
- [ ] RBAC validé: aucun `client_user`/`worker`/`consultant` sur les endpoints moteur
- [ ] Tests: unit (algorithme, 5 étapes, cas limites), integration, RBAC, multi-tenant
- [ ] Audit: chaque snapshot conservé (pas de delete), tous les calculs traçables

---

## Livrables obligatoires (Lot 7 global)

- [ ] DB / migrations (salary_grids, mandatory_pay_items, country_rulesets, worker_remuneration_snapshot)
- [ ] Algorithme moteur rémunération (5 étapes) déployé en backend
- [ ] Events outbox: `RemunerationSnapshotCreated`, `MissionEnforcementEvaluated`, `ComplianceDurationAlert`, `ComplianceScoreCalculated`
- [ ] OpenAPI contrat respecté (endpoints V1 LOCKED + V1.2.2 admin salary-grids)
- [ ] RBAC: tous rôles testés par endpoint
- [ ] Batch quotidien: durées cumulées + alertes opérationnelles
- [ ] Données IDCC V1 (BTP, Métallurgie, Transport) disponibles
- [ ] Snapshots immuables (audit-ready, inspection-ready)

## Ready-to-code gate

- [ ] Gate ready-to-code validée (tous DoD ci-dessus cochés)

---

## Notes de traçabilité

- Contrats référencés: SOCLE V1 LOCKED + 2.9 DB (V1.1) + 2.9.16 (patch V1.2) + 2.10 Events (V1.1 + 2.10.4.11) + 2.11 OpenAPI LOCKED + 2.11.a V1.2.2 + 2.12.a V1.2.2.
- Décisions OWNER intégrées: Q2-B (admin salary-grids CRUD + IDCC V1), Q7-C (cumul per-mission, seuils 300d/365d).
- Aucune modification des documents LOCKED.

## Out of scope

- M2/M3/M4 (CRM/Clients/RFP) → Lot 4.
- M5/M6 (ATS/Workers) → Lot 5.
- M10 (Finance) → Lot 6.
- M11/M12 (Risk/Certification/Marketplace) → Lot 8.
- Automatisation SIPSI / connecteurs A1 par pays → V2 (Backlog 2.10.7).
- Import batch automatique salary-grids via `system` → Q2-C futur V2.
- Scoring conformité avancé (renforcement Lot 7 V2) → V2 (`SOCLE:532`).

## Mini-changelog

- 2026-02-18: création du squelette documentaire + moteur rémunération V1 (workflow 5 étapes, règles métier, GWT).
- 2026-02-18: ancrage explicite Lot 7 → module M8 (SOCLE).
- 2026-02-20: réécriture complète READY — ancres contractuelles complètes, IDCC V1 data plan, contrôle durées cumulées, GWT complet, DoD complet. Décisions Q2-B et Q7-C intégrées.
