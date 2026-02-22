# PATCH OPENAPI — V1.3 — Surfaces manquantes

- **Statut**: DRAFT V1.3
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Version précédente**: 2.11.a — OPENAPI V1.2 (PATCH) — SURFACES MANQUANTES
- **Priorité**: HAUTE — 5 surfaces référencées par E2E/Checklists sans contrat API

---

## Contexte & Justification

Ce patch V1.3 complète le document `2.11.a — OPENAPI V1.2 (PATCH)` (DRAFT V1.2.2) pour couvrir les surfaces d'API identifiées comme manquantes lors de l'audit fonctionnel du 2026-02-22.

### Surfaces ajoutées dans ce patch

| Surface | Justification | Lot |
|---|---|---|
| `GET /v1/marketplace/agencies` | E2E-10 + GWT 6.8 — endpoint requis mais absent de 2.11 ET 2.11.a | 8 |
| `POST /GET /v1/leads/{id}/activities` | Table `lead_activities` en DB 2.9.3, aucun endpoint | 4 |
| `POST /v1/compliance-cases/{id}:export-dossier` | Checklist 6.0 ligne 113 livrable obligatoire V1 | 7 |
| `GET /v1/compliance-cases/{id}/compliance-score` | M12 consomme le score, aucun endpoint lecture | 7/8 |

### Ce qui N'est PAS dans ce patch (hors scope confirmé V2)

- Connecteurs SIPSI direct API → V2
- Allocation automatique RFP → V2
- Analytics avancées multi-tenant → V2
- Matching IA avancé → V2

---

## Convention de documentation des endpoints

```
Format utilisé :
  ENDPOINT — <METHOD> <PATH>
  Summary: description courte
  Lot / Module: référence
  RBAC: rôles autorisés + source
  Parameters: query params ou path params
  Request Body: schema JSON
  Response 200/201/202: schema JSON
  Errors: codes et conditions
  Events outbox: events publiés (si applicable)
  Source: références justificatives
```

---

## 1) GET /v1/marketplace/agencies

### Justification

Référencé dans :
- `6.8 — CHECKLIST LOT 8 ligne 138` : `GET /v1/marketplace/agencies` dans GWT
- `SECTION 10.E — ACCEPTANCE TESTS E2E-10` : scénario marketplace gating
- `6.8 ligne 152` : DoD "Catalogue marketplace: endpoint listing agences certifiées avec filtres"

Absent de `2.11 LOCKED` et `2.11.a V1.2.2`.

### Contrat

