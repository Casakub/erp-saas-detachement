# PATCH M3D — RBAC / Security / Compliance

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: permissions, sécurité d’accès, conformité, audit, DoD documentaire

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. API: `PATCH_M3B_OPENAPI_API_SURFACE.md`
4. Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`

---

## Assumptions

1. Le modèle RBAC existant (`tenant_admin`, `agency_user`, `consultant`, `client_user`, `worker`, `system`) reste inchangé.
2. Les endpoints M3 sont tenant-scoped; aucun accès cross-tenant métier.
3. Les appels API officielles FR utilisent des secrets backend centralisés.
4. Les payloads source peuvent contenir des données personnes physiques et doivent être minimisés.

### Référence canonique obligatoire

1. Enums `enrichment_status`, `source_api`, `error_code`:
- `PATCH_M3A_DB_DATA_CONTRACTS.md` section `C) Canonical enums`.
2. Priorité documentaire:
- `If conflict: PATCH_M3A is source of truth.`

---

## Matrice RBAC — endpoints M3

| Endpoint | tenant_admin | agency_user | consultant | client_user | worker | system |
|---|---|---|---|---|---|---|
| `POST /v1/requests` | oui | oui | non | oui | non | oui |
| `GET /v1/requests/{request_id}` | oui | oui | lecture limitée | oui (scope client) | non | oui |
| `POST /v1/requests/{request_id}:refresh-company` | oui | oui | non | non | non | oui |

Règles:
1. `worker` ne peut pas créer ni relancer enrichissement client.
2. `consultant` ne peut pas déclencher de mutation d’enrichissement.
3. `system` est autorisé pour jobs backend planifiés.
4. Les artefacts `documents`/`exports` inclus dans `GET /v1/requests/{request_id}` héritent strictement de la même matrice RBAC.

---

## Sécurité secrets et appels source

1. Secrets obligatoirement backend:
- `ENTERPRISE_SEARCH_API_KEY`
- `INPI_FORMALITES_API_KEY`
- `ENTREPRISE_API_TOKEN`

2. Interdictions:
- aucune clé dans frontend.
- aucune clé en logs applicatifs.

3. Rotation:
- rotation recommandée trimestrielle.
- audit d’usage sur chaque rotation.

4. Transport:
- appels sources en TLS uniquement.

---

## Conformité et minimisation de données

1. Conserver en base uniquement les champs nécessaires à la Company Card et à l’audit.
2. Dans `company_documents.payload_json`, éviter duplication de données non exploitées.
3. Si des dirigeants/personnes physiques apparaissent:
- stockage restreint par principe de minimisation.
- éviter exposition UI par défaut.
4. Respecter la séparation:
- donnée consolidée métier dans `companies`.
- preuve/traçabilité brute dans `company_documents`.

---

## Auditabilité et traçabilité

1. Toute exécution d’enrichissement trace:
- source,
- timestamp,
- statut,
- code HTTP,
- erreur normalisée,
- checksum payload.

2. Toute mutation de statut `enrichment_status` doit être reconstructible via logs/events.

3. Le `correlation_id` doit être propagé:
- depuis request API vers job,
- puis vers logs source et events outbox.

---

## F) Doc-only Definition of Done + QA checklist

### Definition of Done documentaire (M3 split)

1. Le split `M3A/M3B/M3C/M3D` existe et remplace le détail dans l’overview `PATCH_M3`.
2. Les règles de normalisation `SIREN/SIRET` sont identiques entre `M3A` et `M3B`.
3. La machine d’états `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE` est identique entre `M3B` et `M3C`.
4. La règle de priorité documentaire est visible:
- `If conflict: PATCH_M3A (DB) is the source of truth.`
- `If conflict: PATCH_M3A is source of truth.`
5. L’index release pack référence explicitement les 4 patches.
6. Le changelog release pack décrit la Vague 4 en mode split.

### QA checklist documentaire (pré-codegen IA)

1. Vérifier que chaque champ API retourné existe dans `M3A`.
2. Vérifier que chaque endpoint de `M3B` a une règle RBAC ici.
3. Vérifier que chaque event de `M3C` a un champ `correlation_id`.
4. Vérifier que les politiques cache/lock `M3C` n’impliquent aucune contrainte DB absente de `M3A`.
5. Vérifier que les erreurs normalisées `M3B` et `M3C` restent compatibles.
6. Vérifier qu’aucun secret n’est mentionné comme exposé frontend.
7. Vérifier que la rétention des payloads est explicitement gouvernée.
8. Vérifier qu’aucun point de ce patch ne contredit `2.12.a` RBAC.

---

## Synchronisation inter-docs (M3)

1. Ce patch ne redéfinit pas de schéma DB; il applique `M3A`.
2. Ce patch ne redéfinit pas de payload API; il applique `M3B`.
3. Ce patch ne redéfinit pas la logique retry/lock; il applique `M3C`.

---

## Doc Consistency Checklist

1. Les 3 endpoints M3 sont couverts dans la matrice RBAC.
2. Les rôles interdits sont explicitement nommés.
3. Les règles secrets backend-only sont explicites.
4. La minimisation des données personnelles est documentée.
5. L’auditabilité (`source/status/http/checksum`) est explicitement exigée.
6. La DoD documentaire est écrite en critères vérifiables.
7. La QA checklist contient au moins 5 contrôles inter-docs.
8. La règle de priorité `M3A source of truth` est répétée.

---

## Changelog patch

- 2026-02-23: Création du patch `M3D` (split contractuel du patch M3 unifié).
