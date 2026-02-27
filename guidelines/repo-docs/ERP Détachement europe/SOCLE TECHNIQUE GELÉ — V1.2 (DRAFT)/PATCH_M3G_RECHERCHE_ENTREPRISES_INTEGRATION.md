# PATCH M3G — Intégration API Recherche d’entreprises (Public Mode)

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage intégration (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: contrat d’intégration consommateur de l’API Recherche d’entreprises
- **Règle d’autorité**: `If conflict: PATCH_M3A (DB) is the source of truth.`
- **Règle courte**: `If conflict: PATCH_M3A is source of truth.`

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB/Data contracts: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. API surface interne: `PATCH_M3B_OPENAPI_API_SURFACE.md`
4. Events/Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`
5. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`
6. Build handover: `PATCH_M3F_IMPLEMENTATION_TASK_PACK.md`

Sources amont (source-of-facts):
1. Search API repo: `https://github.com/annuaire-entreprises-data-gouv-fr/search-api`
2. OpenAPI upstream: `search-api/app/doc/open-api.yml`
3. Validation params upstream: `search-api/app/controller/search_params_model.py`, `search-api/app/controller/field_validation.py`
4. Search infra repo: `https://github.com/annuaire-entreprises-data-gouv-fr/search-infra`
5. Data pipeline upstream: `search-infra/README.md`

---

## Assumptions

1. Notre plateforme est **consommatrice** de l’API publique `recherche-entreprises.api.gouv.fr` (pas de self-hosting requis).
2. Les recherches par identifiant entreprise se font via `q=<siren|siret>` (pas de paramètre `siren=`/`siret=` natif documenté dans l’OpenAPI upstream).
3. L’endpoint admin `/sources/last_modified` est utilisé uniquement comme **hint de fraîcheur** optionnel, jamais comme dépendance bloquante du parcours métier.
4. Les enums canoniques (`enrichment_status`, `source_api`, `error_code`) restent ceux de `M3A` sans redéfinition.

---

## A) Purpose & Scope

### Pourquoi cette intégration

1. Identifier rapidement et sans ambiguïté l’entreprise à partir de `SIREN/SIRET`.
2. Récupérer un maximum de données ouvertes consolidées: identité, siège, établissements connexes, dirigeants, finances, compléments.
3. Alimenter les contrats internes `M3A..M3F` de manière non ambiguë pour un build contract-first.

### Ce que couvre M3G

1. Contrat de consommation des endpoints publics `/search` et `/near_point`.
2. Mapping contract-first des paramètres et payloads vers nos champs canoniques.
3. Règles de pagination, erreurs, throttling, résilience, provenance et fraîcheur.

### Hors périmètre

1. Dépendance opérationnelle aux endpoints admin pour le run métier.
2. Usage `include_admin` en mode produit.
3. Les entités non-diffusibles ne sont **pas exclues systématiquement**: elles peuvent être renvoyées par l’API (notamment en recherche identifiant `SIREN/SIRET`), avec **masquage/partialisation** de certains champs selon les règles upstream. Notre produit doit gérer ce cas explicitement (affichage partiel + statut conformité), sans considérer cela comme un échec technique.

---

## B) Data provenance (search-infra -> Search API)

1. L’API Recherche d’entreprises repose sur un index Elasticsearch construit par `search-infra`.
2. Le pipeline amont est explicitement découpé en 4 workflows:
- Prétraitement
- ETL (SQLite)
- Indexation (Elasticsearch)
- Snapshot
3. Des DAG Airflow quotidiens alimentent les jeux de données amont (ex: Base Sirene stock, ratios financiers, RNE, etc.).
4. Les champs `finances` et de nombreux `complements` sont dérivés des datasets ingérés amont (ex: INPI/Signaux Faibles ratios, Agence Bio, ADEME RGE, ESS, SIAE, FINESS, Egapro, organismes de formation, conventions collectives/IDCC).

Familles de `complements` exploitées côté produit:
1. ESS / SIAE
2. RGE / Bio
3. FINESS / organismes de formation / UAI
4. Egapro
5. conventions collectives (IDCC)
6. indicateurs labels administratifs (selon disponibilité amont)

---

## C) Freshness model

### Règle canonique de cache (interne)

1. `TTL=30 jours` reste la règle canonique de fraîcheur interne (référence `M3C`).
2. La date de consolidation interne affichable est `companies.updated_at`.

### Hint de fraîcheur amont (optionnel)

1. Source optionnelle: `GET /sources/last_modified` (endpoint admin upstream).
2. Ce hint n’est pas requis pour réussir un enrichissement.
3. Si disponible, il peut être affiché en diagnostic UI sous forme `Upstream data freshness`.

Règle d’affichage "Data last updated":
1. Toujours afficher `company.updated_at` comme horodatage de consolidation interne.
2. Optionnellement afficher `max(last_modified[source])` comme fraîcheur amont indicative.
3. Si le hint amont est indisponible, ne jamais dégrader le statut métier; afficher uniquement la consolidation interne.

---

## D) Endpoints consommés (public mode)

| Endpoint upstream | Méthode | Usage produit | Contractuel |
|---|---|---|---|
| `/search` | `GET`/`HEAD` | endpoint principal d’enrichissement par `q` + filtres | oui |
| `/near_point` | `GET`/`HEAD` | enrichissement géographique/prospection (non requis pour core identity) | oui |
| `/sources/last_modified` | `GET` | diagnostic ops/UI fraîcheur amont | optionnel, non bloquant |

Règles:
1. Ne pas dépendre des endpoints admin (`/sources/last_modified`, `idcc/*`) pour le run normal.
2. Ne jamais utiliser `include_admin` en mode produit.

---

## E) Query parameter mapping (canonique -> upstream)

### Contraintes globales upstream à respecter

1. Au moins un paramètre de recherche doit être fourni (`400` sinon).
2. `q` de longueur `< 3` refusé si aucun autre filtre (`400`).
3. Pagination: `per_page` par défaut `10`, max `25`.
4. Cap pagination: `page * per_page <= 10000` (`400` sinon).
5. `include` est accepté uniquement avec `minimal=true`.
6. Valeurs `include` autorisées: `complements,dirigeants,finances,matching_etablissements,siege,score`.
7. `near_point`: `lat` et `long` obligatoires; `radius` défaut `5`, max `50`; `q/terms` interdit en recherche géographique.

### Table de mapping des paramètres

| Canonical query field (interne) | Paramètre Search API | Endpoint | Règle de mapping | Obligatoire |
|---|---|---|---|---|
| `company_identifier` (SIREN/SIRET) | `q` | `/search` | `q=<siren>` ou `q=<siret>` (identifiant normalisé) | oui (pass 1) |
| `terms` (recherche texte) | `q` | `/search` | `q=<texte>`; si `<3` chars, ajouter au moins un filtre | non |
| `naf_code` | `activite_principale` | `/search`,`/near_point` | code unique ou CSV | non |
| `postal_code` | `code_postal` | `/search` | 5 chiffres, valeur unique ou CSV | non |
| `commune_code` | `code_commune` | `/search` | code commune INSEE, unique ou CSV | non |
| `departement` | `departement` | `/search` | 2/3 caractères, unique ou CSV | non |
| `region` | `region` | `/search` | code région 2 chiffres, unique ou CSV | non |
| `minimal_mode` | `minimal` | `/search`,`/near_point` | `true` requis dès qu’on utilise `include` | oui (stratégie M3) |
| `include_fields` | `include` | `/search`,`/near_point` | CSV parmi valeurs autorisées | oui (stratégie M3) |
| `page` | `page` | `/search`,`/near_point` | >=1, avec cap global 10k | non |
| `per_page` | `per_page` | `/search`,`/near_point` | `1..25`, défaut 10 | non |
| `matching_page` | `page_etablissements` | `/search`,`/near_point` | pagination dédiée `matching_etablissements` | non |
| `matching_limit` | `limite_matching_etablissements` | `/search`,`/near_point` | `1..100`, défaut 10 | non |
| `geo_lat` | `lat` | `/near_point` | float `-90..90` | oui (near_point) |
| `geo_long` | `long` | `/near_point` | float `-180..180` | oui (near_point) |
| `geo_radius_km` | `radius` | `/near_point` | float `0.001..50`, défaut 5 | non |

### Stratégie `minimal/include` contractuelle M3

1. Pass 1 (required source, identity-first):
- `minimal=true`
- `include=siege,complements,finances,score`
- objectif: remplir `core_identity` + activité/adresse + signaux finance/complements.
2. Pass 2 (optionnel, enrichissement prospect):
- `minimal=true`
- `include=dirigeants,matching_etablissements`
- déclenché si besoin d’analyse détaillée.

---

## F) Response mapping table (Search API -> champs canoniques)

Règles générales de merge:
1. Priorité source et merge DB: `M3A` section `B` fait autorité.
2. Les champs vides upstream n’écrasent pas une valeur non vide déjà consolidée.
3. Le payload brut Search API est stocké en snapshot `company_documents` (`doc_type=ENTERPRISE_SEARCH`) avec `checksum`.

| Search API JSON path | Target canonical field | Storage target | Merge rule | TTL recommandée | Required for `SUCCESS` |
|---|---|---|---|---|---|
| `results[0].siren` | `siren` | `companies.siren`, `requests.company_siren` | doit matcher le SIREN normalisé input; sinon `FAILED` | 365j | oui |
| `results[0].nom_raison_sociale` | `legal_name` | `companies.legal_name` | prioritaire; fallback `nom_complet` si vide | 30j | oui |
| `results[0].nom_complet` | `trade_name` | `companies.trade_name` | first non-empty | 30j | non |
| `results[0].sigle` | `brand_name` | `companies.brand_name` | fallback possible de type acronyme légal; pas une enseigne stricte | 30j | non |
| `results[0].nature_juridique` | `legal_form` | `companies.legal_form` | valeur upstream = code; MUST passer par un mapping interne `nature_juridique_code -> legal_form_label` (table de correspondance). Si mapping inconnu: stocker le code dans snapshot, et laisser `companies.legal_form` null (ne pas inventer). | 30j | non |
| `results[0].date_creation` | `creation_date` | `companies.creation_date` | date valide la plus fiable | 30j | non |
| `results[0].etat_administratif` | `active_status` | `companies.active_status` | map direct (`A/C`) | 7j | non |
| `results[0].activite_principale` | `naf_code` | `companies.naf_code` | priorité sur fallback externe | 30j | non |
| `results[0].section_activite_principale` | `naf_label` (indirect) | `companies.naf_label` | renseigner si libellé dispo côté mapping interne | 30j | non |
| `results[0].tranche_effectif_salarie` | `headcount_range` | `companies.headcount_range` | first non-empty | 30j | non |
| `results[0].siege.adresse` | `address_line1` | `companies.address_line1` | first non-empty | 30j | oui si pas `postal_code/city` |
| `results[0].siege.complement_adresse` | `address_line2` | `companies.address_line2` | first non-empty | 30j | non |
| `results[0].siege.code_postal` | `postal_code` | `companies.postal_code` | first non-empty | 30j | oui si pas `address_line1/city` |
| `results[0].siege.libelle_commune` | `city` | `companies.city` | first non-empty | 30j | oui si pas `address_line1/postal_code` |
| `results[0].siege.libelle_pays_etranger` | `country_code` (indirect) | `companies.country_code` | normaliser ISO-2 si mapping disponible | 30j | non |
| `results[0].siege.siret` | `search_siege_siret` (diagnostic) | `company_documents.payload_json` | snapshot only; **ne pas écraser `requests.siret` (Option A)** | 30j | non |
| `results[0].dirigeants[]` | `dirigeants_snapshot` | `company_documents.payload_json` | snapshot JSON brut + projection API optionnelle | 30j | non |
| `results[0].finances` (`{year:{ca,resultat_net}}`) | `finances_snapshot` | `company_documents.payload_json` | snapshot JSON brut + projection API optionnelle | 30j | non |
| `results[0].complements` | `complements_snapshot` | `company_documents.payload_json` | snapshot JSON brut + projection API optionnelle | 30j | non |
| `results[0].matching_etablissements[]` | `matching_etablissements_snapshot` | `company_documents.payload_json` | snapshot paginé (via `page_etablissements`) | 30j | non |
| `HTTP status + timing + source` | `source retrieval` | `company_source_retrievals.*` | upsert par `(company_siren, source_api)` | 30j | n/a |

### Mapping code -> label (nature_juridique)

1. Source upstream fournit un code.
2. Notre projet maintient une table de correspondance `nature_juridique_code -> legal_form_label` (référence upstream: `search-api/app/service/formatters/nature_juridique.py`).
3. DoD build: importer/maintenir cette table côté backend (doc-only ici).

Règle d’évaluation:
1. Absence de `finances` ou `complements` **n’est pas un échec** si `core_identity` est présente.
2. `SUCCESS/PARTIAL/FAILED` reste évalué via `M3A`/`M3C` (required vs optional sources), pas sur la présence de chaque bloc optionnel Search API.
3. Les projections API internes de `finances`/`complements`/`dirigeants` suivent la règle `last snapshot only` (dernier `ENTERPRISE_SEARCH`), sans agrégation multi-snapshots.

### Path validation (build gate)

1. Les JSON paths listés dans la table de mapping ci-dessus sont normatifs pour l’implémentation.
2. Au build, les implémenteurs MUST valider chaque path référencé contre l’OpenAPI YAML upstream `search-api/app/doc/open-api.yml`.
3. Exception explicite: l’endpoint `/sources/last_modified` est un endpoint admin runtime non documenté dans `open-api.yml`. Sa validation doit se faire contre le code upstream (`app/routers/admin.py`) et non contre l’OpenAPI YAML. Cette exception ne s’applique qu’à cet endpoint; tous les autres mappings `/search` et `/near_point` restent soumis à validation OpenAPI.
4. En cas d’écart path/schema, les implémenteurs MUST NOT corriger ad-hoc dans le code.
5. En cas d’écart, créer un patch documentaire `M3x_FIX` qui corrige les paths de mapping en préservant les champs canoniques M3A.
6. Paths à risque élevé à vérifier explicitement contre l’OpenAPI upstream:
- `nature_juridique`
- `etat_administratif`
- `date_creation`
- `section_activite_principale`

---

## G) Pagination strategy

### Enrichissement standard (identifiant entreprise)

1. Utiliser `/search` avec `q=<siren|siret>`, `page=1` et règle `per_page` explicite:
- entrée `SIREN` (9 chiffres): `per_page=1`.
- entrée `SIRET` (14 chiffres): `per_page=5` pour appliquer la sélection déterministe sur un jeu de résultats court.
- dans tous les cas, respecter la contrainte upstream `per_page<=25`.
2. Règle de sélection déterministe selon identifiant d’entrée:
- si entrée `SIRET` (14 chiffres):
  - scanner `results[*]` et sélectionner le premier item où `siege.siret == input_siret` (si champ présent);
  - sinon, si pass 2 tourne, scanner `results[*].matching_etablissements[*]` pour `siret == input_siret` (diagnostic uniquement);
  - sinon, accepter `results[0]` uniquement si `results[0].siren == derived_siren`, sinon `NOT_FOUND`.
- si entrée `SIREN` (9 chiffres):
  - accepter `results[0]` uniquement si `results[0].siren == input_siren`, sinon `NOT_FOUND`.
Note observabilité (optionnelle): si aucun match exact SIRET n’est trouvé, logger `siret_match=false` avec `correlation_id`, `company_siren`, `input_siret`.
3. Ne pas paginer au-delà de `page=1` pour le flux standard.
4. Option A est intangible: `request.siret` n’est jamais écrasé; les `siret` Search API servent uniquement au matching/diagnostic.

### `matching_etablissements`

1. Si `include=matching_etablissements`, utiliser:
- `limite_matching_etablissements` (1..100)
- `page_etablissements` (>=1)
2. Stratégie recommandée:
- page 1 par défaut;
- pages supplémentaires uniquement à la demande d’analyse (prospection).

### Garde-fous

1. Toujours respecter `per_page<=25`.
2. Toujours respecter `page*per_page<=10000`.
3. Arrêt immédiat en `400` de pagination invalide (pas de retry).

---

## H) Error handling rules (mapping canonique M3A)

| Cas upstream/runtime | Signal observé | `error_code` canonique | Retry | Effet statut |
|---|---|---|---|---|
| Paramètres client invalides avant call | validation locale | `INVALID_SIREN_FORMAT` / `INVALID_SIRET_FORMAT` / `MISSING_COMPANY_IDENTIFIER` / `SIREN_SIRET_MISMATCH` | non | rejet API interne |
| `/search` 200 avec `total_results=0` | aucun résultat fiable | `NOT_FOUND` | non | `FAILED` (source required) |
| Upstream `400` | params invalides côté intégration | `INTERNAL_ERROR` | non | `FAILED` (source required) |
| Upstream `401` | auth refusée | `AUTH_ERROR` | non | `FAILED` |
| Upstream `403` | accès interdit | `FORBIDDEN` | non | `FAILED` |
| Upstream `429` | rate limit | `RATE_LIMIT` | oui, respecter `Retry-After` | peut finir `PARTIAL/FAILED` selon source |
| Timeout client | deadline dépassée | `TIMEOUT` | oui | peut finir `PARTIAL/FAILED` |
| Upstream `5xx` | indisponibilité serveur | `UPSTREAM_5XX` | oui | peut finir `PARTIAL/FAILED` |
| Erreur réseau/DNS/TLS | transport KO | `SOURCE_UNAVAILABLE` | oui | peut finir `PARTIAL/FAILED` |

Règles:
1. `Retry-After` est prioritaire sur le backoff interne.
2. `NOT_FOUND` sur `API_RECHERCHE_ENTREPRISES` force `FAILED` (source required).
3. Les payloads d’erreur exposés en API interne restent ceux de `M3B`.
4. Si upstream retourne une entreprise non-diffusible/masquée, cela ne déclenche pas `NOT_FOUND`: traiter comme `SUCCESS/PARTIAL` selon `required_sources`, avec `data_masked=true` en diagnostic UI/log.

---

## I) Throttling & resilience guidance

1. Cible opérationnelle: limiter à `<=7 rps` par utilisateur; appliquer en plus un garde-fou tenant (`tenant-scoped`) pour éviter l’effet rafale.
2. Recommandation d’implémentation:
- token bucket côté worker;
- plafond prudent recommandé `6 rps` avec burst contrôlé.
3. Sur `429`:
- lire `Retry-After`;
- suspendre les retries jusqu’au délai indiqué.
4. Circuit breaker recommandé:
- ouvrir après séquence d’échecs `429/5xx` répétée;
- demi-ouverture avec probes limitées;
- ne pas bloquer la lecture de snapshots existants.
5. Conserver le lock per-company (`M3C`) pour éviter les appels concurrents sur un même `siren`.

---

## J) Security / compliance

1. L’API est ouverte, mais le backend reste le seul appelant (pas de logique d’appel direct frontend).
2. Les entités non-diffusibles ne sont **pas exclues systématiquement**: elles peuvent être renvoyées par l’API (notamment en recherche identifiant `SIREN/SIRET`), avec **masquage/partialisation** de certains champs selon les règles upstream. Notre produit doit gérer ce cas explicitement (affichage partiel + statut conformité), sans considérer cela comme un échec technique.
3. Si une entreprise est détectée comme non-diffusible/masquée:
- ne jamais tenter d’inférer/reconstruire les champs masqués,
- afficher un message `données partiellement masquées (source officielle)`,
- conserver le snapshot brut pour audit (`company_documents`) et tracer la `source_retrieval`.
4. `include_admin` est interdit en mode produit.
5. Logs:
- ne pas logger les payloads complets;
- logger uniquement métadonnées (source, code HTTP, latence, correlation_id, siren).
6. Snapshots:
- stocker dans `company_documents` (`doc_type=ENTERPRISE_SEARCH`) avec `checksum`;
- imposer une limite de taille de payload (recommandé: 1 MB max, sinon tronquage contrôlé + hash).
7. Données dirigeants:
- usage strictement nécessaire au besoin métier;
- pas d’exposition large hors écrans autorisés (`M3D`).

---

## K) Exemples cURL (public mode)

### 1) Recherche par SIREN

```bash
curl -G "https://recherche-entreprises.api.gouv.fr/search" \
  -H "Accept: application/json" \
  -H "User-Agent: yojob-erp/1.0 (+company-enrichment)" \
  --data-urlencode "q=356000000" \
  --data-urlencode "minimal=true" \
  --data-urlencode "include=siege,complements,finances,score" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=1"
```

### 2) Recherche avec filtre NAF + code_postal

```bash
curl -G "https://recherche-entreprises.api.gouv.fr/search" \
  -H "Accept: application/json" \
  -H "User-Agent: yojob-erp/1.0 (+company-enrichment)" \
  --data-urlencode "q=plomberie" \
  --data-urlencode "activite_principale=43.22A" \
  --data-urlencode "code_postal=75015" \
  --data-urlencode "minimal=true" \
  --data-urlencode "include=siege,complements,finances" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=10"
```

### 3) Recherche géographique `near_point`

```bash
curl -G "https://recherche-entreprises.api.gouv.fr/near_point" \
  -H "Accept: application/json" \
  -H "User-Agent: yojob-erp/1.0 (+company-enrichment)" \
  --data-urlencode "lat=48.8566" \
  --data-urlencode "long=2.3522" \
  --data-urlencode "radius=5" \
  --data-urlencode "activite_principale=43.21A" \
  --data-urlencode "minimal=true" \
  --data-urlencode "include=siege,matching_etablissements" \
  --data-urlencode "page=1" \
  --data-urlencode "per_page=10" \
  --data-urlencode "page_etablissements=1"
```

---

## L) Definition of Done (doc-only) + QA checklist

### DoD doc-only

1. Les endpoints consommés et exclus sont explicitement listés.
2. Les contraintes upstream (`7 rps`, `Retry-After`, `per_page<=25`, `page*per_page<=10000`, règles `minimal/include`, contraintes geo) sont explicites et testables.
3. Les tables de mapping paramètre et réponse couvrent les champs nécessaires au build.
4. Les règles de merge/TTL/required-for-success sont alignées avec `M3A`.
5. Le modèle de fraîcheur distingue consolidation interne (`updated_at`) et hint amont optionnel (`last_modified`).

### Doc Consistency Checklist

1. `source_api=API_RECHERCHE_ENTREPRISES` correspond explicitement à l’API Search publique.
2. Les statuts `SUCCESS/PARTIAL/FAILED` ne contredisent pas `M3A`/`M3C`.
3. `SIRET` contexte demande (Option A) n’est pas écrasé par `siege.siret`.
4. `finances`/`complements` sont documentés comme optionnels côté disponibilité source.
5. Les règles `429 + Retry-After` sont présentes dans M3G et reprises en M3C.
6. L’endpoint admin `/sources/last_modified` est marqué **optionnel non bloquant**.
7. `include_admin` est explicitement interdit en mode produit.
8. Les mappings vers `company_documents` et `company_source_retrievals` sont traçables.
9. Les limitations de couverture (non-diffusibles, périmètre open data) sont explicites.
10. Les liens release pack (`INDEX`/`CHANGELOG`) référencent ce patch.
11. La clause `Path validation (build gate)` est présente, avec chemins à risque explicites.
12. La règle `per_page` est déterministe: `SIREN -> 1`, `SIRET -> 5` (toujours `<=25`).
13. La règle de sélection scanne `results[*]` quand l’entrée est un `SIRET` (per_page=5).
14. La gestion non-diffusible/masquage est documentée (pas `absente`), et le mapping `nature_juridique` (`code -> label`) est explicitement requis.

---

## Changelog patch

- 2026-02-23: Création du patch `M3G` (contrat d’intégration Search API public mode).
- 2026-02-23: Ajout provenance/freshness amont (search-infra + `/sources/last_modified`) sans dépendance bloquante.
- 2026-02-23: Hardening doc-only: `Path validation`, clarification sémantique `sigle`, sélection déterministe SIRET/SIREN.
- 2026-02-23: PATCH doc-only M3G appliqué: non-diffusible `masquage/partialisation` (pas `absence`), exception `Path validation` pour `/sources/last_modified`, mapping explicite `nature_juridique code -> label`.