```yaml
GET /v1/marketplace/agencies:
  summary: Catalogue des agences certifiées et actives sur la marketplace
  tags: [Marketplace — M11]
  lot: 8
  security:
    - BearerAuth: []

  rbac:
    allowed_roles:
      - tenant_admin       # voir toutes les agences actives
      - agency_user        # voir le catalogue (pour postuler sur RFPs)
      - client_user        # lecture selon settings tenant (tenant_settings.client_marketplace_access)
    denied:
      - worker             # 403
      - consultant         # 403
    source: "2.12.a V1.2.2 + règle générale SOCLE RBAC §M11"

  parameters:
    - name: sector
      in: query
      required: false
      schema:
        type: string
      description: "Filtrer par secteur (ex: BTP, METAL, TRANSPORT)"

    - name: origin_country
      in: query
      required: false
      schema:
        type: string
        pattern: "^[A-Z]{2}$"
      description: "Pays d'origine de l'agence (ISO 3166-1 alpha-2)"

    - name: host_country
      in: query
      required: false
      schema:
        type: string
        pattern: "^[A-Z]{2}$"
      description: "Pays hôte couvert par l'agence (ISO 3166-1 alpha-2)"

    - name: certification_level
      in: query
      required: false
      schema:
        type: string
        enum: [controlled, verified, certified]
      description: "Niveau minimum de certification requis"

    - name: min_compliance_score
      in: query
      required: false
      schema:
        type: integer
        minimum: 0
        maximum: 100
      description: "Score de conformité minimum (0=meilleur... attention: 0=meilleur, 100=pire pour risk_score)"

    - name: page
      in: query
      required: false
      schema:
        type: integer
        default: 1

    - name: limit
      in: query
      required: false
      schema:
        type: integer
        default: 20
        maximum: 50

  responses:
    200:
      description: Liste des agences certifiées actives
      content:
        application/json:
          schema:
            type: object
            properties:
              data:
                type: array
                items:
                  type: object
                  properties:
                    agency_id:
                      type: string
                      format: uuid
                      description: "ID du tenant agence"
                    agency_name:
                      type: string
                    certification_level:
                      type: string
                      enum: [controlled, verified, certified]
                    marketplace_access_status:
                      type: string
                      enum: [active]
                      description: "Toujours 'active' (les suspendus sont filtrés en backend)"
                    ranking_score:
                      type: number
                      description: "Score ranking marketplace (plus haut = mieux)"
                    risk_score:
                      type: integer
                      minimum: 0
                      maximum: 100
                      description: "Risk score (0=meilleur)"
                    sectors:
                      type: array
                      items:
                        type: string
                    corridors:
                      type: array
                      items:
                        type: object
                        properties:
                          origin_country: { type: string }
                          host_country: { type: string }
                    agency_profile_summary:
                      type: object
                      properties:
                        description: { type: string }
                        years_experience: { type: integer }
                        active_missions_count: { type: integer }
              pagination:
                type: object
                properties:
                  total: { type: integer }
                  page: { type: integer }
                  limit: { type: integer }
                  has_next: { type: boolean }

    403:
      description: "Rôle non autorisé (worker, consultant)"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    401:
      description: Token manquant ou invalide

  backend_rules:
    - "Filtre obligatoire backend: marketplace_access.status = 'active' — les agences suspendues ne sont JAMAIS retournées même si passées en paramètre"
    - "Filtre obligatoire backend: certification_level ∈ [controlled, verified, certified] — 'none' exclu"
    - "Tri par défaut: ranking_score DESC"
    - "RLS: endpoint accessible cross-tenant (catalogue public aux acteurs certifiés) mais pas cross-platform"

  events_outbox: []
  source: "6.8 ligne 138, SECTION 10.E E2E-10, 6.8 ligne 152 DoD"
```

---

## 2) POST /v1/leads/{lead_id}/activities

### Justification

La table `lead_activities` existe dans le schéma DB `2.9 section 2.9.3` (CRM & Prospection) mais aucun endpoint CRUD n'est défini dans `2.11 LOCKED` ni `2.11.a`.

**Source DB** : `2.9 §2.9.3 — table lead_activities`

### Contrat — POST (création d'activité)

```yaml
POST /v1/leads/{lead_id}/activities:
  summary: Enregistrer une activité sur un lead (appel, email, réunion, note)
  tags: [CRM — M2]
  lot: 4

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
    denied:
      - client_user   # 403
      - worker        # 403
      - consultant    # 403 (consultant = lecture seule CRM)
    source: "2.12 LOCKED §M2 CRM"

  parameters:
    - name: lead_id
      in: path
      required: true
      schema:
        type: string
        format: uuid

  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          required: [activity_type, occurred_at]
          properties:
            activity_type:
              type: string
              enum: [call, email, meeting, note, demo, proposal_sent, follow_up]
            occurred_at:
              type: string
              format: date-time
            duration_minutes:
              type: integer
              description: "Durée (pour appel/réunion)"
            outcome:
              type: string
              enum: [positive, neutral, negative, no_answer]
            notes:
              type: string
              maxLength: 2000
            next_action_date:
              type: string
              format: date

  responses:
    201:
      description: Activité créée
      content:
        application/json:
          schema:
            type: object
            properties:
              id: { type: string, format: uuid }
              lead_id: { type: string, format: uuid }
              activity_type: { type: string }
              occurred_at: { type: string, format: date-time }
              created_by: { type: string, format: uuid }
              created_at: { type: string, format: date-time }

    404:
      description: Lead non trouvé ou cross-tenant (RLS)
    403:
      description: Rôle non autorisé

  events_outbox:
    - name: LeadActivityCreated
      note: "Event CANDIDAT V1 — à valider si nécessaire pour intégrations futures"

  source: "2.9 §2.9.3 table lead_activities (DB existante), audit fonctionnel 2026-02-22"
```

