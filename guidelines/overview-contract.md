# Overview - Contract Rules For Design

## Purpose

- Donner a Figma Make un cadre court et exploitable.
- Garantir la coherence avec le socle LOCKED sans charger toute la doc a chaque prompt.

## Non Negotiable Rules

- Multi-tenant: la UI ne contourne jamais l'isolation tenant.
- Contract-first: les contrats OpenAPI/Events/DB/RBAC priment.
- Backend-only decisions: aucun calcul critique en design/no-code.
- Auditability: ecrans et etats doivent etre explicables.

## Error And State Representation

- Les blocages metier sont affiches clairement en `BLOCKED`.
- Les avertissements sont affiches en `WARNING`.
- Les parcours normaux restent lisibles en `NORMAL`.
- La UI n'invente pas les regles qui menent a ces etats.

## No-code Boundary

- Autorise: orchestration (notifications, exports, relances, PDF).
- Interdit: calcul de conformite, scoring decisionnel, enforcement.

## MVP V1 Boundaries

- PWA worker online-only.
- Marketplace assistee en V1.
- Pas de mode auto-allocation en V1.
