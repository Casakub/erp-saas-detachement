# PATCH M3A — DB & Data Contracts (SIREN/SIRET + Enrichment)

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: schéma de données et règles de normalisation/merge
- **Règle d’autorité**: `If conflict: PATCH_M3A (DB) is the source of truth.`
- **Règle courte**: `If conflict: PATCH_M3A is source of truth.`

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. API: `PATCH_M3B_OPENAPI_API_SURFACE.md`
3. Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`
4. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`

---

## Assumptions

1. La table métier existante est `requests` (ou équivalent strictement mappable).
2. Les types `uuid`, `jsonb`, `timestamptz` sont disponibles.
3. Le backend gère l’idempotence et la concurrence par lock applicatif décrit en `M3C`.
4. Les champs présentés comme `nullable` peuvent être progressivement enrichis.

---

## A) Glossary / définitions

| Terme | Définition contractuelle |
|---|---|
| `siren_raw` | valeur saisie utilisateur sans transformation métier |
| `siret_raw` | valeur saisie utilisateur sans transformation métier |
| `siren` | identifiant normalisé 9 chiffres |
| `siret` | identifiant normalisé 14 chiffres |
| `core_identity` | minimum: `siren + legal_name + (address_line1 ou postal_code ou city)` |
| `enrichment_status` | état canonique `PENDING | RUNNING | SUCCESS | PARTIAL | FAILED | STALE` |
| `document snapshot` | payload brut source stocké dans `company_documents` |
| `source retrieval` | dernier résultat connu par source (`status/http/error/timestamp`) |

---

## Schéma cible (extension 2.9.x)

Migration recommandée: `20260223000007__lot4_m3_company_enrichment.sql`.

### 1) Table `requests` (ajouts)

| Champ | Type | Nullable | Règle |
|---|---|---|---|
| `siren` | `char(9)` | oui | normalisé, dérivable depuis `siret` |
| `siret` | `char(14)` | oui | normalisé |
| `siren_raw` | `text` | oui | entrée brute |
| `siret_raw` | `text` | oui | entrée brute |
| `company_siren` | `char(9)` | oui | FK logique vers `companies.siren` |
| `enrichment_status` | enum | non | valeurs canoniques `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE`, default `PENDING` |
| `enrichment_last_run_at` | `timestamptz` | oui | dernière exécution |
| `enrichment_error` | `text` | oui | erreur agrégée |

Contraintes minimales:
1. `(siren is not null) OR (siret is not null)`.
2. `siren` longueur 9 si non null.
3. `siret` longueur 14 si non null.
4. `company_siren = siren` si `siren` non null.

### 2) Table `companies`

| Champ | Type | Nullable | Règle |
|---|---|---|---|
| `siren` | `char(9)` | non | PK |
| `legal_name` | `text` | oui | raison sociale |
| `trade_name` | `text` | oui | nom commercial |
| `brand_name` | `text` | oui | enseigne/marque |
| `legal_form` | `text` | oui | forme juridique |
| `creation_date` | `date` | oui | date de création |
| `active_status` | `text` | oui | statut activité |
| `address_line1` | `text` | oui | adresse normalisée |
| `address_line2` | `text` | oui | complément |
| `postal_code` | `text` | oui | code postal |
| `city` | `text` | oui | ville |
| `country_code` | `char(2)` | oui | ISO-3166 alpha-2 |
| `naf_code` | `text` | oui | code NAF |
| `naf_label` | `text` | oui | libellé NAF |
| `headcount_range` | `text` | oui | tranche effectif |
| `rcs_city` | `text` | oui | ville de greffe |
| `registry_name` | `text` | oui | nom registre |
| `updated_at` | `timestamptz` | non | date de consolidation |

### 3) Table `company_documents`

| Champ | Type | Nullable | Règle |
|---|---|---|---|
| `id` | `uuid` | non | PK |
| `company_siren` | `char(9)` | non | FK `companies.siren` |
| `doc_type` | enum/text | non | `RCS_EXTRACT`, `RNE_FORMALITY`, `ENTERPRISE_SEARCH` |
| `source_api` | enum/text | non | `API_RECHERCHE_ENTREPRISES`, `INPI_RNE`, `API_ENTREPRISE_RCS` |
| `retrieved_at` | `timestamptz` | non | horodatage récupération |
| `payload_json` | `jsonb` | non | payload brut |
| `checksum` | `text` | non | hash stable du payload |

Index:
1. unique `(company_siren, doc_type, checksum)`.
2. index `(company_siren, retrieved_at desc)`.

### 4) Table `company_source_retrievals`

| Champ | Type | Nullable | Règle |
|---|---|---|---|
| `company_siren` | `char(9)` | non | FK `companies.siren` |
| `source_api` | enum/text | non | `API_RECHERCHE_ENTREPRISES`, `INPI_RNE`, `API_ENTREPRISE_RCS` |
| `last_retrieved_at` | `timestamptz` | non | dernier call |
| `last_status` | `text` | non | `SUCCESS` ou `FAILED` |
| `last_http_status` | `integer` | oui | statut HTTP |
| `last_error` | `text` | oui | message normalisé |