### Contrat — GET (liste des activités)

```yaml
GET /v1/leads/{lead_id}/activities:
  summary: Récupérer l'historique des activités d'un lead
  tags: [CRM — M2]
  lot: 4

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
      - consultant    # lecture CRM autorisée
    denied:
      - client_user   # 403
      - worker        # 403

  parameters:
    - name: lead_id
      in: path
      required: true
    - name: activity_type
      in: query
      required: false
      schema:
        type: string
    - name: from_date
      in: query
      required: false
      schema:
        type: string
        format: date
    - name: page
      in: query
      default: 1
    - name: limit
      in: query
      default: 20
      maximum: 100

  responses:
    200:
      description: Liste des activités
      content:
        application/json:
          schema:
            type: object
            properties:
              data:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: string, format: uuid }
                    activity_type: { type: string }
                    occurred_at: { type: string, format: date-time }
                    outcome: { type: string, nullable: true }
                    notes: { type: string, nullable: true }
                    next_action_date: { type: string, format: date, nullable: true }
                    created_by: { type: string, format: uuid }
                    created_at: { type: string, format: date-time }
              pagination:
                $ref: '#/components/schemas/Pagination'
    404:
      description: Lead non trouvé ou cross-tenant

  source: "2.9 §2.9.3 table lead_activities"
```

---

## 3) POST /v1/compliance-cases/{id}:export-dossier

### Justification

- `SECTION 6 — Checklist Globale 6.0 ligne 113` : "Export dossier 'inspection-ready' (PDF) fonctionnel" — livrable obligatoire V1
- Absent de `2.11 LOCKED` et `2.11.a V1.2.2`
- Pattern async (202 + polling) recommandé (génération PDF potentiellement longue)
- Table `compliance_exports` à créer (voir `CDC_COMPLETIONS_FROM_AUDIT.md` section DB)

### Contrat — POST (déclenchement export)

```yaml
POST /v1/compliance-cases/{compliance_case_id}:export-dossier:
  summary: Déclencher la génération asynchrone d'un export dossier inspection-ready (PDF)
  tags: [Compliance — M8]
  lot: 7

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
    denied:
      - client_user   # 403 — portail client ne peut pas exporter
      - worker        # 403
      - consultant    # 403
    source: "2.12.a V1.2.2 §M8 Compliance"

  parameters:
    - name: compliance_case_id
      in: path
      required: true
      schema:
        type: string
        format: uuid

  requestBody:
    required: false
    content:
      application/json:
        schema:
          type: object
          properties:
            format:
              type: string
              enum: [pdf]
              default: pdf
            include_sections:
              type: array
              items:
                type: string
                enum:
                  - remuneration_snapshot
                  - a1_tracking
                  - compliance_documents
                  - enforcement_history
                  - compliance_score_timeline
                  - equal_treatment_check
                  - sipsi_declaration
              description: "Sections à inclure. Si absent: toutes les sections disponibles."

  responses:
    202:
      description: Export déclenché, traitement en cours
      content:
        application/json:
          schema:
            type: object
            properties:
              export_id:
                type: string
                format: uuid
              status:
                type: string
                enum: [pending]
              poll_url:
                type: string
                description: "URL de polling: GET /v1/compliance-cases/{id}/exports/{export_id}"
              estimated_ready_at:
                type: string
                format: date-time
                nullable: true

    404:
      description: Compliance case non trouvé ou cross-tenant
    403:
      description: Rôle non autorisé

  events_outbox:
    - name: ComplianceDossierExportRequested
      ref: "PATCH_EVENTS_2.10.4.11 §D"

  backend_rules:
    - "Job asynchrone : n8n workflow ou Node.js worker job"
    - "Contenu PDF : snapshot rémunération + A1 + documents vigilance + enforcement flags history + compliance score"
    - "Stockage : Supabase Storage, chemin sécurisé par tenant_id"
    - "Expiration URL : signed URL 1h"
```

