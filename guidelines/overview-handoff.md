# Overview - Handoff Contract For Figma Make

## Goal

- Produire un handoff exploitable par les IA backend sans relecture complete du repo.

## Required Fields Per Screen

- `screen_id`
- `screen_name`
- `lot_id`
- `module_id`
- `persona`
- `states` (inclure `NORMAL`, `WARNING`, `BLOCKED` si ecran critique)
- `components_reused`
- `components_created`
- `api_reads_if_known`
- `api_writes_if_known`
- `events_expected_if_known`
- `constraints_v1`

## Quality Bar

- Les noms doivent etre stables et coherents.
- Les actions bloquees doivent avoir un message lisible.
- Les composants doivent pointer vers le registre reuse.