Clé unique:
1. `(company_siren, source_api)`.

---

## B) Field mapping matrix (source -> priorité -> merge -> TTL)

Priorité source:
1. `API_RECHERCHE_ENTREPRISES` pour identité et activité rapide.
2. `INPI_RNE` pour formalités, registre et cohérence juridique.
3. `API_ENTREPRISE_RCS` pour extrait registre et preuve documentaire.

| Champ canonical | Sources candidates | Priorité | Règle de merge | TTL | Required for `SUCCESS` |
|---|---|---|---|---|---|
| `siren` | entrée, all sources | input > all | ne jamais écraser après normalisation | 365j | oui |
| `siret` | entrée, API_RECHERCHE_ENTREPRISES | input > A | conserver valeur entrée si valide | 365j | non |
| `legal_name` | API_RECHERCHE_ENTREPRISES, INPI_RNE, API_ENTREPRISE_RCS | API_RECHERCHE_ENTREPRISES > INPI_RNE > API_ENTREPRISE_RCS | first non-empty | 30j | oui |
| `trade_name` | API_RECHERCHE_ENTREPRISES, INPI_RNE | API_RECHERCHE_ENTREPRISES > INPI_RNE | first non-empty | 30j | non |
| `brand_name` | API_RECHERCHE_ENTREPRISES, INPI_RNE | API_RECHERCHE_ENTREPRISES > INPI_RNE | first non-empty | 30j | non |
| `legal_form` | INPI_RNE, API_RECHERCHE_ENTREPRISES, API_ENTREPRISE_RCS | INPI_RNE > API_RECHERCHE_ENTREPRISES > API_ENTREPRISE_RCS | first non-empty | 30j | non |
| `creation_date` | INPI_RNE, API_RECHERCHE_ENTREPRISES, API_ENTREPRISE_RCS | INPI_RNE > API_RECHERCHE_ENTREPRISES > API_ENTREPRISE_RCS | date valide la plus fiable | 30j | non |
| `active_status` | API_RECHERCHE_ENTREPRISES, INPI_RNE, API_ENTREPRISE_RCS | API_RECHERCHE_ENTREPRISES > INPI_RNE > API_ENTREPRISE_RCS | first non-empty | 7j | non |
| `address_line1` | API_RECHERCHE_ENTREPRISES, INPI_RNE, API_ENTREPRISE_RCS | API_RECHERCHE_ENTREPRISES > INPI_RNE > API_ENTREPRISE_RCS | first non-empty | 30j | oui si pas city/postal_code |
| `postal_code` | API_RECHERCHE_ENTREPRISES, INPI_RNE, API_ENTREPRISE_RCS | API_RECHERCHE_ENTREPRISES > INPI_RNE > API_ENTREPRISE_RCS | first non-empty | 30j | oui si pas address_line1/city |
| `city` | API_RECHERCHE_ENTREPRISES, INPI_RNE, API_ENTREPRISE_RCS | API_RECHERCHE_ENTREPRISES > INPI_RNE > API_ENTREPRISE_RCS | first non-empty | 30j | oui si pas address_line1/postal_code |
| `country_code` | INPI_RNE, API_RECHERCHE_ENTREPRISES | INPI_RNE > API_RECHERCHE_ENTREPRISES | normaliser sur ISO-2 | 30j | non |
| `naf_code` | API_RECHERCHE_ENTREPRISES, INPI_RNE | API_RECHERCHE_ENTREPRISES > INPI_RNE | first non-empty | 30j | non |
| `naf_label` | API_RECHERCHE_ENTREPRISES | API_RECHERCHE_ENTREPRISES | nullable | 30j | non |
| `headcount_range` | API_RECHERCHE_ENTREPRISES | API_RECHERCHE_ENTREPRISES | nullable | 30j | non |
| `rcs_city` | API_ENTREPRISE_RCS, INPI_RNE | API_ENTREPRISE_RCS > INPI_RNE | first non-empty | 30j | non |
| `registry_name` | API_ENTREPRISE_RCS, INPI_RNE | API_ENTREPRISE_RCS > INPI_RNE | first non-empty | 30j | non |

---

## C) Canonical enums (référence unique M3)

Cette section est la référence canonique pour `M3B`, `M3C`, `M3D`. Les autres patches doivent la référencer sans redéfinir de valeurs divergentes.

### `enrichment_status`

| Valeur | Définition |
|---|---|
| `PENDING` | demande créée, job non démarré |
| `RUNNING` | job actif avec lock acquis |
| `SUCCESS` | `core_identity` présente, 0 échec sur `required_sources`, et 0 échec sur optional appelées |
| `PARTIAL` | `core_identity` présente, 0 échec sur `required_sources`, et au moins un échec sur optional appelées |
| `FAILED` | échec d’au moins une `required_source` ou absence de `core_identity` |
| `STALE` | données présentes mais `updated_at` hors TTL, refresh requis |

