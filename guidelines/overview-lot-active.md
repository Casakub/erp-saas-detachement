# Overview - Lot Active Scope

## Active By Default

- lot_id: `Lot 1`
- module_id: `M1`
- module_name: `Foundation (Tasks)`

## Endpoints In Scope

- `POST /v1/tasks`
- `PATCH /v1/tasks/{task_id}/status`
- `GET /v1/tasks`

## Data And Events In Scope

- Tables: `tasks`, `events_outbox`, `audit_logs`
- Events: `TaskCreated` (producer `M1`), `TaskStatusChanged` (producer `M1`)

## RBAC In Scope

- `tenant_admin`, `agency_user`, `consultant`

## Design Implications

- Produire UI de liste, creation et changement de statut des tasks.
- Representer etats `NORMAL`, `WARNING`, `BLOCKED` sans logique metier.
- Prevoir messages de blocage lisibles (pas de calcul local).

## Out Of Scope

- Tout endpoint M1 non present dans le scope ci-dessus.
- Toute extension multi-module sans arbitrage explicite.
- Toute fonctionnalite V2.

## How To Switch Lot

1. Mettre a jour ce fichier avec le lot/module valide.
2. Mettre a jour `guidelines/overview-screen-module-map.md` pour le lot cible.
3. Mettre a jour les references run dans `documentation/ai/runs/...`.
4. Re-lancer un controle de coherence documentaire.
