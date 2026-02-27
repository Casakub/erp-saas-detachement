# SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1)

- Statut: DRAFT
- Portée: synthétiser les distinctions V1/V2 explicitement présentes dans les sources.
- Règles:
- Matrice descriptive non contractuelle.
- Aucune fonctionnalité nouvelle.

## Références sources (justification d'existence)

- SOCLE point 10.F: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:563`
- Distinctions SIPSI/A1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:383`
- Distinctions mobile rémunération/offline: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:188`
- Distinctions finance export/connecteurs: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:253`
- Distinctions RFP allocation assistée/auto: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:407`
- Alias utilisés dans la matrice: `SOCLE` = chemin SOCLE ci-dessus, `OPENAPI` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`

## Matrice V1 / V2

| feature | V1 (assisté) | V2 (automatisé) | notes |
| --- | --- | --- | --- |
| SIPSI (déclaration détachement) | Formulaire + checklist + preuves (assisté) | Automatisation ciblée SIPSI | Source SOCLE `SOCLE:383`. |
| A1 | Tracking assisté (statuts, pièces, dates, relances) | Connecteurs pays si possible | Source SOCLE `SOCLE:391`, `SOCLE:392`. |
| Worker app: rémunération visible | Lecture rémunération déclarée et indemnités déclarées, sans calcul légal côté mobile | Lecture du snapshot rémunération | Source SOCLE `SOCLE:188`, principe backend décide `SOCLE:207`. |
| Worker app: mode offline | PWA online only | Offline read-only + synchronisation contrôlée | Source SOCLE `SOCLE:200`, `SOCLE:201`. |
| Check-in/Check-out mobile | Sans géolocalisation | Géolocalisation optionnelle | Source SOCLE `SOCLE:196`. |
| Exports comptables | Export CSV V1 | Connecteurs comptables V2 | Source SOCLE `SOCLE:253`. |
| RFP allocation | Attribution assistée | Allocation auto en phase suivante | Source SOCLE `SOCLE:406`, `SOCLE:407`. |
| Moteur conformité rémunération | Snapshot et conformité disponibles en V1 via M8/OpenAPI | Renforcement avancé planifié lot 7 | Sources SOCLE `SOCLE:335`, `SOCLE:532`; OpenAPI `OPENAPI:337`. |
| Facturation depuis timesheets | **Actif en V1** (Mode C1) via `POST /v1/invoices:from-timesheet` | V2 : automatisation étendue (règles de déclenchement auto) | Décision OWNER 2026-02-20 — ERRATA V1.1 §3b. OpenAPI 2.11 fait foi. |

## Décision arbitrée — Facturation depuis timesheets (OWNER 2026-02-20)

- **Décision OWNER** : endpoint `POST /v1/invoices:from-timesheet` **actif en V1** (Option A choisie).
- Référence : ERRATA V1.1 §3b.
- La mention "feature flag OFF" et "V2 uniquement" de la version précédente de cette page est **caduque**.
- **Aucun feature flag** requis : l'endpoint est opérationnel dès Lot 6.

## Non-goals / Out of scope

- Modifier la portée V1/V2 contractuelle.
- Déduire des automatisations non présentes dans les sources.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: matrice V1/V2 complétée à partir des distinctions explicites et ambiguïtés documentées.
- 2026-02-19: ajout de la note d'arbitrage documentaire V1/V2 sur invoice-from-timesheet, sans changement contractuel.
- 2026-02-20: décision OWNER Q1 — facturation depuis timesheets actif V1, suppression de la politique feature-flag OFF, ajout ligne matrice.