### `source_api`

| Valeur | Définition |
|---|---|
| `API_RECHERCHE_ENTREPRISES` | API recherche d’entreprises (data.gouv) |
| `INPI_RNE` | API formalités RNE (INPI) |
| `API_ENTREPRISE_RCS` | extrait RCS via entreprise.api.gouv.fr |

### `error_code`

| Valeur | Définition |
|---|---|
| `MISSING_COMPANY_IDENTIFIER` | aucun SIREN/SIRET fourni |
| `INVALID_SIREN_FORMAT` | SIREN invalide (attendu 9 chiffres) |
| `INVALID_SIRET_FORMAT` | SIRET invalide (attendu 14 chiffres) |
| `SIREN_SIRET_MISMATCH` | SIREN ne correspond pas au SIRET |
| `AUTH_ERROR` | authentification source invalide |
| `FORBIDDEN` | source refuse l’accès |
| `NOT_FOUND` | entreprise non trouvée |
| `RATE_LIMIT` | limite de requêtes atteinte |
| `TIMEOUT` | timeout appel source |
| `UPSTREAM_5XX` | erreur serveur source |
| `SOURCE_UNAVAILABLE` | indisponibilité transitoire source |
| `INTERNAL_ERROR` | erreur interne non classifiée |

---

## D) Minimum Success Fields

Périmètre sources (contractuel):
1. `required_sources = [API_RECHERCHE_ENTREPRISES]`
2. `optional_sources = [INPI_RNE, API_ENTREPRISE_RCS]` (tant que non garanties à 100%)

| Niveau | Champs minimum requis | Conditions additionnelles |
|---|---|---|
| `SUCCESS` | `siren`, `legal_name`, au moins un de `address_line1/postal_code/city` | `enrichment_status=SUCCESS`, `core_identity` présente, `required_failed_count=0` |
| `PARTIAL` | `siren`, `legal_name`, au moins un de `address_line1/postal_code/city` | `enrichment_status=PARTIAL`, `core_identity` présente, `required_failed_count=0`, et `optional_failed_count>0` sur des optional appelées |
| `FAILED` | n/a | `enrichment_status=FAILED` si `required_failed_count>0` ou `core_identity` absente |

---

## E) Contrat de qualité de données

1. Toute valeur non conforme format (`siren`, `siret`) est rejetée avant persistence.
2. Les champs vides source ne remplacent jamais une valeur non vide déjà stockée.
3. `updated_at` est rafraîchi uniquement après cycle d’enrichissement terminé.
4. Les payloads bruts source sont conservés pour audit, même en cas d’échec partiel.
5. Les statuts `PARTIAL` et `FAILED` ne suppriment pas les dernières données valides.
6. `STALE` est autorisé uniquement si une donnée consolidée existe déjà en base.
7. `RUNNING` est transitoire et ne doit pas rester bloqué au-delà du TTL lock défini en `M3C`.
8. Un échec `NOT_FOUND` sur `API_RECHERCHE_ENTREPRISES` (required source) force `FAILED`.

---

## Synchronisation inter-docs (M3)

1. `M3B` doit réutiliser exactement les noms de champs DB exposés en sortie API.
2. `M3B`, `M3C`, `M3D` doivent référencer les enums de la section `C` sans divergence de valeur.
3. `M3C` doit utiliser les mêmes statuts et critères `SUCCESS/PARTIAL/FAILED`.
4. `M3D` doit référencer les mêmes tables et catégories de données sensibles.
5. Le présent document tranche tout conflit de schéma.

---

## Doc Consistency Checklist

1. Les 4 tables (`requests`, `companies`, `company_documents`, `company_source_retrievals`) sont décrites avec types et règles.
2. Les colonnes `siren_raw/siret_raw` et `siren/siret` sont distinguées sans ambiguïté.
3. Les statuts `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE` sont identiques à `M3B` et `M3C`.
4. Les enums `source_api` et `error_code` sont repris tels quels dans `M3B` et `M3C`.
5. La règle `PATCH_M3A source of truth` est explicitement présente.
6. La matrice de mapping précise source, priorité, merge, TTL et exigence `SUCCESS`.
7. Le tableau `Minimum Success Fields` est présent et utilisé par `M3C`.
8. `required_sources` et `optional_sources` sont explicités dans la section `D`.
9. Les contraintes minimales de validation format sont documentées.
10. Les index de traçabilité (`checksum`, retrievals) sont documentés.

---

## Changelog patch

- 2026-02-23: Création du patch `M3A` (split contractuel du patch M3 unifié).
- 2026-02-23: Ajustement required/optional sources pour rendre `SUCCESS/PARTIAL/FAILED` non ambigu.
