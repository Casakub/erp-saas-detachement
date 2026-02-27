# Playbook IA Backend (Contract-First)

## Objectif

- Guider les IA pour développer par module, sans relire tout le repo à chaque run.
- Réduire le coût de contexte en imposant un pack documentaire minimal.
- Appliquer strictement le socle LOCKED sans invention.

## Sources de vérité (ordre obligatoire)

1. `2.9 DB`
2. `2.10 Events`
3. `2.11 OpenAPI`
4. `2.12 RBAC`
5. `SECTION 5 DoD`
6. `SECTION 7 no-code`
7. `SECTION 8 plan d'exécution`
8. `SECTION 9 substrate`
9. `SECTION 2 prompts backend`
10. `ERRATA V1.1`

Règle de conflit:

- Appliquer cet ordre.
- En cas de conflit narratif vs endpoint, `2.11 OpenAPI` prévaut (ERRATA V1.1).
- Si ambiguïté persistante: STOP et demander arbitrage.

## Garde-fous non négociables

- Une IA = un module = un lot.
- Aucune transversalité non validée.
- Stack backend verrouillée: API Node.js TypeScript, Node.js 20, `backend/` racine backend.
- Endpoints métiers en `/v1`.
- Erreurs standard: `400/401/403/404/409/422/429/500`.
- `Idempotency-Key` pour créations sensibles selon contrat OpenAPI.
- Toute mutation publie un event via `events_outbox`.
- Toute règle bloquante expose `422 business_rule_failed` et `blocking_reasons`.
- Multi-tenant strict: `tenant_id` token + RBAC explicite + isolation RLS.
- No-code orchestre uniquement; backend décide.
- Aucun event hors catalogue `2.10` (et addendum explicitement validé).

## Protocole de contexte minimal (anti-token)

## Entrées obligatoires avant run

- `lot_id`
- `module_id`
- `module_scope`: endpoints + tables + events + règles RBAC attendues

Si une entrée manque:

- STOP.
- Produire uniquement une demande de clarification ciblée.

## Pack documentaire minimal à charger

1. Prompt module dans `SECTION 2` (bloc exact du module).
2. Extraits tables dans `2.9` pour le module.
3. Extraits events dans `2.10` pour le module.
4. Extraits endpoints dans `2.11` (+ `2.11.A` si schéma d'exécution manquant).
5. Extraits RBAC dans `2.12` pour les endpoints du module.
6. Gates lot dans `SECTION 8` + checklist lot dans `SECTION 6`.
7. Conventions runtime dans `SECTION 9` (migrations, outbox, tests, env, CI).
8. `ERRATA V1.1` uniquement si conflit détecté.

Interdiction:

- Lire "tout le repo" par défaut.
- Charger des sections hors module sans besoin explicite.

## Séquence d'exécution obligatoire

1. Produire `Module Header`.
2. Produire `Matrice d'alignement`.
3. Produire `Plan d'exécution`.
4. Implémenter le code strictement dans le périmètre autorisé.
5. Exécuter les checks obligatoires.
6. Produire le `Patch Pack` final.

Si 1/2/3 absents:

- Ne pas coder.

## File change budget (par défaut)

Autorisé:

- `backend/modules/**`
- `backend/shared/**`
- `backend/migrations/**`
- `backend/tests/**`
- docs minimales requises par synchronisation contractuelle

Interdit sans arbitrage explicite:

- changer structure racine du repo
- modifier CI/scripts de contrôle
- modifier un document LOCKED hors impact strict du module

## Conflit gate (obligatoire)

Déclencher STOP si:

- endpoint/table/event requis absent des contrats
- divergence OpenAPI/Events/DB/RBAC non arbitrée
- besoin hors module
- changement hors file change budget

Sortie attendue en cas de STOP:

- matrice de conflit (demande vs contrat)
- impact
- option conforme proposée

## Checks obligatoires avant fin

- `bash scripts/run_doc_check.sh`
- `bash scripts/substrate_check.sh`
- `bash scripts/notion_section10_check.sh`
- `bash scripts/notion_lots_modules_check.sh`

## Format de sortie final

- `Patch Pack` standardisé:
- fichiers modifiés/créés
- commandes exécutées + résultats
- endpoints livrés
- events publiés
- migrations ajoutées
- risques résiduels et next steps dans le même lot/module

## Templates fournis

- `documentation/ai/templates/IA_RUN_REQUEST_TEMPLATE.md`
- `documentation/ai/templates/MODULE_HEADER_TEMPLATE.md`
- `documentation/ai/templates/ALIGNMENT_MATRIX_TEMPLATE.md`
- `documentation/ai/templates/EXECUTION_PLAN_TEMPLATE.md`
- `documentation/ai/templates/CONFLICT_GATE_TEMPLATE.md`
- `documentation/ai/templates/PATCH_PACK_TEMPLATE.md`
