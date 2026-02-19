# SECTION 10.B — RÔLES & PERMISSIONS (INDEX)

- Statut: DRAFT
- Portée: index structurel des rôles et permissions RBAC V1, avec navigation vers la source contractuelle.
- Règles:
- Page d'index uniquement.
- Aucun ajout de permission ou de règle métier.
- Le contrat RBAC 2.12 reste la seule source normative.

## Références sources (justification d'existence)

- SOCLE point 10 (A..F): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:556`
- SOCLE point 10.B (Rôles & permissions): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:559`
- Rôles officiels V1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md:17`
- Principes sécurité RBAC: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md:30`

Alias utilisés dans cette page:
- `RBAC` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md`
- `OPENAPI` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`

## Positionnement

- Cette page est un point d'accès structurel de SECTION 10.
- Cette page ne remplace pas la matrice RBAC contractuelle.
- Les permissions effectives se lisent uniquement dans `RBAC`.

## Source contractuelle (lien)

- [2.12 — RBAC & PERMISSIONS (MATRIX) — V1](SOCLE%20TECHNIQUE%20GELE%CC%81%20%E2%80%94%20V1%20(LOCKED)/2%2012%20%E2%80%94%20RBAC%20&%20PERMISSIONS%20(MATRIX)%20%E2%80%94%20V1%20308688d6a596802d8e81c1623900db41.md)

## Rôles officiels (index)

| Role | Description source | Référence |
| --- | --- | --- |
| tenant_admin | Administrateur du tenant (agence) | `RBAC:21` |
| agency_user | Utilisateur opérationnel agence | `RBAC:22` |
| consultant | Prospection / RFP / allocation | `RBAC:23` |
| client_user | Client final (lecture limitée) | `RBAC:24` |
| worker | Intérimaire (PWA mobile-first) | `RBAC:25` |
| system | Jobs internes / enforcement / batch | `RBAC:26` |

## Parcours par rôle (index de lecture)

| Role | Happy path (index) | Actions interdites / limites | Références |
| --- | --- | --- | --- |
| tenant_admin | Mission -> Compliance -> Enforcement, puis Timesheet -> Invoice -> Payment, puis CRM/RFP/allocation. | Aucun droit cross-tenant; toute action reste tenant-scoped. | `RBAC:32`, `RBAC:47`, `RBAC:111`, `OPENAPI:14` |
| agency_user | Opérations quotidiennes mission/compliance/timesheets/facturation/paiement dans le tenant. | Ne peut pas appeler `enforcement:evaluate` ni `invoice:block`/`invoice:void`. | `RBAC:87`, `RBAC:113`, `RBAC:114` |
| consultant | Prospection, RFP, allocation, création mission, lecture enforcement/compliance selon périmètre. | Pas d'écriture rémunération, pas d'enforcement, pas de facturation/paiement. | `RBAC:47`, `RBAC:77`, `RBAC:86`, `RBAC:111` |
| client_user | Lecture limitée mission/compliance/enforcement; cas spécifique `timesheet:reject` si double validation activée. | Aucune écriture métier critique; pas de décisions enforcement ni émission facture. | `RBAC:33`, `RBAC:86`, `RBAC:103`, `RBAC:180` |
| worker | Actions limitées à son périmètre (`timesheet entries`, `timesheet submit`, lecture own requirements). | Pas d'accès enforcement; aucune écriture métier critique hors périmètre propre. | `RBAC:100`, `RBAC:101`, `RBAC:59`, `RBAC:180` |
| system | Endpoints techniques explicitement autorisés (enforcement evaluate, batch expirations, recalcul snapshots). | Toute action non listée dans les règles finales est hors périmètre. | `RBAC:181`, `RBAC:185` |

## Index des parcours RBAC

| Parcours | Portée | Référence RBAC |
| --- | --- | --- |
| Parcours 1 | Mission -> Compliance Case -> Enforcement | `RBAC:39` |
| Parcours 3 | Timesheet -> Invoice -> Payment | `RBAC:91` |
| Parcours 2 | CRM -> RFP -> Allocation | `RBAC:127` |
| Tasks & Agency Profile | Endpoints transverses V1.1 | `RBAC:158` |

## Pointeurs de navigation

- Hub SECTION 10: `ERP Détachement europe/SECTION 10 — META STRUCTURE PRODUIT & GOUVERNANCE (INDEX) 30b688d6a59680e6967cd98ee0aa6a50.md`
- SECTION 10.A: `ERP Détachement europe/SECTION 10.A — PILIERS FONCTIONNELS (6 PILIERS ↔ M1..M13) 30b688d6a59680698d88fef0d6fa06f7.md`
- SECTION 10.C: `ERP Détachement europe/SECTION 10.C — DATA & LEGAL SOURCES REGISTER (IDCC + COUNTRY RULES) 30b688d6a596802fb409c572fc2d3892.md`
- SECTION 10.D: `ERP Détachement europe/SECTION 10.D — SECURITY BASELINE (HASHING, LOGS, ENCRYPTION, RETENTION, KEY ROTATION, INCIDENT, PII) 30b688d6a59680a698c4d882eaea9fd5.md`
- SECTION 10.E: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`
- SECTION 10.F: `ERP Détachement europe/SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1) 30b688d6a59680e78855eae07f3c9771.md`
- Contrat OpenAPI (contextualisation endpoints): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`

## Non-goals / Out of scope

- Définir des permissions nouvelles.
- Modifier la matrice RBAC 2.12.
- Ajouter des exceptions locales non présentes au contrat.
- Définir de la logique d'implémentation backend.

## Mini-changelog

- 2026-02-18: création du squelette d'index 10.B (sans contenu métier).
- 2026-02-18: complétion de l'index 10.B (rôles officiels, parcours par rôle, limites, navigation), sans changement contractuel.
