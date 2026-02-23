# PATCH M3B — OpenAPI / API Surface (Requests + Company Card)

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: contrats HTTP `/v1` pour création demande et restitution enrichissement

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. Events/Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`
4. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`

---

## Assumptions

1. Les routes sont tenant-scoped via JWT.
2. Les appels externes sont backend-only et jamais exposés au frontend.
3. Les réponses peuvent être `201` ou `202` à la création selon latence enrichissement.
4. Le frontend gère auto-refresh quand `enrichment_running = true`.

### Référence canonique obligatoire

1. Enums M3 (`enrichment_status`, `source_api`, `error_code`) référencés depuis:
- `PATCH_M3A_DB_DATA_CONTRACTS.md` section `C) Canonical enums`.
2. Champs minimum `SUCCESS`/`PARTIAL` référencés depuis:
- `PATCH_M3A_DB_DATA_CONTRACTS.md` section `D) Minimum Success Fields`.

---

## Contrat endpoint 1 — `POST /v1/requests`

### Summary

Créer une demande client avec identifiant entreprise obligatoire et démarrer l’enrichissement.

### Headers

1. `Authorization: Bearer <jwt>` requis.
2. `Idempotency-Key` recommandé pour éviter doublons client.
3. `X-Correlation-Id` optionnel; sinon généré serveur.

### Request body

| Champ | Type | Requis | Règle |
|---|---|---|---|
| `siren` | string | conditionnel | exactement 9 chiffres si fourni |
| `siret` | string | conditionnel | exactement 14 chiffres si fourni |
| `metadata` | object | non | données métiers complémentaires |

Règles:
1. au moins un champ entre `siren` et `siret`.
2. si `siret` fourni, `siren` est dérivé des 9 premiers chiffres.
3. si `siren` et `siret` fournis, ils doivent correspondre.

### Réponses

#### `201 created` ou `202 accepted`

| Champ | Type | Description |
|---|---|---|
| `request.id` | uuid | identifiant demande |
| `request.created_at` | datetime | horodatage création |
| `request.siren` | string | normalisé |
| `request.siret` | string/null | normalisé |
| `request.company_siren` | string | clé de rattachement entreprise (PK `companies.siren`) |
| `request.enrichment_status` | enum | valeurs canoniques M3A, initialement `PENDING` |
| `request.enrichment_last_run_at` | datetime/null | null à la création |
| `request.enrichment_error` | string/null | null à la création |
| `company` | object/null | présent si enrichissement déjà disponible |
| `enrichment_running` | boolean | true si job en cours |

### Invariants data contract (PK/UK)

Règles de cohérence API vers DB:
1. `request.siren` mappe `requests.siren` (M3A).
2. `request.siret` mappe `requests.siret` (M3A).
3. `request.company_siren` mappe `requests.company_siren` et référence `companies.siren` (PK M3A).
4. `source_retrievals[*].source_api` mappe l’unique `(company_siren, source_api)` (UK M3A).
5. `documents[*]` mappe les snapshots dédupliqués par `(company_siren, doc_type, checksum)` (UK M3A).

#### `400 validation_error`

Cas:
1. `siren` mauvais format.
2. `siret` mauvais format.
3. aucun identifiant fourni.

#### `422 business_rule_failed`

Cas:
1. mismatch entre `siren` et préfixe `siret`.

---

## Contrat endpoint 2 — `GET /v1/requests/{request_id}`

### Summary

Retourner le détail demande et la Company Card consolidée.

### Réponses

#### `200 ok`

| Champ | Type | Description |
|---|---|---|
| `request` | object | détail demande et statut enrichissement |
| `company` | object/null | snapshot consolidé `companies` |
| `documents` | array | artefacts source disponibles |
| `source_retrievals` | array | derniers statuts par source (enum `source_api` canonique M3A) |
| `enrichment_running` | boolean | état de job |

`company` doit exposer au minimum:
1. `legal_name`, `siren`, `siret`.
2. bloc adresse normalisée.
3. `naf_code`, `naf_label` si disponible.
4. `legal_form`, `creation_date`.
5. `registry_name`, `rcs_city`.
6. `updated_at`.

#### `404 not_found`

Cas:
1. demande absente ou hors périmètre tenant.

---

## Contrat endpoint 3 — `POST /v1/requests/{request_id}:refresh-company`

### Summary

Forcer une relance d’enrichissement pour demande existante.

### Réponses

1. `202 accepted`:
- enrichissement relancé ou déjà en cours.

2. `404 not_found`:
- demande inexistante ou hors tenant.

3. `409 conflict`:
- relance refusée par cooldown anti-spam.

---

## Contrat erreurs API (format)

Format commun:

```json
{
  "error": "validation_error",
  "code": "INVALID_SIRET_FORMAT",
  "message": "Le SIRET doit contenir exactement 14 chiffres.",
  "details": [
    {
      "field": "siret",
      "reason": "expected_14_digits"
    }
  ],
  "correlation_id": "uuid-or-header-value",
  "request_id": "uuid-or-null",
  "timestamp": "ISO8601"
}
```

Codes fonctionnels minimaux:
1. `MISSING_COMPANY_IDENTIFIER`
2. `INVALID_SIREN_FORMAT`
3. `INVALID_SIRET_FORMAT`
4. `SIREN_SIRET_MISMATCH`
5. `AUTH_ERROR`
6. `NOT_FOUND`
7. `RATE_LIMIT`
8. `TIMEOUT`
9. `UPSTREAM_5XX`
10. `SOURCE_UNAVAILABLE`
11. `INTERNAL_ERROR`

---

## Contrat UI (consommation API)

État frontend piloté par `request.enrichment_status` et `enrichment_running`:
1. `PENDING` + running false: demande créée, attente démarrage job.
2. `RUNNING` + running true: skeleton + auto-refresh.
3. `SUCCESS` + running false: Company Card complète.
4. `PARTIAL` + running false: données partielles + message source indisponible.
5. `FAILED` + running false: erreur claire + action relance.
6. `STALE` + running false/true: afficher badge stale, conserver snapshot et déclencher refresh.

Staleness UI:
1. TTL de fraîcheur aligné sur `M3C`: 30 jours.
2. Si stale détecté, l’UI doit afficher explicitement la date `updated_at`.

Auto-refresh recommandé:
1. polling 2s pendant 20s.
2. puis polling 5s pendant 40s.
3. puis arrêt et message d’action manuelle.

---

## Synchronisation inter-docs (M3)

1. Les noms de champs doivent refléter `M3A`.
2. Les enums doivent être repris de `M3A` sans redéfinition locale.
3. Les transitions de statuts doivent refléter `M3C`.
4. Le TTL de staleness doit refléter `M3C`.
5. Les permissions endpoint doivent refléter `M3D`.

---

## Doc Consistency Checklist

1. Tous les endpoints M3 sont en `/v1`.
2. Les règles de validation `siren/siret` matchent `M3A`.
3. Les statuts enrichissement `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE` matchent `M3A` et `M3C`.
4. Le format d’erreur est unique et documenté.
5. Les `error_code` viennent de la liste canonique `M3A`.
6. `correlation_id` est présent dans toutes les erreurs.
7. Les réponses exposent `enrichment_running` pour l’UI.
8. Les artefacts documentaires sont renvoyés sans payload sensible.
9. Les codes HTTP standard (`400/404/409/422`) sont cohérents.

---

## Changelog patch

- 2026-02-23: Création du patch `M3B` (split contractuel du patch M3 unifié).
