# PATCH M3C — Events / Jobs / Orchestration Contract

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: orchestration enrichissement, outbox events, cache/lock, observabilité

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. API: `PATCH_M3B_OPENAPI_API_SURFACE.md`
4. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`

---

## Assumptions

1. L’architecture outbox V1 reste la mécanique de publication d’events.
2. Le lock distribué peut utiliser Redis ou lock DB; le comportement contractuel reste identique.
3. Les appels source sont faits séquentiellement en priorité `API_RECHERCHE_ENTREPRISES -> INPI_RNE -> API_ENTREPRISE_RCS` pour limiter coût et complexité.
4. Les jobs peuvent être relancés de manière idempotente.

### Référence canonique obligatoire

1. Enums `enrichment_status`, `source_api`, `error_code`:
- `PATCH_M3A_DB_DATA_CONTRACTS.md` section `C) Canonical enums`.
2. Critères minimum `SUCCESS`/`PARTIAL`:
- `PATCH_M3A_DB_DATA_CONTRACTS.md` section `D) Minimum Success Fields`.

---

## Glossary opérationnel

| Terme | Définition |
|---|---|
| `enrichment job` | exécution orchestrée de récupération + merge + persistence |
| `source fetch` | appel vers une source officielle unique |
| `cache freshness window` | période durant laquelle les données `companies` sont réputées fraîches |
| `lock key` | clé d’exclusion mutuelle par siren |
| `partial failure` | au moins une source échoue mais `core_identity` existe |
| `stale snapshot` | snapshot consolidé présent mais TTL expiré |

---

## Event contracts (producer `M3`)

Règle:
1. Tout event est publié via `events_outbox`.
2. `tenant_id`, `correlation_id`, `occurred_at`, `producer=M3` sont obligatoires.

### Event 1 — `CompanyEnrichmentRequested`

Trigger:
1. `POST /v1/requests`
2. `POST /v1/requests/{id}:refresh-company`
3. `GET /v1/requests/{id}` si stale/missing

Payload minimum:
1. `request_id`
2. `company_siren`
3. `company_siret` nullable
4. `trigger` (`REQUEST_CREATED`, `REQUEST_OPENED`, `MANUAL_REFRESH`)

### Event 2 — `CompanyEnrichmentStarted`

Trigger:
1. lock acquis pour `company_siren`.

Payload minimum:
1. `job_id`
2. `company_siren`
3. `attempt`

### Event 3 — `CompanyEnrichmentSourceFetched`

Trigger:
1. fin de chaque call source (`API_RECHERCHE_ENTREPRISES`, `INPI_RNE`, `API_ENTREPRISE_RCS`).

Payload minimum:
1. `job_id`
2. `company_siren`
3. `source_api` (`API_RECHERCHE_ENTREPRISES`, `INPI_RNE`, `API_ENTREPRISE_RCS`)
4. `status` (`SUCCESS` ou `FAILED`)
5. `http_status` nullable
6. `error_code` nullable
7. `duration_ms`

### Event 4 — `CompanyEnrichmentCompleted`

Trigger:
1. fin de job avec persistence.

Payload minimum:
1. `job_id`
2. `company_siren`
3. `enrichment_status` (`SUCCESS`, `PARTIAL`, `FAILED`)
4. `sources_success_count`
5. `sources_failed_count`
6. `core_identity_present` boolean
7. `required_sources_failed_count`
8. `optional_sources_failed_count`

---

## C) State machine — enrichment statuses

États:
1. `PENDING`
2. `RUNNING`
3. `SUCCESS`
4. `PARTIAL`
5. `FAILED`
6. `STALE`

Transitions:

| From | To | Condition |
|---|---|---|
| `PENDING` | `RUNNING` | job démarré et lock acquis |
| `RUNNING` | `SUCCESS` | `core_identity_present=true` et `required_sources_failed_count=0` et `optional_sources_failed_count=0` |
| `RUNNING` | `PARTIAL` | `core_identity_present=true` et `required_sources_failed_count=0` et `optional_sources_failed_count>0` |
| `RUNNING` | `FAILED` | `required_sources_failed_count>0` ou `core_identity_present=false` |
| `SUCCESS` | `STALE` | TTL expiré sur snapshot consolidé |
| `PARTIAL` | `STALE` | TTL expiré sur snapshot partiel |
| `STALE` | `RUNNING` | refresh auto ou manuel déclenché |
| `FAILED` | `RUNNING` | relance manuelle ou auto |
| `PARTIAL` | `RUNNING` | relance manuelle ou auto |

Règle d’évaluation required vs optional sources:
1. `required_sources = [API_RECHERCHE_ENTREPRISES]`.
2. `optional_sources = [INPI_RNE, API_ENTREPRISE_RCS]`.
3. `sources_failed_count = required_sources_failed_count + optional_sources_failed_count`.

Invariants:
1. `RUNNING` implique lock actif pour `company_siren`.
2. `SUCCESS` interdit si `core_identity` absente.
3. `SUCCESS` impose `required_sources_failed_count=0`.
4. `PARTIAL` impose `required_sources_failed_count=0` et `optional_sources_failed_count>0`.
5. `FAILED` implique `required_sources_failed_count>0` ou `core_identity_present=false`.
6. `FAILED` implique `enrichment_error` non vide.
7. `STALE` implique snapshot existant et TTL expiré.

---

## D) Cache / lock policy (précise)

### Cache policy

1. `freshness_ttl_days = 30` par défaut.
2. Si `companies.updated_at` < 30 jours:
- pas d’appel source en création lecture standard.
- réponse immédiate depuis cache.
3. Stale-while-revalidate:
- lecture retourne snapshot courant.
- relance en fond si TTL expiré.
4. Statut stale:
- si TTL expiré et snapshot présent, `enrichment_status = STALE` avant relance.

### Lock policy

1. `lock_key = company_enrichment:{siren}`.
2. lock TTL = 120 secondes.
3. lock heartbeat toutes les 30 secondes si job long.
4. si lock existant:
- ne pas lancer un 2e job.
- attacher la demande au job courant.
5. si lock expiré anormalement:
- autoriser reprise avec `attempt+1`.

### Retry policy

1. timeout source = 5000 ms par défaut.
2. retry max par source = 2.
3. backoff = 250 ms puis 500 ms.
4. erreurs retriables = timeout, `429`, `5xx`.
5. erreurs non retriables = `400`, `401`, `403`, `404`.
6. `error_code` doit utiliser les valeurs canoniques de `M3A`.
7. `NOT_FOUND` sur `API_RECHERCHE_ENTREPRISES` (required source) force l’évaluation finale `FAILED`.

---

## E) Error / observability contract

### Journal applicatif (logs structurés)

Champs obligatoires par log:
1. `timestamp`
2. `level`
3. `correlation_id`
4. `tenant_id`
5. `request_id` nullable
6. `job_id` nullable
7. `company_siren`
8. `source_api` nullable
9. `event_type`
10. `http_status` nullable
11. `error_code` nullable
12. `error_message` nullable
13. `duration_ms` nullable

### Format erreur interne job

```json
{
  "error_code": "TIMEOUT",
  "source_api": "INPI_RNE",
  "http_status": null,
  "message": "request timed out",
  "retryable": true
}
```

### Agrégation `enrichment_error`

Règle:
1. concaténer au format `SOURCE:HTTP:ERROR_CODE`.
2. séparer par `|`.
3. tronquer à une taille safe pour DB (exemple 2000 chars).

Exemple:
1. `INPI_RNE:503:TIMEOUT|API_ENTREPRISE_RCS:429:RATE_LIMIT`.

---

## Pipeline orchestrateur (ordre canonique)

1. Validation identifiants via API layer (`M3B`).
2. Émission `CompanyEnrichmentRequested`.
3. Vérification cache (`M3A`).
4. Acquisition lock par `siren`.
5. Émission `CompanyEnrichmentStarted`.
6. Calls source `API_RECHERCHE_ENTREPRISES -> INPI_RNE -> API_ENTREPRISE_RCS`, avec event `CompanyEnrichmentSourceFetched` à chaque étape.
7. Merge/persistence selon règles `M3A`.
8. Évaluation state machine.
9. Émission `CompanyEnrichmentCompleted`.
10. Mise à jour `requests` liées au `siren`.

---

## Synchronisation inter-docs (M3)

1. Les enums sont ceux de `M3A` section `C` sans redéfinition locale.
2. Les transitions de statut doivent rester compatibles avec `M3B`.
3. Les règles de merge évoquées ici doivent pointer sur `M3A`.
4. Les politiques observabilité/sécurité doivent respecter `M3D`.

---

## Implementation Notes (non-binding)

Décision opérationnelle (post-freeze):
1. `Enrichment runs async by default (job queue), with a short sync attempt (<1200 ms) then fallback to async.`

1. Queue/job runner possibles:
- worker queue dédiée (recommandé),
- cron de rattrapage stale,
- webhook interne déclenché par event outbox.
2. Idempotence recommandée:
- clé `idempotency_key = company_siren + trigger + date_bucket`.
3. Ordre des sources:
- `must`: `API_RECHERCHE_ENTREPRISES` en premier pour identité rapide.
- `should`: `INPI_RNE` puis `API_ENTREPRISE_RCS` pour consolidation légale.
4. Fallback:
- en cas d’échec source unique, poursuivre le pipeline pour viser `PARTIAL`.

---

## Doc Consistency Checklist

1. Les 4 events M3 sont nommés et décrits.
2. La machine d’états inclut transitions et invariants.
3. Les statuts `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE` matchent `M3A` et `M3B`.
4. La politique cache précise TTL, stale behavior et relance.
5. La politique lock précise clé, TTL, comportement concurrent.
6. La politique retry distingue erreurs retriables/non retriables.
7. Le format d’erreur interne est documenté en `json`.
8. Les champs de logs obligatoires sont explicités.
9. Les étapes pipeline pointent vers `M3A`/`M3B`/`M3D` sans contradiction.
10. La section `Implementation Notes (non-binding)` ne crée pas de contrainte contractuelle.
11. Les compteurs `required_sources_failed_count`/`optional_sources_failed_count` sont alignés entre event payload et state machine.

---

## Changelog patch

- 2026-02-23: Création du patch `M3C` (split contractuel du patch M3 unifié).
- 2026-02-23: Ajout required/optional source rules et compteurs dédiés dans `CompanyEnrichmentCompleted`.
