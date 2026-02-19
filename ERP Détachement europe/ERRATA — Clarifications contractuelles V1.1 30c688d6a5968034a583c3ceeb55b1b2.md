# ERRATA — Clarifications contractuelles V1.1

Statut: DRAFT (LOCK REQUIRED)
Applicabilité: immédiate comme note de cohérence documentaire
Portée: clarification contractuelle sans changement métier

## 1) Objet

- Résoudre une contradiction documentaire constatée entre le SOCLE consolidé et l’OpenAPI V1.
- Conserver l’intégrité des documents LOCKED (2.9/2.10/2.11/2.12) sans les modifier.

## 2) Règle de priorité documentaire en cas de conflit

- En cas de conflit entre une mention narrative du SOCLE consolidé et un endpoint contractuel de l’OpenAPI V1, le contrat OpenAPI 2.11 prévaut pour l’exécution V1.1.
- Cette priorité s’applique uniquement à la résolution de cohérence documentaire et n’introduit aucune nouvelle fonctionnalité métier.

## 3) Clarification explicite (applicable immédiatement)

- Dans V1.1 gelé, la facturation depuis timesheets est bien incluse (Mode C1) via /v1/invoices:from-timesheet.

## 4) Impact documentaire (références)

| Document | Référence | Constat |
| --- | --- | --- |
| SOCLE TECHNIQUE GELÉ — V1 (LOCKED) | `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:259` | Mention narrative indiquant facturation depuis timesheets en V2 |
| 2.11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 | `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md:553` | Endpoint contractuel V1 `POST /v1/invoices:from-timesheet` |

## 5) Non-impact métier

- Aucun changement métier.
- Aucune modification de périmètre fonctionnel.
- Correction de cohérence documentaire uniquement.

## 6) Changelog doc

- 2026-02-18: Création errata V1.1 pour clarification de priorité contractuelle OpenAPI sur mention SOCLE contradictoire, sans changement métier.