### Contrat — GET (polling statut)

```yaml
GET /v1/compliance-cases/{compliance_case_id}/exports/{export_id}:
  summary: Vérifier le statut d'un export en cours ou récupérer le lien de téléchargement
  tags: [Compliance — M8]
  lot: 7

  rbac:
    allowed_roles: [tenant_admin, agency_user]
    denied: [client_user, worker, consultant]

  responses:
    200:
      description: Statut de l'export
      content:
        application/json:
          schema:
            type: object
            properties:
              export_id: { type: string, format: uuid }
              status:
                type: string
                enum: [pending, processing, ready, failed]
              download_url:
                type: string
                description: "Signed URL Supabase Storage. Présent uniquement si status=ready"
                nullable: true
              download_expires_at:
                type: string
                format: date-time
                nullable: true
              error_message:
                type: string
                nullable: true
                description: "Présent uniquement si status=failed"
              requested_at: { type: string, format: date-time }
              completed_at: { type: string, format: date-time, nullable: true }

    404:
      description: Export non trouvé ou cross-tenant

  events_outbox:
    - name: ComplianceDossierExportCompleted
      trigger: "Quand status passe à ready"
      ref: "PATCH_EVENTS_2.10.4.11 §D"
```

---

## 4) GET /v1/compliance-cases/{id}/compliance-score

### Justification

M8 calcule un `compliance_score` (event `ComplianceScoreCalculated` en 2.10.4.7). M12 le consomme pour le risk score. Mais aucun endpoint GET dédié n'existe pour permettre à un frontend ou consommateur externe de lire ce score.

### Contrat

```yaml
GET /v1/compliance-cases/{compliance_case_id}/compliance-score:
  summary: Récupérer le score de conformité calculé pour un compliance case
  tags: [Compliance — M8]
  lot: 7

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
    denied:
      - client_user   # 403
      - worker        # 403
    source: "2.12 LOCKED §M8 — compliance_score en lecture pour tenant staff"

  responses:
    200:
      description: Score de conformité actuel
      content:
        application/json:
          schema:
            type: object
            properties:
              compliance_case_id:
                type: string
                format: uuid
              score:
                type: number
                minimum: 0
                maximum: 100
                description: "Score conformité (100=parfaitement conforme)"
              score_breakdown:
                type: object
                description: "Détail du score par dimension"
                properties:
                  remuneration_score: { type: number }
                  documents_score: { type: number }
                  duration_score: { type: number }
                  a1_score: { type: number }
              last_calculated_at:
                type: string
                format: date-time
              alerts:
                type: array
                items:
                  type: object
                  properties:
                    level: { type: string, enum: [warning, critical] }
                    code: { type: string }
                    message: { type: string }

    404:
      description: Compliance case non trouvé

  events_outbox: []
  source: "2.10.4.7 event ComplianceScoreCalculated, audit fonctionnel 2026-02-22"
```

---

---

## 5) POST + GET /v1/compliance-cases/{id}/equal-treatment-check

### Justification

Référencé dans :
- `CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1` : endpoints equal-treatment définis mais absents de ce patch
- `6.9 — CHECKLIST — LOT 7 BIS IA (EGALITE DE TRAITEMENT)` : GWT sur POST check + GET dernier check
- `PATCH_DB_2.9.16-G §Table A equal_treatment_checks` : table DB créée, endpoint requis
- Directive 2018/957/UE Art. 3 §1bis : obligation légale de traçabilité V1

Absent de `2.11 LOCKED`, `2.11.a V1.2.2`, et des sections 1-4 de ce patch.

### Contrat — POST (création snapshot immuable)

