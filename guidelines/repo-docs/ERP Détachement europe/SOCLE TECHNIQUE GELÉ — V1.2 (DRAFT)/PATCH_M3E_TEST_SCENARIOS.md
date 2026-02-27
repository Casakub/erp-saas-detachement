# PATCH M3E — Test Scenarios (Doc-only, Gherkin-like)

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: scénarios de validation documentaire pré-build

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB source of truth: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. API: `PATCH_M3B_OPENAPI_API_SURFACE.md`
4. Events/Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`
5. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`

---

## Assumptions

1. Les scénarios sont non exécutables en l’état; ils servent de base de tests d’implémentation.
2. Les enums attendus sont ceux de `M3A` section `C`.
3. Les statuts acceptés sont `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE`.
4. En cas de conflit de critères, `M3A` prime.

---

## Scénarios (12)

### S01 — Missing identifier

Given un utilisateur envoie `POST /v1/requests` sans `siren` ni `siret`  
When l’API valide la requête  
Then la réponse est `400 validation_error` avec `code=MISSING_COMPANY_IDENTIFIER`

### S02 — Invalid SIREN format

Given `siren=12345`  
When `POST /v1/requests` est appelé  
Then la réponse est `400 validation_error` avec `code=INVALID_SIREN_FORMAT`

### S03 — Invalid SIRET format

Given `siret=1234567890123`  
When `POST /v1/requests` est appelé  
Then la réponse est `400 validation_error` avec `code=INVALID_SIRET_FORMAT`

### S04 — SIREN/SIRET mismatch

Given `siren=123456789` et `siret=98765432100012`  
When `POST /v1/requests` est appelé  
Then la réponse est `422 business_rule_failed` avec `code=SIREN_SIRET_MISMATCH`

### S05 — Cache hit (fresh data)

Given une société existe avec `updated_at` < 30 jours  
When `GET /v1/requests/{id}` est appelé  
Then la réponse retourne le snapshot sans appel source et `enrichment_running=false`

### S06 — Full success enrichment

Given une nouvelle demande valide avec `siret`  
When le job M3 interroge les 3 sources sans erreur  
Then le statut final est `SUCCESS` et les minimum success fields de `M3A` sont présents

### S07 — Partial due to rate limit

Given la source `API_ENTREPRISE_RCS` retourne `429`  
When les autres sources réussissent  
Then le statut final est `PARTIAL` avec `error_code=RATE_LIMIT` dans `enrichment_error`

### S08 — Full failure

Given les 3 sources échouent sans `core_identity` exploitable  
When le job M3 se termine  
Then le statut final est `FAILED` avec `enrichment_error` non vide

### S09 — Stale refresh path

Given une société existe avec snapshot mais `updated_at` > 30 jours  
When `GET /v1/requests/{id}` est appelé  
Then `enrichment_status=STALE` puis transition vers `RUNNING` sur refresh

### S10 — Lock contention

Given deux demandes simultanées pour le même `siren`  
When les jobs démarrent  
Then un seul lock `company_enrichment:{siren}` est acquis et aucun job doublon n’est lancé

### S11 — Manual refresh cooldown

Given un refresh manuel vient d’être lancé récemment  
When `POST /v1/requests/{id}:refresh-company` est rappelé pendant cooldown  
Then la réponse est `409 conflict`

### S12 — Observability contract

Given un appel source échoue en timeout  
When l’orchestrateur journalise l’erreur  
Then les logs contiennent au minimum `request_id`, `company_siren`, `source_api`, `http_status`, `correlation_id`, `timestamp`

---

## Matrice de couverture rapide

| Scénario | Surface principale | Résultat attendu |
|---|---|---|
| S01-S04 | Validation API | `400/422` + codes canoniques |
| S05 | Cache/TTL | réponse cache sans fetch |
| S06 | Enrichment nominal | `SUCCESS` |
| S07 | Défaillance partielle | `PARTIAL` |
| S08 | Défaillance totale | `FAILED` |
| S09 | Staleness | `STALE -> RUNNING` |
| S10 | Concurrence | lock unique |
| S11 | Protection relance | `409` |
| S12 | Observabilité | logs obligatoires complets |

---

## Doc Consistency Checklist

1. Les 12 scénarios utilisent les enums canoniques de `M3A`.
2. Les scénarios API utilisent uniquement les routes définies en `M3B`.
3. Les scénarios de transitions respectent la machine d’états de `M3C`.
4. Les scénarios sécurité/RBAC restent compatibles `M3D`.
5. Les scénarios lock/TTL reprennent les valeurs de `M3C`.
6. Les codes d’erreur mentionnés existent dans `M3A`.
7. Le scénario S12 vérifie explicitement le contrat d’observabilité.
8. Aucun scénario ne contredit la règle `M3A source of truth`.

---

## Changelog patch

- 2026-02-23: Création du patch `M3E` (suite QA documentaire optionnelle M3).
