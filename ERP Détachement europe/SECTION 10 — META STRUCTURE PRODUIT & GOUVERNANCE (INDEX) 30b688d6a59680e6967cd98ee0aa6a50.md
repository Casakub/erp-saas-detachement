# SECTION 10 — META STRUCTURE PRODUIT & GOUVERNANCE (INDEX)

- Statut: DRAFT
- Scope: structure documentaire et gouvernance transverse (non-métier)

## Statut de gouvernance (SECTION 10)

- SECTION 10 est stable sur sa structure, mais strictement dérivée et non-contractuelle.
- Les sources de vérité restent uniquement: DB 2.9, Events 2.10, OpenAPI 2.11, RBAC 2.12.
- Toute évolution de SECTION 10 doit être dérivée des sources LOCKED, jamais l’inverse.
- SECTION 10 ne crée ni endpoint, ni event, ni permission, ni règle métier.
- SECTION 10 ne porte aucune logique exécutable.
- En cas d’écart entre SECTION 10 et les contrats, les contrats priment sans exception.
- Toute mise à jour doit préserver la traçabilité vers les références contractuelles.
- Toute proposition sans ancrage contractuel explicite est hors périmètre.

## 1) Pourquoi SECTION 10 existe

- SECTION 10 matérialise les modèles transverses exigés par le SOCLE point 10.
- Référence SOCLE: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:556`.
- L'absence de pages SECTION 10 requises rend la documentation incomplète.

## 2) Positionnement dans le système documentaire

- SECTION 10 est transverse.
- SECTION 10 est non-métier.
- SECTION 10 est non-exécutable.
- SECTION 10 n'écrase pas les contrats LOCKED.

Contrats qui priment:
- DB (2.9)
- Events (2.10)
- OpenAPI (2.11)
- RBAC (2.12)

## 3) Contenu SECTION 10

| Code | Title | Purpose (1 line) | Status | Link |
| --- | --- | --- | --- | --- |
| 10.A | PILIERS FONCTIONNELS | Index de mapping piliers vers modules. | DRAFT | [SECTION 10.A — PILIERS FONCTIONNELS (6 PILIERS ↔ M1..M13)](SECTION%2010.A%20%E2%80%94%20PILIERS%20FONCTIONNELS%20(6%20PILIERS%20%E2%86%94%20M1..M13)%2030b688d6a59680698d88fef0d6fa06f7.md) |
| 10.B | RÔLES & PERMISSIONS | Point d'accès structurel vers la source RBAC contractuelle. | DRAFT | [SECTION 10.B — RÔLES & PERMISSIONS (INDEX)](SECTION%2010.B%20%E2%80%94%20R%C3%94LES%20&%20PERMISSIONS%20(INDEX)%2030b688d6a59680aa9271e0b904b76d93.md) |
| 10.C | DATA & LEGAL SOURCES REGISTER | Registre documentaire des sources et versions. | DRAFT | [SECTION 10.C — DATA & LEGAL SOURCES REGISTER (IDCC + COUNTRY RULES)](SECTION%2010.C%20%E2%80%94%20DATA%20&%20LEGAL%20SOURCES%20REGISTER%20(IDCC%20+%20COUNTRY%20RULES)%2030b688d6a596802fb409c572fc2d3892.md) |
| 10.D | SECURITY BASELINE | Index des rubriques de baseline sécurité. | DRAFT | [SECTION 10.D — SECURITY BASELINE (HASHING, LOGS, ENCRYPTION, RETENTION, KEY ROTATION, INCIDENT, PII)](SECTION%2010.D%20%E2%80%94%20SECURITY%20BASELINE%20(HASHING,%20LOGS,%20ENCRYPTION,%20RETENTION,%20KEY%20ROTATION,%20INCIDENT,%20PII)%2030b688d6a59680a698c4d882eaea9fd5.md) |
| 10.E | ACCEPTANCE TESTS (GWT) | Structure des scénarios Given/When/Then E2E. | DRAFT | [SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E](SECTION%2010.E%20%E2%80%94%20ACCEPTANCE%20TESTS%20(GIVEN%20WHEN%20THEN)%20%E2%80%94%20CHAINE%20CRITIQUE%20E2E%2030b688d6a59680adaadedb2ffea55aa7.md) |
| 10.F | MVP V1/V2 MATRIX | Matrice déclarative V1/V2 et exclusions V1. | DRAFT | [SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1)](SECTION%2010.F%20%E2%80%94%20MVP%20V1%20V2%20MATRIX%20(ASSISTE%20VS%20AUTO%20+%20EXCLUSIONS%20V1)%2030b688d6a59680e78855eae07f3c9771.md) |
| 10.P | Contracts patch V1.2 (DRAFT) | Patch contractuel dérivé pour combler les surfaces manquantes (OpenAPI + RBAC), sans remplacer V1 LOCKED. | DRAFT | [2 11 — OPENAPI V1.2 (PATCH)](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1.2%20(DRAFT)/2%2011%20%E2%80%94%20OPENAPI%20V1.2%20(PATCH)%20%E2%80%94%20SURFACES%20MANQUANTES%2031b688d6a59680d4a1b2c3d4e5f60701.md)<br>[2 12 — RBAC & PERMISSIONS (MATRIX) — V1.2 (PATCH)](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1.2%20(DRAFT)/2%2012%20%E2%80%94%20RBAC%20&%20PERMISSIONS%20(MATRIX)%20%E2%80%94%20V1.2%20(PATCH)%2031b688d6a59680d4a1b2c3d4e5f60702.md) |

## 4) Règles d'usage

Quand consulter SECTION 10:
- Pour naviguer entre modèles transverses A→F.
- Pour vérifier la complétude documentaire transverse.
- Pour localiser les pages d'index/gouvernance non-métier.

Quand ne pas utiliser SECTION 10:
- Pour implémenter des règles métier.
- Pour définir des contrats techniques.
- Pour décider de logique applicative.

## 5) Non-goals / Out of scope

- Définir des règles métier.
- Modifier les contrats LOCKED.
- Définir des calculs, seuils ou logiques d'exécution.
- Dupliquer le contenu SOCLE, DB, Events, OpenAPI ou RBAC.

## 6) Mini-changelog

- 2026-02-18: création de la page index SECTION 10 (structure et navigation).
- 2026-02-19: Changelog: sync smoke test (no contract change).
- 2026-02-19: Changelog: sync smoke test follow-up (no contract change).
- 2026-02-19: Changelog: sync hardening verification (no contract change).
