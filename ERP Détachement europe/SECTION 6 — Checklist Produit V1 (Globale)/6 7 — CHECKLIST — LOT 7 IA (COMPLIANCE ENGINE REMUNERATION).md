# 6 7 — CHECKLIST — LOT 7 IA (COMPLIANCE ENGINE REMUNERATION)

- Statut: DRAFT
- Portée: checklist structurelle du lot 7.
- Règles:
- Squelette documentaire uniquement.
- Aucun ajout de logique métier.
- Aucune modification des documents contractuels LOCKED.
- Références SOCLE (justification d'existence):
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:501`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:532`

## Scope (SOCLE)

- Le Lot 7 couvre explicitement l'extension du moteur conformité rémunération dans `M8` (salary engine, snapshots immuables, explicabilité) selon SOCLE (`...LOCKED...md:532-536`, `...LOCKED...md:213`).
- Note de cadrage V2: les éléments d'automatisation V2 restent hors de cette checklist lot lorsqu'ils ne sont pas explicitement demandés en V1.
- No contract changes; checklist only.

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope (yes/no) | Notes |
| --- | --- | --- | --- |
| M8 | Conformité Détachement (Compliance Case) | yes | Extension rémunération/compliance du lot 7. |
| M10 | Finance (Devis / Factures / Commissions) | no | Finance reste portée par le Lot 6. |
| M11 | Marketplace | no | Marketplace/risk relèvent du Lot 8. |
| M12 | Risk & Certification | no | Marketplace/risk relèvent du Lot 8. |
| M13 | i18n & Comms | no | Module transverse, pas un lot autonome ici. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé
- [ ] Lot 2 validé
- [ ] Lot 3 validé
- [ ] Lot 4 validé
- [ ] Lot 5 validé
- [ ] Lot 6 validé

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
- Artefacts attendus: checklist lot, ancrage module M8, preuves de cohérence contractuelle.

## Out of scope (SOCLE)

- M2/M3/M4 (CRM/Clients/RFP) relèvent du Lot 4.
- M5/M6 (ATS/Workers) relèvent du Lot 5.
- M11/M12 (risk/certification/marketplace) relèvent du Lot 8.
- M13 i18n & Comms is transverse; not delivered as a standalone Lot checklist here; referenced in SECTION 10.A; integration points handled when each Lot ships UI/emails/docs.

## Non-goals / Out of scope

- Définir le contenu métier du lot.
- Définir des exceptions de contrat.
- Ajouter des règles hors périmètre documentaire.

## Mini-changelog

- 2026-02-18: création du squelette documentaire (sans contenu métier).
- 2026-02-18: ancrage explicite Lot 7 -> module M8 (SOCLE), sans changement contractuel.
