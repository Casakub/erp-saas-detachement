# PATCH EVENTS — 2.10.4.11 — Events manquants (Durées, Skills, SIPSI, Export)

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — section référencée dans 3 documents mais inexistante

---

## Contexte & Justification

### Problème identifié

La section `2.10.4.11` est référencée dans plusieurs documents comme source autoritaire d'events :

| Document source | Ligne / Section | Référence exacte |
|---|---|---|
| `6.7 — CHECKLIST LOT 7` | ligne 41 | `Events: [...] ComplianceDurationAlert (2.10.4.11)` |
| `6.6 — CHECKLIST LOT 5` | Section Events | `WorkerSkillAdded (2.10.4.11)` |
| `SECTION 9 — IMPLEMENTATION SUBSTRATE` | §9.11 | Référence batch M8 → `ComplianceDurationAlert` |

Or, le document `2.10 EVENTS MÉTIER V1 (LOCKED)` s'arrête à la section `2.10.4.10` (dernière section numérotée). La section `2.10.4.11` n'existe pas.

### Approche retenue

**Option 1 (recommandée)** : Créer ce patch `PATCH_EVENTS_2.10.4.11.md` comme addendum au document 2.10, en cohérence avec la pratique des patches 2.11.a et 2.12.a.
> Ne pas modifier 2.10 LOCKED directement. Le patch fait autorité pour les events listés ci-dessous.

Cette section `2.10.4.11` couvre les events des Lots 5, 7, et les nouveaux events liés aux patches DB 2.9.16-C/E/F.

---

## 2.10.4.11 — Events Addendum V1.2 (Conformité, Skills, SIPSI, Export)

> **Note de traçabilité** : Ces events complètent le catalogue 2.10 LOCKED V1. Ils suivent les mêmes règles d'architecture : publication via `events_outbox`, schéma JSON versioned, max_retries=8, backoff exponentiel. Source substrate : `SECTION 9 — IMPLEMENTATION SUBSTRATE §Outbox`.

---

### A) Events M8 — Compliance Duration (Lot 7)

#### ComplianceDurationAlert

| Attribut | Valeur |
|---|---|
| **Nom** | `ComplianceDurationAlert` |
| **Module émetteur** | M8 — Conformité Détachement (extension Salary Engine) |
| **Lot** | 7 |
| **Trigger** | Batch quotidien franchissement seuil durée cumulée |
| **Criticité** | Haute (peut bloquer mission) |

**Payload** :
```json
{
  "event_type": "ComplianceDurationAlert",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "worker_id": "uuid",
  "cumulative_duration_days": 305,
  "alert_level": "warning",
  "threshold_days": 300,
  "country_code": "FR",
  "ruleset_id": "uuid"
}
```

**Valeurs `alert_level`** :
- `"warning"` — si `warning_days ≤ cumulative_duration_days < critical_days` (défaut FR : 300 ≤ d < 365)
- `"critical"` — si `cumulative_duration_days ≥ critical_days` (défaut FR : 365)

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| M13 (Notifications) | Notification push `tenant_admin` + `agency_user` |
| M8 Enforcement | Si `critical` → évaluer `can_activate_mission` selon `country_rulesets` |
| Dashboard agence | Afficher alerte dans liste missions |
| Audit trail | `audit_logs` entry |

**Règle de répétition** :
> L'event est re-publié **chaque jour** tant que le seuil reste dépassé (batch quotidien). Pas de déduplication : chaque publication = un enregistrement d'audit distinct.

**Source** : `6.7 — CHECKLIST LOT 7 ligne 117-123` + `SECTION 10.C country_rulesets` (seuils 300d/365d FR).

---

### B) Events M6 — Workers & Skills (Lot 5)

#### WorkerSkillAdded

| Attribut | Valeur |
|---|---|
| **Nom** | `WorkerSkillAdded` |
| **Module émetteur** | M6 — Workers & Dossiers |
| **Lot** | 5 |
| **Trigger** | `POST /v1/workers/{id}/skills` (2.11.a V1.2.2) |
| **Criticité** | Normale |

**Payload** :
```json
{
  "event_type": "WorkerSkillAdded",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "worker_id": "uuid",
  "skill_id": "uuid",
  "skill_name": "string",
  "skill_category": "technical|language|certification|other",
  "added_by": "uuid",
  "added_by_role": "tenant_admin|agency_user"
}
```

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| M5 ATS (scoring) | Recalcul score matching candidat si skill impacte le scoring |
| Dashboard agence | Mise à jour fiche worker en temps réel |

**Source** : `2.11.a V1.2.2 ligne 371` référence `WorkerSkillAdded`. Table `worker_skills` existe en 2.9.6.

---

### C) Events M8 — SIPSI (Lot 2 / Patch DB 2.9.16-F)

