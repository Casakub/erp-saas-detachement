# Overview - Screen To Module Map

## Rule

- Chaque ecran doit etre rattache a un module explicite (`M1..M13`, `M7bis`).
- Si le module n'est pas clair: STOP et demander arbitrage.

## Core Mapping (V1)

| Screen family | Module | Notes |
| --- | --- | --- |
| Task list, task create, task status | M1 | Scope actif Lot 1 |
| CRM pipeline, leads, lead detail | M2 | Lot 4 |
| Clients, vigilance docs, client detail | M3 | Lot 4 |
| RFP interne, allocation assistee | M4 | Lot 4 |
| Jobs ATS, candidatures, scoring explain | M5 | Lot 5 |
| Worker profile, docs worker | M6 | Lot 5 |
| Missions desktop (lifecycle) | M7 | Lot 2 |
| Timesheets flows | M7.T | Lot 3 |
| Worker mobile app flows | M7bis | Lot 3 |
| Compliance, enforcement, remuneration | M8 | Lot 7 |
| Vault files and access logs | M9 | Lot 1/2 |
| Quotes, invoices, payments, commissions | M10 | Lot 6 |
| Marketplace catalogue and access | M11 | Lot 8 |
| Risk, certification, ranking | M12 | Lot 8 |
| Cross-cutting settings and orchestration UI | M13 | Selon scope valide |

## State Mapping Rule

- Tout ecran critique doit documenter:
- etat `NORMAL`
- etat `WARNING`
- etat `BLOCKED`

## Handoff Minimum Per Screen

- `screen_id`
- `lot_id`
- `module_id`
- `persona`
- `states`
- `notes_backend_constraints`