```yaml
POST /v1/compliance-cases/{compliance_case_id}/equal-treatment-check:
  summary: Créer un check égalité de traitement (snapshot immuable Directive 2018/957/UE)
  tags: [Compliance — M8]
  lot: 7

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
    denied:
      - client_user   # 403
      - worker        # 403 (lecture own via GET uniquement)
      - consultant    # 403
    source: "PATCH_DB_2.9.16-G rls_etc_tenant_staff + CDC_COMPLETIONS §C1"

  parameters:
    - name: compliance_case_id
      in: path
      required: true
      schema:
        type: string
        format: uuid

  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          required: [host_country_reference_wage, reference_period_type]
          properties:
            host_country_reference_wage:
              type: number
              description: "Salaire de référence pays hôte (saisie manuelle V1 — V2: API externe)"
            reference_period_type:
              type: string
              enum: [hourly, monthly]
            working_time_compliant:
              type: boolean
              nullable: true
            paid_leave_compliant:
              type: boolean
              nullable: true
            health_safety_compliant:
              type: boolean
              nullable: true
            accommodation_compliant:
              type: boolean
              nullable: true
            allowances_treatment_type:
              type: string
              enum: [wage, reimbursement, mixed]
              nullable: true
            notes:
              type: string
              maxLength: 4000

  responses:
    201:
      description: Check créé (snapshot immuable)
      content:
        application/json:
          schema:
            type: object
            properties:
              id:
                type: string
                format: uuid
              compliance_case_id:
                type: string
                format: uuid
              is_compliant:
                type: boolean
                nullable: true
              gap_amount:
                type: number
                description: "worker_eligible_wage - host_country_reference_wage (négatif = non conforme)"
                nullable: true
              gap_percentage:
                type: number
                nullable: true
              engine_version:
                type: string
                example: "etreq-1.0"
              created_at:
                type: string
                format: date-time

    404:
      description: Compliance case non trouvée ou cross-tenant (RLS)
    403:
      description: Rôle non autorisé

  events_outbox:
    - name: EqualTreatmentCheckCreated
      ref: "PATCH_EVENTS_2.10.4.11 §E"
      trigger: "À chaque POST"
    - name: EqualTreatmentViolationDetected
      ref: "PATCH_EVENTS_2.10.4.11 §E"
      trigger: "Si is_compliant = false"

  backend_rules:
    - "Calculer worker_eligible_wage depuis le dernier worker_remuneration_snapshot du case"
    - "is_compliant = (worker_eligible_wage >= host_country_reference_wage)"
    - "gap_amount = worker_eligible_wage - host_country_reference_wage"
    - "Snapshot immuable : pas de updated_at, pas de DELETE"
    - "Double check sur même compliance_case_id : autorisé (audit trail complet)"

  source: "CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1, 6.9 Checklist, PATCH_DB_2.9.16-G §A"
```

### Contrat — GET (lecture dernier check)

```yaml
GET /v1/compliance-cases/{compliance_case_id}/equal-treatment-check:
  summary: Récupérer le dernier check égalité de traitement (plus récent par created_at)
  tags: [Compliance — M8]
  lot: 7

  rbac:
    allowed_roles:
      - tenant_admin
      - agency_user
      - worker    # lecture own uniquement (via rls_etc_worker_read)
    denied:
      - client_user   # 403
      - consultant    # 403
    source: "PATCH_DB_2.9.16-G rls_etc_worker_read + rls_etc_tenant_staff"

  parameters:
    - name: compliance_case_id
      in: path
      required: true
      schema:
        type: string
        format: uuid

  responses:
    200:
      description: Dernier check égalité de traitement
      content:
        application/json:
          schema:
            type: object
            properties:
              id: { type: string, format: uuid }
              compliance_case_id: { type: string, format: uuid }
              check_date: { type: string, format: date }
              host_country: { type: string }
              host_country_reference_wage: { type: number }
              reference_period_type: { type: string }
              worker_eligible_wage: { type: number, nullable: true }
              is_compliant: { type: boolean, nullable: true }
              gap_amount: { type: number, nullable: true }
              gap_percentage: { type: number, nullable: true }
              working_time_compliant: { type: boolean, nullable: true }
              paid_leave_compliant: { type: boolean, nullable: true }
              health_safety_compliant: { type: boolean, nullable: true }
              accommodation_compliant: { type: boolean, nullable: true }
              notes: { type: string, nullable: true }
              engine_version: { type: string }
              created_at: { type: string, format: date-time }

    404:
      description: Aucun check créé pour ce case, ou case non trouvé/cross-tenant

  events_outbox: []
  source: "CDC_COMPLETIONS_FROM_AUDIT.md §COMPLÉMENT 1, PATCH_DB_2.9.16-G §A"
```