#### SipsiDeclarationCreated

| Attribut | Valeur |
|---|---|
| **Nom** | `SipsiDeclarationCreated` |
| **Module émetteur** | M8 — Conformité Détachement |
| **Lot** | 2 (extension Lot 7) |
| **Trigger** | `POST /v1/compliance-cases/{id}/sipsi-declaration` |
| **Criticité** | Normale |

**Payload** :
```json
{
  "event_type": "SipsiDeclarationCreated",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "sipsi_declaration_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "worker_id": "uuid",
  "host_country": "FR",
  "status": "draft",
  "created_by": "uuid"
}
```

#### SipsiDeclarationStatusChanged

| Attribut | Valeur |
|---|---|
| **Nom** | `SipsiDeclarationStatusChanged` |
| **Module émetteur** | M8 — Conformité Détachement |
| **Trigger** | PATCH status sur `sipsi_declarations` |
| **Criticité** | Haute (si submitted / rejected) |

**Payload** :
```json
{
  "event_type": "SipsiDeclarationStatusChanged",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "sipsi_declaration_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "previous_status": "draft",
  "new_status": "submitted",
  "external_ref": "SIPSI-2026-XXXX|null",
  "changed_by": "uuid"
}
```

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| M13 (Notifications) | Notification `tenant_admin` si statut = `rejected` |
| Checklist Compliance Case | Mise à jour statut SIPSI dans dossier mission |
| Audit trail | Entry dans `audit_logs` |

**Source** : Patch DB `2.9.16-F` (ce repo) + `2.11.a V1.2.2` endpoint SIPSI.

---

### D) Events M8 — Export Dossier Inspection (V1)

#### ComplianceDossierExportRequested

| Attribut | Valeur |
|---|---|
| **Nom** | `ComplianceDossierExportRequested` |
| **Module émetteur** | M8 — Conformité Détachement |
| **Lot** | Lot 7 (extension) |
| **Trigger** | `POST /v1/compliance-cases/{id}:export-dossier` |
| **Criticité** | Normale |

**Payload** :
```json
{
  "event_type": "ComplianceDossierExportRequested",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "export_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "requested_by": "uuid",
  "format": "pdf"
}
```

#### ComplianceDossierExportCompleted

| Attribut | Valeur |
|---|---|
| **Nom** | `ComplianceDossierExportCompleted` |
| **Module émetteur** | M8 / Service Export (worker job) |
| **Trigger** | Job export terminé (async) |
| **Criticité** | Normale |

**Payload** :
```json
{
  "event_type": "ComplianceDossierExportCompleted",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "export_id": "uuid",
  "compliance_case_id": "uuid",
  "status": "ready",
  "storage_path": "string",
  "expires_at": "ISO8601"
}
```

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| M13 (Notifications) | Notification push `tenant_admin` + `agency_user` "Export prêt" |
| Frontend polling | Résolution du polling GET status |

**Source** : `SECTION 6 — Checklist Globale 6.0 ligne 113` (export inspection-ready listé comme livrable V1) + `PATCH_OPENAPI_V1.3` (endpoint à créer).

---

---

### E) Events M8 — Égalité de Traitement (Lot 7 — Directive 2018/957/UE)

#### EqualTreatmentCheckCreated

| Attribut | Valeur |
|---|---|
| **Nom** | `EqualTreatmentCheckCreated` |
| **Module émetteur** | M8 — Conformité Détachement |
| **Lot** | 7 |
| **Trigger** | `POST /v1/compliance-cases/{id}/equal-treatment-check` |
| **Criticité** | Normale |

**Payload** :
```json
{
  "event_type": "EqualTreatmentCheckCreated",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "equal_treatment_check_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "worker_id": "uuid",
  "is_compliant": true,
  "gap_amount": 1.00,
  "engine_version": "etreq-1.0",
  "created_by": "uuid"
}
```

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| Audit trail | `audit_logs` entry |
| Dashboard agence | Mise à jour statut égalité de traitement dans dossier |

**Règle de répétition** :
> Publié à chaque POST (chaque snapshot est un event distinct — audit trail complet). Pas de déduplication.

**Source** : `CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1`, `PATCH_OPENAPI_V1.3 §5`, `PATCH_DB_2.9.16-G §Table A`.

---

#### EqualTreatmentViolationDetected

| Attribut | Valeur |
|---|---|
| **Nom** | `EqualTreatmentViolationDetected` |
| **Module émetteur** | M8 — Conformité Détachement |
| **Lot** | 7 |
| **Trigger** | `POST /v1/compliance-cases/{id}/equal-treatment-check` si `is_compliant = false` |
| **Criticité** | Haute — violation légale Directive 2018/957/UE |

