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
5. Search API integration (public mode): `PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION.md`

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

`request` doit exposer au minimum:
1. `siren`, `siret` (contexte de la demande).

`company` doit exposer au minimum:
1. `legal_name`, `siren`.
2. bloc adresse normalisée.
3. `naf_code`, `naf_label` si disponible.
4. `legal_form`, `creation_date`.
5. `registry_name`, `rcs_city`.
6. `updated_at`.

Blocs enrichissement Search API (optionnels):
1. `company.finances` (objet annuel `year -> {ca, resultat_net}`) si disponible.
2. `company.complements` (flags/labels open data) si disponible.
3. L’absence de `company.finances` ou `company.complements` n’implique pas un échec si `core_identity` est présente (référence `M3A` section `D`).
4. Règle snapshot -> projection:
- `company.finances` et `company.complements` MUST être dérivés du snapshot `company_documents` `ENTERPRISE_SEARCH` le plus récent selon `retrieved_at`.
- l’unicité des payloads par `checksum` est garantie par la contrainte DB.
- aucune agrégation inter-snapshots n’est autorisée.
- si snapshot absent, omettre le bloc (ne pas dégrader `core_identity`).

#### `404 not_found`

Cas:
1. demande absente ou hors périmètre tenant.

---

## Mapping Table: DB ↔ API ↔ UI (maître)

Référence:
1. Schéma source de vérité: `PATCH_M3A_DB_DATA_CONTRACTS.md`.
2. Cette table verrouille les noms de champs et chemins JSON exposés au frontend.

| Canonical field (M3A) | DB column name | API JSON path | UI label / component | Nullability (must/should/may) | Example value |
|---|---|---|---|---|---|
| `siren` | `companies.siren` | `company.siren` | `CompanyCard.Identity.SIREN` | must | `123456789` |
| `siret` | `requests.siret` | `request.siret` | `CompanyCard.Identity.SIRET` | should | `12345678900012` |
| `company_siren` | `requests.company_siren` | `request.company_siren` | `RequestMeta.CompanyLink` | must | `123456789` |
| `legal_name` | `companies.legal_name` | `company.legal_name` | `CompanyCard.Header.LegalName` | must | `OMNI TRAVAUX SAS` |
| `trade_name` | `companies.trade_name` | `company.trade_name` | `CompanyCard.Header.TradeName` | may | `OMNI TRAVAUX` |
| `brand_name` | `companies.brand_name` | `company.brand_name` | `CompanyCard.Header.BrandName` | may | `OMNI` |
| `legal_form` | `companies.legal_form` | `company.legal_form` | `CompanyCard.Identity.LegalForm` | should | `SAS` |
| `creation_date` | `companies.creation_date` | `company.creation_date` | `CompanyCard.Identity.CreationDate` | should | `2019-01-10` |
| `active_status` | `companies.active_status` | `company.active_status` | `CompanyCard.Identity.ActiveStatus` | should | `A` |
| `address_line1` | `companies.address_line1` | `company.address.line1` | `CompanyCard.Address.Line1` | must | `10 RUE EXEMPLE` |
| `postal_code` | `companies.postal_code` | `company.address.postal_code` | `CompanyCard.Address.PostalCode` | should | `75001` |
| `city` | `companies.city` | `company.address.city` | `CompanyCard.Address.City` | should | `PARIS` |
| `country_code` | `companies.country_code` | `company.address.country_code` | `CompanyCard.Address.Country` | should | `FR` |
| `naf_code` | `companies.naf_code` | `company.naf_code` | `CompanyCard.Activity.NAFCode` | should | `43.99C` |
| `naf_label` | `companies.naf_label` | `company.naf_label` | `CompanyCard.Activity.NAFLabel` | may | `Travaux de maçonnerie` |
| `headcount_range` | `companies.headcount_range` | `company.headcount_range` | `CompanyCard.Activity.HeadcountRange` | may | `10-19` |
| `rcs_city` | `companies.rcs_city` | `company.registry.city` | `CompanyCard.Registry.City` | may | `PARIS` |
| `registry_name` | `companies.registry_name` | `company.registry.name` | `CompanyCard.Registry.Name` | may | `RCS` |
| `finances_snapshot` | `company_documents.payload_json` (`doc_type=ENTERPRISE_SEARCH`) | `company.finances` | `CompanyCard.Finance.Finances` | may | `{ \"2024\": { \"ca\": 1200000, \"resultat_net\": 95000 } }` |
| `complements_snapshot` | `company_documents.payload_json` (`doc_type=ENTERPRISE_SEARCH`) | `company.complements` | `CompanyCard.Compliance.Complements` | may | `{ \"est_ess\": false, \"est_rge\": true }` |
| `updated_at` | `companies.updated_at` | `company.updated_at` | `CompanyCard.Meta.UpdatedAt` | must | `2026-02-23T10:15:00Z` |
| `enrichment_status` | `requests.enrichment_status` | `request.enrichment_status` | `CompanyCard.Meta.StatusBadge` | must | `PARTIAL` |
| `enrichment_last_run_at` | `requests.enrichment_last_run_at` | `request.enrichment_last_run_at` | `CompanyCard.Meta.LastRunAt` | should | `2026-02-23T10:14:00Z` |
| `enrichment_error` | `requests.enrichment_error` | `request.enrichment_error` | `CompanyCard.Meta.ErrorPanel` | may | `INPI_RNE:503:TIMEOUT` |

Note sémantique identitaire:
1. `company.brand_name` peut contenir le `sigle` légal Search API en fallback; ce champ n’est pas une enseigne stricte.

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

Option A — rendu identifiants Company Card:
1. afficher `SIREN` depuis `company.siren`.
2. afficher `SIRET` depuis `request.siret`.
3. si `request.siret` est null: masquer le champ ou afficher `non fourni`.

Disponibilité des blocs Search API:
1. `finances` et `complements` proviennent de l’agrégation open-data Search API.
2. Ces blocs peuvent être absents selon la disponibilité amont, sans invalider `SUCCESS` si `core_identity` est satisfaite.

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
10. La table maître `DB↔API↔UI` est utilisée comme mapping unique au build.
11. Option A est appliquée: `SIREN` lu depuis `company.siren`, `SIRET` lu depuis `request.siret`.
12. Les blocs `company.finances`/`company.complements` sont explicitement optionnels et alignés avec `M3A`.
13. La projection `company.finances`/`company.complements` suit strictement la règle `last snapshot only` (`ENTERPRISE_SEARCH`).

---

## Changelog patch

- 2026-02-23: Création du patch `M3B` (split contractuel du patch M3 unifié).
- 2026-02-23: Verrouillage Option A (`SIRET` contextuel à la demande, `SIREN` consolidé côté company).
- 2026-02-23: Ajout du contrat optionnel `finances`/`complements` (Search API) sans impact sur `core_identity`.
- 2026-02-23: Hardening doc-only: règle snapshot->projection (`last snapshot only`) + clarification `sigle` fallback.
