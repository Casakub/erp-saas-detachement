# PATCH M3 — Company Enrichment (SIREN/SIRET obligatoire) — OVERVIEW

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Priorité**: HAUTE — qualité de donnée entrante et fiabilité dashboard
- **Rôle du document**: fil conducteur et index M3

---

## Objectif

Ce document est volontairement réduit à un rôle de pilotage. Les contrats détaillés sont éclatés en 4 patches synchronisés (+ 1 patch d’intégration Search API) pour limiter les contradictions inter-docs.

Parcours cible:
1. La création de demande impose `SIREN` ou `SIRET`.
2. Le backend normalise l’identifiant entreprise et déclenche l’enrichissement officiel.
3. Les données consolidées sont persistées et tracées.
4. Le dashboard affiche immédiatement une Company Card avec états `PENDING | RUNNING | SUCCESS | PARTIAL | FAILED | STALE`.

---

## Références officielles (données entreprise)

1. RCS extract (Infogreffe via entreprise.api.gouv.fr): `https://entreprise.api.gouv.fr/catalogue/infogreffe/rcs/extrait`
2. API Recherche d’entreprises (data.gouv): `https://www.data.gouv.fr/dataservices/api-recherche-dentreprises`
3. API Formalités / RNE (INPI): `https://www.inpi.fr/ressources/formalites-dentreprises/acces-lapi-formalite-rne`
4. Documentation technique INPI v4.0: `https://www.inpi.fr/sites/default/files/2025-06/documentation%20technique%20API%20formalités_v4.0.pdf`

---

## Découpage en 4 patches (source contractuelle)

1. `PATCH_M3A_DB_DATA_CONTRACTS.md`
- Schéma DB, dictionnaire de données, mapping des champs source, règles de merge.

2. `PATCH_M3B_OPENAPI_API_SURFACE.md`
- Surfaces API `/v1`, validation d’entrée, payloads et erreurs d’API.

3. `PATCH_M3C_EVENTS_ORCHESTRATION.md`
- Events outbox, job d’enrichissement, machine d’états, cache/lock, observabilité opérationnelle.

4. `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`
- RBAC, sécurité secrets, minimisation données, auditabilité, DoD documentaire QA.

Option QA doc-only:
1. `PATCH_M3E_TEST_SCENARIOS.md`
- 12 scénarios Given/When/Then pour pré-aligner la QA avant build.

Option build handover:
1. `PATCH_M3F_IMPLEMENTATION_TASK_PACK.md`
- paquet de tâches contract-first pour passer doc -> build sans requalification design.

Contrat d’intégration source (public mode):
1. `PATCH_M3G_RECHERCHE_ENTREPRISES_INTEGRATION.md`
- contrat de consommation API Recherche d’entreprises (provenance, fraîcheur, mapping params/payloads, throttling).

---

## Règles de priorité documentaire (M3)

1. En cas de conflit DB/API/Events/RBAC:
- appliquer la priorité `M3A -> M3B -> M3C -> M3D`.

2. Règle explicite release-pack:
- `If conflict: PATCH_M3A (DB) is the source of truth.`
3. Règle courte:
- `If conflict: PATCH_M3A is source of truth.`

4. Ce document overview ne fait pas autorité sur les structures détaillées.

## Gouvernance post-freeze (M3)

1. Baseline stable recommandée: `M3A/M3B/M3C/M3D/M3E`.
2. Toute correction fonctionnelle ou contractuelle après freeze passe par `M3x_FIX` + changelog.
3. Le task pack build est dans `M3F`, sans autoriser de changement de contrat.

---

## Assumptions

1. Le backend reste contract-first en `/v1`.
2. Le déclenchement enrichissement peut être synchrone court puis asynchrone si timeout.
3. Le cache de fraîcheur entreprise est fixé à 30 jours par défaut.
4. Le dashboard frontend consomme les payloads API sans exposer de secrets source.

---

## Couverture des exigences initiales

| Exigence | Patch autoritaire |
|---|---|
| SIREN/SIRET obligatoire + normalisation | `PATCH_M3B_OPENAPI_API_SURFACE.md` |
| Persistance normalisée + traçabilité | `PATCH_M3A_DB_DATA_CONTRACTS.md` |
| Enrichissement automatique officiel + résilience | `PATCH_M3C_EVENTS_ORCHESTRATION.md` |
| Company Card + états UI | `PATCH_M3B_OPENAPI_API_SURFACE.md` |
| Sécurité / conformité / audit | `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md` |

---

## Doc Consistency Checklist

1. Les 4 patches M3 core + `M3G` existent et sont référencés depuis l’index release pack.
2. La règle `PATCH_M3A source of truth` est répétée dans `M3A`, l’index et le changelog.
3. Les noms de statuts d’enrichissement sont identiques dans `M3A`, `M3B`, `M3C`, `M3D`.
4. Les champs DB de `M3A` existent dans les payloads API de `M3B` sans renommage ambigu.
5. Les events de `M3C` ne contredisent pas les endpoints de `M3B`.
6. La matrice RBAC de `M3D` couvre tous les endpoints définis par `M3B`.
7. Les politiques cache/lock de `M3C` sont compatibles avec les TTL de `M3A`.
8. Aucune clé API n’est mentionnée comme visible frontend dans aucun patch.

---

## Changelog patch

- 2026-02-23: Création du patch M3 unifié.
- 2026-02-23: Refactor en overview et split contractuel `M3A/M3B/M3C/M3D`.
- 2026-02-23: Ajout de la référence `M3G` (contrat d’intégration Search API public mode).