---

## Résumé des ajouts V1.3

| Endpoint | Méthode | Module | Bloqué par | Statut avant | Statut après |
|---|---|---|---|---|---|
| `/v1/marketplace/agencies` | GET | M11 | Aucune DB manquante | ❌ Absent 2.11+2.11.a | ✅ |
| `/v1/leads/{id}/activities` | POST | M2 | DB table existante | ❌ Absent 2.11+2.11.a | ✅ |
| `/v1/leads/{id}/activities` | GET | M2 | DB table existante | ❌ Absent 2.11+2.11.a | ✅ |
| `/v1/compliance-cases/{id}:export-dossier` | POST | M8 | DB `compliance_exports` à créer | ❌ Absent | ✅ |
| `/v1/compliance-cases/{id}/exports/{export_id}` | GET | M8 | DB `compliance_exports` à créer | ❌ Absent | ✅ |
| `/v1/compliance-cases/{id}/compliance-score` | GET | M8 | Aucune (données existent) | ❌ Absent | ✅ |
| `/v1/compliance-cases/{id}/equal-treatment-check` | POST | M8 | DB `equal_treatment_checks` (2.9.16-G) | ❌ Absent | ✅ |
| `/v1/compliance-cases/{id}/equal-treatment-check` | GET | M8 | DB `equal_treatment_checks` (2.9.16-G) | ❌ Absent | ✅ |

---

## Checklist de validation (DB ↔ OpenAPI ↔ Events ↔ RBAC ↔ E2E)

| Critère | marketplace/agencies | leads/activities | export-dossier | compliance-score | equal-treatment-check |
|---|---|---|---|---|---|
| **DB** | ✅ Données existantes | ✅ `lead_activities` 2.9.3 | ✅ `compliance_exports` 2.9.16-G | ✅ Données calculées | ✅ `equal_treatment_checks` 2.9.16-G |
| **OpenAPI** | ✅ Ce patch §1 | ✅ Ce patch §2 | ✅ Ce patch §3 | ✅ Ce patch §4 | ✅ Ce patch §5 |
| **Events** | N/A | CANDIDAT `LeadActivityCreated` | ✅ 2.10.4.11 §D | N/A | ✅ 2.10.4.11 §E |
| **RBAC** | ✅ Défini | ✅ Défini | ✅ Défini | ✅ Défini | ✅ Défini |
| **E2E** | ✅ E2E-10 | ⚠️ Pas de scénario E2E dédié | ✅ E2E-13 | ⚠️ Couvert implicitement E2E-01/02 | ⚠️ Couvert 6.9 GWT (pas E2E dédié V1) |

---

## Notes de traçabilité

- Ce patch ne modifie pas `2.11 LOCKED` ni `2.11.a V1.2.2`.
- Il fait autorité pour les endpoints listés ci-dessus jusqu'à intégration dans une révision LOCKED.
- La table `compliance_exports` est créée via `PATCH_DB_2.9.16-G §Table B`.
- La table `equal_treatment_checks` est créée via `PATCH_DB_2.9.16-G §Table A`.

## Mini-changelog

- 2026-02-22 : Création V1.3. 4 surfaces manquantes ajoutées : marketplace listing, lead activities CRUD, export dossier async, compliance score read. Sources : E2E-10, Checklist 6.0 ligne 113, DB 2.9.3, audit 2026-02-22.
- 2026-02-22 : V1.3.1 — Ajout §5 : POST + GET `/v1/compliance-cases/{id}/equal-treatment-check`. Résout gap détecté (endpoints définis dans CDC_COMPLETIONS §C1 mais absents du patch OpenAPI). Sources : PATCH_DB_2.9.16-G §A, 6.9 Checklist, CDC_COMPLETIONS_FROM_AUDIT §C1.
