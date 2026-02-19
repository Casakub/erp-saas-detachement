# 6 8 — CHECKLIST — LOT 8 IA (RISK, CERTIFICATION, MARKETPLACE)

- Statut: DRAFT
- Portée: checklist structurelle du lot 8.
- Règles:
- Squelette documentaire uniquement.
- Aucun ajout de logique métier.
- Aucune modification des documents contractuels LOCKED.
- Références SOCLE (justification d'existence):
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:501`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:537`

## Scope (SOCLE)

- Le Lot 8 couvre explicitement `M11` et `M12` (marketplace, risk, certification, ranking/gating) selon SOCLE (`...LOCKED...md:537-541`, `...LOCKED...md:267`, `...LOCKED...md:277`).
- No contract changes; checklist only.

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope (yes/no) | Notes |
| --- | --- | --- | --- |
| M11 | Marketplace (Catalogue + RFP Externe) | yes | Cœur marketplace du lot 8. |
| M12 | Risk & Certification | yes | Cœur risk/certification du lot 8. |
| M8 | Conformité Détachement | no | Fournit des signaux en entrée mais n'est pas livré par ce lot. |
| M10 | Finance (Devis / Factures / Commissions) | no | Finance reste portée par le Lot 6. |
| M13 | i18n & Comms | no | Module transverse, pas un lot autonome ici. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé
- [ ] Lot 2 validé
- [ ] Lot 3 validé
- [ ] Lot 4 validé
- [ ] Lot 5 validé
- [ ] Lot 6 validé
- [ ] Lot 7 validé

## Livrables obligatoires

- [ ] DB / migrations
- [ ] Events (2.10)
- [ ] OpenAPI (2.11)
- [ ] RBAC (2.12)
- [ ] Tests (unit, integration, RBAC, multi-tenant)
- [ ] Audit & outbox

## Ready-to-code gate

- [ ] Gate ready-to-code validée

## Notes de traçabilité

- Contrats référencés: SOCLE V1 LOCKED + 2.9 DB + 2.10 Events + 2.11 OpenAPI + 2.12 RBAC.
- Artefacts attendus: checklist lot, ancrage modules M11/M12, preuves de cohérence contractuelle.

## Out of scope (SOCLE)

- M2/M3/M4 (CRM/Clients/RFP) relèvent du Lot 4.
- M5/M6 (ATS/Workers) relèvent du Lot 5.
- M8 extension rémunération relève du Lot 7.
- M13 i18n & Comms is transverse; not delivered as a standalone Lot checklist here; referenced in SECTION 10.A; integration points handled when each Lot ships UI/emails/docs.

## Non-goals / Out of scope

- Définir le contenu métier du lot.
- Définir des exceptions de contrat.
- Ajouter des règles hors périmètre documentaire.

## Mini-changelog

- 2026-02-18: création du squelette documentaire (sans contenu métier).
- 2026-02-18: ancrage explicite Lot 8 -> modules M11/M12 (SOCLE), sans changement contractuel.
