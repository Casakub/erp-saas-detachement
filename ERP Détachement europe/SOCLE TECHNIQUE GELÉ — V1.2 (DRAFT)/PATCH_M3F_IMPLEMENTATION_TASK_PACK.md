# PATCH M3F — Implementation Task Pack (Contract-first)

- **Statut**: DRAFT V1.2.4
- **Date**: 2026-02-23
- **Auteur**: Cadrage implémentation (codex)
- **Lot / Module**: Lot 4 — M3 (Clients + vigilance)
- **Périmètre**: paquet de tâches build guidé par contrats M3
- **Clause de stabilité**: `Do not change contracts defined in M3A/M3B/M3C/M3D/M3E.`

Liens:
1. Overview: `PATCH_M3_COMPANY_ENRICHMENT_SIREN_SIRET.md`
2. DB source of truth: `PATCH_M3A_DB_DATA_CONTRACTS.md`
3. API: `PATCH_M3B_OPENAPI_API_SURFACE.md`
4. Orchestration: `PATCH_M3C_EVENTS_ORCHESTRATION.md`
5. RBAC/Security: `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`
6. QA scenarios: `PATCH_M3E_TEST_SCENARIOS.md`

---

## Assumptions

1. Le build sera lancé après validation GO du gate release pack.
2. Toute divergence détectée doit générer un patch `M3x_FIX` documentaire avant code.
3. Les tâches ci-dessous sont séquentielles mais peuvent être parallélisées par lot technique.

---

## Task 1 — DB migrations (from M3A)

Inputs:
1. `PATCH_M3A_DB_DATA_CONTRACTS.md`

Outputs (files):
1. migration SQL M3 (naming convention release pack).
2. update schéma DB technique.

DoD:
1. Tables/colonnes/contraintes conformes à M3A.
2. Enums canoniques créés/repris sans divergence.
3. PK/UK de traçabilité présentes (`company_siren`, `source_api`, `checksum`).

Do not change contracts:
1. Ne pas renommer les champs canoniques M3A.

---

## Task 2 — API endpoints (from M3B)

Inputs:
1. `PATCH_M3B_OPENAPI_API_SURFACE.md`
2. `PATCH_M3A_DB_DATA_CONTRACTS.md` (mapping et enums)

Outputs (files):
1. routes `/v1/requests*`.
2. schémas request/response.
3. format unique d’erreur API.

DoD:
1. Validation SIREN/SIRET conforme.
2. Payload API strictement aligné table maître DB↔API↔UI.
3. `correlation_id` et `request_id` exposés dans les erreurs.

Do not change contracts:
1. Ne pas modifier la structure JSON documentée sans patch M3x_FIX.

---

## Task 3 — Orchestrator worker (from M3C)

Inputs:
1. `PATCH_M3C_EVENTS_ORCHESTRATION.md`
2. `PATCH_M3A_DB_DATA_CONTRACTS.md`

Outputs (files):
1. worker/job orchestration M3.
2. publisher events outbox M3.
3. gestion cache/lock/retry.

DoD:
1. Machine d’états complète `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE`.
2. Policy TTL/lock/retry conforme.
3. Décision opérationnelle appliquée:
- async par défaut avec tentative sync courte `<1200ms`.

Do not change contracts:
1. Ne pas introduire de nouveaux statuts hors enum canonique.

---

## Task 4 — Dashboard UI states (from M3B)

Inputs:
1. `PATCH_M3B_OPENAPI_API_SURFACE.md`
2. `PATCH_M3A_DB_DATA_CONTRACTS.md` (table maître)

Outputs (files):
1. Company Card vue détail demande.
2. états UI `PENDING/RUNNING/SUCCESS/PARTIAL/FAILED/STALE`.

DoD:
1. Affichage champs `must/should/may` conforme table maître.
2. Staleness UI alignée TTL 30 jours.
3. Loading/auto-refresh cohérents avec `enrichment_running`.

Do not change contracts:
1. Ne pas mapper des labels UI vers des paths JSON non documentés.

---

## Task 5 — RBAC enforcement (from M3D)

Inputs:
1. `PATCH_M3D_RBAC_SECURITY_COMPLIANCE.md`
2. `PATCH_M3B_OPENAPI_API_SURFACE.md`

Outputs (files):
1. règles d’accès endpoint M3.
2. protections backend-only secrets/source APIs.

DoD:
1. Matrice RBAC M3 appliquée endpoint par endpoint.
2. Aucune clé API côté frontend/logs.
3. Auditabilité/correlation propagation vérifiable.

Do not change contracts:
1. Ne pas élargir les permissions sans patch documentaire.

---

## Task 6 — Tests from M3E to automated plan

Inputs:
1. `PATCH_M3E_TEST_SCENARIOS.md`
2. `PATCH_M3A/B/C/D` selon scénario

Outputs (files):
1. plan de tests automatisés (unit/integration/e2e).
2. jeux de données de test minima.

DoD:
1. Les 12 scénarios doc-only sont tracés vers des tests réels ou explicitement marqués N/A.
2. Couverture critique:
- invalid identifiers,
- not found,
- rate limit,
- cache hit,
- lock contention,
- partial failure,
- stale refresh.

Do not change contracts:
1. Ne pas adapter le contrat aux tests; adapter les tests au contrat.

---

## Gouvernance post-freeze

1. Considérer `M3A/M3B/M3C/M3D/M3E` comme baseline stable.
2. Toute correction passe par un patch `M3x_FIX` avec entrée `RELEASE_PACK_V1.2_CHANGELOG.md`.
3. Règle permanente: `If conflict: PATCH_M3A is source of truth.`

---

## Doc Consistency Checklist

1. Les 6 tâches couvrent DB, API, Orchestrator, UI, RBAC, Tests.
2. Chaque tâche a Inputs, Outputs, DoD, et clause `Do not change contracts`.
3. Les références de contrats pointent vers M3A..M3E.
4. La décision de job model est cohérente avec `M3C`.
5. La gouvernance `M3x_FIX` est explicitement mentionnée.
6. Aucune tâche n’introduit de nouveau contrat non documenté.
7. La règle `PATCH_M3A source of truth` est répétée.

---

## Changelog patch

- 2026-02-23: Création du patch `M3F` (task pack build contract-first).