**Payload** :
```json
{
  "event_type": "EqualTreatmentViolationDetected",
  "event_version": "1.0",
  "occurred_at": "ISO8601",
  "tenant_id": "uuid",
  "equal_treatment_check_id": "uuid",
  "compliance_case_id": "uuid",
  "mission_id": "uuid",
  "worker_id": "uuid",
  "gap_amount": -1.00,
  "gap_percentage": -7.14,
  "items_failing": ["remuneration"],
  "host_country": "FR",
  "engine_version": "etreq-1.0"
}
```

**Champ `items_failing`** — valeurs possibles :
- `"remuneration"` — `worker_eligible_wage < host_country_reference_wage`
- `"working_time"` — `working_time_compliant = false`
- `"paid_leave"` — `paid_leave_compliant = false`
- `"health_safety"` — `health_safety_compliant = false`
- `"accommodation"` — `accommodation_compliant = false`

**Consommateurs autorisés** :
| Consommateur | Action |
|---|---|
| M13 (Notifications) | Alerte immédiate `tenant_admin` + `agency_user` — violation légale |
| Dashboard Conformité | Indicateur rouge sur dossier |
| Audit trail | `audit_logs` entry avec criticité haute |

**Règle de répétition** :
> Publié uniquement si `is_compliant = false`. Un seul event par POST (même si plusieurs items failing — liste dans `items_failing`).

**Source** : `CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1 Events`, `6.9 Checklist — GWT ViolationDetected`, `PATCH_OPENAPI_V1.3 §5 events_outbox`.

---

## Tableau récapitulatif — Section 2.10.4.11

| Event | Module | Lot | Trigger | Consommateurs principaux |
|---|---|---|---|---|
| `ComplianceDurationAlert` | M8 | 7 | Batch quotidien | M13 Notifs, M8 Enforcement |
| `WorkerSkillAdded` | M6 | 5 | POST skills endpoint | M5 ATS scoring |
| `SipsiDeclarationCreated` | M8 | 2 | POST sipsi endpoint | Audit, checklist |
| `SipsiDeclarationStatusChanged` | M8 | 2 | PATCH status | M13 Notifs, Audit |
| `ComplianceDossierExportRequested` | M8 | 7 | POST export endpoint | Job worker |
| `ComplianceDossierExportCompleted` | M8 | 7 | Job worker terminé | M13 Notifs |
| `EqualTreatmentCheckCreated` | M8 | 7 | POST equal-treatment-check | Audit, Dashboard |
| `EqualTreatmentViolationDetected` | M8 | 7 | POST si is_compliant=false | M13 Notifs, Dashboard |

---

## Règles communes (héritées de 2.10 LOCKED)

```
Architecture outbox : tous ces events transitent par la table events_outbox
  - max_retries = 8
  - backoff exponentiel (30s, 60s, 120s...)
  - dispatcher toutes les 60 secondes (cron)
  Source: SECTION 9 — IMPLEMENTATION SUBSTRATE §Outbox

Versionning : event_version = "1.0" pour tous les events V1
  → incrémenter si payload change (breaking change)

Idempotence : chaque consommateur DOIT être idempotent
  → stocker event_id déjà traité

Isolation tenant : tous les events contiennent tenant_id
  → consommateurs filtrent par tenant_id

Cross-tenant : aucun event ne traverse les frontières tenant
  (sauf platform_admin qui peut consommer tous events en V2)
```

---

## Notes de traçabilité

- Contrats référencés : `6.7 ligne 41` (ComplianceDurationAlert), `2.11.a ligne 371` (WorkerSkillAdded), `SECTION 9 §Outbox` (règles communes), `PATCH_DB_2.9.16-F` (SIPSI), `CDC_COMPLETIONS_FROM_AUDIT §C1` (EqualTreatment).
- Ce patch ne modifie pas le document `2.10 EVENTS MÉTIER V1 (LOCKED)`.
- Il fait autorité pour les events listés ci-dessus jusqu'à intégration dans une future version LOCKED de 2.10.

## Mini-changelog

- 2026-02-22 : Création du patch. Résout la référence orpheline "2.10.4.11" citée dans 6.6, 6.7 et SECTION 9 mais inexistante dans 2.10 LOCKED. 6 events définis : ComplianceDurationAlert, WorkerSkillAdded, SipsiDeclarationCreated, SipsiDeclarationStatusChanged, ComplianceDossierExportRequested, ComplianceDossierExportCompleted.
- 2026-02-22 : V1.2.3 — Ajout §E : EqualTreatmentCheckCreated + EqualTreatmentViolationDetected. Résout gap : events référencés dans CDC_COMPLETIONS §C1 + 6.9 Checklist mais absents du patch. Sources : PATCH_DB_2.9.16-G §A, PATCH_OPENAPI_V1.3 §5, CDC_COMPLETIONS_FROM_AUDIT §C1.
