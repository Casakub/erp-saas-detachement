# 6.9 — CHECKLIST — LOT 7 BIS IA (ÉGALITÉ DE TRAITEMENT)

- **Statut**: DRAFT
- **Version**: 1.0
- **Date**: 2026-02-22
- **Portée**: checklist opérationnelle du module M8.3 — Égalité de Traitement (Directive 2018/957/UE).
- **Règles**: aucun changement aux documents LOCKED (2.9/2.10/2.11/2.12). Complément opérationnel uniquement.
- **Références SOCLE**:
  - `PATCH_DB_2.9.16-G` — table `equal_treatment_checks`
  - `PATCH_EVENTS_2.10.4.11 §E` — events `EqualTreatmentCheckCreated` + `EqualTreatmentViolationDetected`
  - `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES §5` — contrats API `POST` + `GET /equal-treatment-check`
  - `CDC_COMPLETIONS_FROM_AUDIT §1` — spécification complète M8.3
  - `Directive 2018/957/UE Art.3 §1bis` — obligation légale

---

## Cadrage V1 vs V2

| Surface | V1 (assisté/manuel) | V2 (automatisé) |
|---|---|---|
| Saisie référence salariale pays hôte | Manuelle (agent saisit) | API externe salaires minimaux |
| Comparaison rémunération | Règles-based (calcul simple) | Moteur ML multi-critères |
| Items Directive vérifiés | Saisie manuelle (checkboxes) | Vérification automatique |
| Alertes non-conformité | Event + notification push | Blocage enforcement automatique |
| Intégration enforcement flags | Aucun blocage automatique V1 | Blocage `can_activate_mission` si non conforme |

**Règle de build** : implémenter uniquement les surfaces V1. Les automatisations V2 restent hors scope.

---

## Module couvert par ce lot

| Module | Nom SOCLE | In scope | Notes |
|---|---|---|---|
| M8.3 | Égalité de Traitement (extension M8) | oui | Check manuel V1, snapshot immuable |
| M8 | Conformité Détachement (base) | non | Lot 2 (déjà livré) |
| M8+ | Salary Engine | non | Lot 7 (fournit `worker_eligible_wage`) |

## Dépendances (lots précédents)

- [ ] Lot 1 validé (Foundation: tenant, users, RBAC)
- [ ] Lot 2 validé (Core Métier: missions, compliance_case)
- [ ] Lot 7 validé (Salary Engine: `worker_remuneration_snapshots` disponibles — fournit `worker_eligible_wage`)

---

## M8.3 — Moteur Égalité de Traitement V1

### Contexte légal obligatoire

**Directive 2018/957/UE** (révision Directive 96/71/CE), Art. 3 §1bis :
> "Les États membres veillent à ce que les travailleurs détachés bénéficient des mêmes conditions d'emploi et de rémunération que les travailleurs locaux du pays hôte."

**Items obligatoires couverts en V1** :
1. Rémunération (vs salaire minimum légal ou IDCC du pays hôte)
2. Durée maximale du travail et périodes de repos minimales
3. Congés annuels payés
4. Conditions d'hygiène, santé et sécurité au travail
5. Traitement des allocations (salaire vs remboursement)

### Ancres contractuelles

