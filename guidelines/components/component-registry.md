# Components - Registry

## Purpose

- Eviter la recreation de composants deja existants.
- Garder un inventaire unique et exploitable par toutes les IA.

## Required Columns

| component_name | type | screens | lot_module | states | reuse_decision |
| --- | --- | --- | --- | --- | --- |
| ex: Button/Primary | variante | task-list, task-create | Lot1/M1 | default, hover, disabled | variante de Button/Base |

## Type Values

- `nouveau`
- `reutilise`
- `variante`

## Update Rule

- Toute creation/modification de composant doit mettre a jour ce registre.