- **DB** : `equal_treatment_checks` (PATCH_DB_2.9.16-G — immuable, pas d'updated_at)
- **OpenAPI** : `POST /v1/compliance-cases/{id}/equal-treatment-check`, `GET /v1/compliance-cases/{id}/equal-treatment-check` (`PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES §5`)
- **Events** : `EqualTreatmentCheckCreated`, `EqualTreatmentViolationDetected` (`PATCH_EVENTS_2.10.4.11 §E`)
- **RBAC** : `tenant_admin` + `agency_user` en lecture/écriture ; `worker` en lecture seule ; `client_user`, `consultant` exclus

### Algorithme V1 (règles-based, 3 étapes)

```
ENTRÉES (saisies manuellement par agent) :
  compliance_case_id
  host_country_reference_wage (montant brut de référence)
  reference_period_type (hourly | monthly)
  reference_source (description: ex "SMIC FR 2026 = 11.88€/h")
  working_time_compliant (boolean)
  paid_leave_compliant (boolean)
  health_safety_compliant (boolean)
  accommodation_compliant (boolean — si logement fourni)
  allowances_treatment_type (wage | reimbursement | mixed)
  notes (justification libre)

ÉTAPE 1 — Récupérer worker_eligible_wage
  → Lire le dernier worker_remuneration_snapshot pour ce compliance_case_id
  → Si absent : warning non-bloquant, check créé avec is_compliant=null, warning_code="NO_REMUNERATION_SNAPSHOT"

ÉTAPE 2 — Comparer rémunérations
  → gap_amount = worker_eligible_wage - host_country_reference_wage
  → is_wage_compliant = (gap_amount >= 0)
  → gap_percentage = (gap_amount / host_country_reference_wage) * 100

ÉTAPE 3 — Résultat global
  → is_compliant = is_wage_compliant
                   AND working_time_compliant
                   AND paid_leave_compliant
                   AND health_safety_compliant
  → Créer snapshot immuable equal_treatment_checks (jamais de update)
  → Si is_compliant = false → event EqualTreatmentViolationDetected
  → Toujours → event EqualTreatmentCheckCreated
```

### Règles de validation & cas limites

| Cas | Comportement V1 |
|---|---|
| `worker_eligible_wage < 0` | Erreur 422 — calcul refusé |
| Pas de remuneration_snapshot disponible | Warning non-bloquant, `is_compliant=null`, `warning_code="NO_REMUNERATION_SNAPSHOT"` |
| is_wage_compliant=true mais items autres à false | `is_compliant=false` — la conformité globale exige TOUS les items |
| Nouveau check sur même compliance_case | Nouveau snapshot créé, ancien conservé (audit trail complet) |
| accommodation_compliant non renseigné | Ignoré du calcul global si logement non fourni (null = N/A) |
| host_country_reference_wage = 0 | Erreur 422 — valeur invalide |

### Critères d'acceptation (GWT)

**Given** worker avec `eligible_wage=12 EUR/h`, `host_reference_wage=13 EUR/h`, tous items autres = true →
**When** agent soumet le check →
**Then** `is_compliant=false`, `gap_amount=-1.00`, `gap_percentage=-7.69`, `EqualTreatmentViolationDetected` publié.

**Given** worker avec `eligible_wage=14 EUR/h`, `host_reference_wage=13 EUR/h`, tous items = true →
**Then** `is_compliant=true`, `gap_amount=+1.00`, `EqualTreatmentCheckCreated` publié.

**Given** `eligible_wage=14 EUR/h` >= `reference=13 EUR/h` MAIS `working_time_compliant=false` →
**Then** `is_compliant=false` (la conformité globale exige tous les items).

**Given** pas de `worker_remuneration_snapshot` pour ce case →
**Then** `is_compliant=null`, `warning_code="NO_REMUNERATION_SNAPSHOT"`, snapshot créé quand même.

**Given** nouveau check sur même `compliance_case_id` →
**Then** second snapshot créé (id différent), premier conservé — aucune modification de l'existant.

**Given** `client_user` tentant `POST /v1/compliance-cases/{id}/equal-treatment-check` →
**Then** 403 Forbidden.

**Given** `worker` tentant `GET /v1/compliance-cases/{id}/equal-treatment-check` →
**Then** 200 si c'est sa propre mission / 403 si cross-worker.

**Given** cross-tenant (autre agence tentant d'accéder au check) →
**Then** 403/404 (RLS tenant isolation).

### Definition of Done (M8.3 Égalité de Traitement)

- [ ] Table `equal_treatment_checks` migrée (PATCH_DB_2.9.16-G migration 5)
- [ ] Champ `updated_at` absent (immuabilité garantie par DDL)
- [ ] RLS activé : 3 politiques (tenant_staff, worker_read, platform_admin)
- [ ] Algorithme V1 implémenté en backend (règles-based, 3 étapes)
- [ ] Lecture automatique `worker_eligible_wage` depuis dernier `worker_remuneration_snapshot`
- [ ] Cas limite : warning si pas de snapshot (`is_compliant=null`)
- [ ] Events publiés via outbox : `EqualTreatmentCheckCreated` + `EqualTreatmentViolationDetected`
- [ ] RBAC validé par endpoint (`client_user` / `consultant` exclus — unit tests par rôle)
- [ ] Worker en lecture seule sur ses propres checks
- [ ] Audit : chaque check conservé (pas de delete), tous traçables
- [ ] Tests : unit (algorithme 3 étapes + cas limites) + integration + RBAC + multi-tenant

---

## Livrables obligatoires (Lot 7 Bis global)

- [ ] DB / migration `equal_treatment_checks` (PATCH_DB_2.9.16-G)
- [ ] Algorithme M8.3 déployé en backend (3 étapes)
- [ ] Events outbox : `EqualTreatmentCheckCreated`, `EqualTreatmentViolationDetected`
- [ ] Endpoints : `POST` + `GET` `/v1/compliance-cases/{id}/equal-treatment-check`
- [ ] RBAC : tous rôles testés par endpoint
- [ ] Snapshots immuables (audit-ready)
- [ ] Items Directive 2018/957 couverts (rémunération + temps de travail + congés + H&S)

## Ready-to-code gate

- [ ] Gate ready-to-code validée (tous DoD ci-dessus cochés)
- [ ] Lot 7 (Salary Engine) validé en prérequis (`worker_remuneration_snapshots` disponibles)

---

## Notes de traçabilité

- Contrats référencés : `PATCH_DB_2.9.16-G` + `PATCH_EVENTS_2.10.4.11 §E` + `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES §5` + `CDC_COMPLETIONS_FROM_AUDIT §1` + `Directive 2018/957/UE Art.3`.
- Aucune modification des documents LOCKED.
- Décision OWNER audit 2026-02-22 : V1 MINIMAL — check manuel + snapshot immuable + events.

## Out of scope

- Récupération automatique salaires minimaux pays hôte (API externe) → V2.
- Blocage automatique enforcement si non conforme → V2 (V1 = alerte uniquement).
- Scoring conformité avancé multi-pays → V2.
- Égalité de traitement automatisée (connecteurs légaux) → V2.

## Mini-changelog

- 2026-02-22 : Création suite à audit fonctionnel — gap légal Directive 2018/957/UE identifié, module M8.3 absent du CDC. Checklist complète créée avec algorithme V1, GWT, DoD.
- 2026-02-22 : v1.1 — Correction références : §D → §E pour events EqualTreatment (§D = export dossier), ajout référence `PATCH_OPENAPI_V1.3 §5` (contrats API maintenant formalisés). Alignement total OpenAPI/Events/Checklist sans divergence.
