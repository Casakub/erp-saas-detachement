# 6 6 — CHECKLIST — LOT 5 IA (ATS, WORKERS)

- Statut: DRAFT
- Portée: checklist structurelle du lot 5.
- Règles:
- Squelette documentaire uniquement.
- Aucun ajout de logique métier.
- Aucune modification des documents contractuels LOCKED.
- Références SOCLE (justification d'existence):
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:501`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:522`

## Scope (SOCLE)

- Le Lot 5 couvre explicitement `M5`, `M6` (ATS et Workers) selon le plan d'exécution SOCLE (`...LOCKED...md:522-526`) et le catalogue modules (`...LOCKED...md:145`, `...LOCKED...md:157`).
- No contract changes; checklist only.

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope (yes/no) | Notes |
| --- | --- | --- | --- |
| M5 | ATS (Annonces & Candidatures) | yes | Cœur ATS du lot 5. |
| M6 | Workers & Dossiers | yes | Cœur workers/documents du lot 5. |
| M2 | CRM Prospection | no | Relève du Lot 4. |
| M3 | Gestion Clients + Vigilance | no | Relève du Lot 4. |
| M13 | i18n & Comms | no | Module transverse, pas un lot autonome ici. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé
- [ ] Lot 2 validé
- [ ] Lot 3 validé
- [ ] Lot 4 validé

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
- Artefacts attendus: checklist lot, ancrage modules M5/M6, preuves de cohérence contractuelle.

## Out of scope (SOCLE)

- M2/M3/M4 (CRM/Clients/RFP) relèvent du Lot 4.
- M8 (compliance engine rémunération) relève du Lot 7.
- M11/M12 (risk/certification/marketplace) relèvent du Lot 8.
- M13 i18n & Comms is transverse; not delivered as a standalone Lot checklist here; referenced in SECTION 10.A; integration points handled when each Lot ships UI/emails/docs.

## Non-goals / Out of scope

- Définir le contenu métier du lot.
- Définir des exceptions de contrat.
- Ajouter des règles hors périmètre documentaire.

## Mini-changelog

- 2026-02-18: création du squelette documentaire (sans contenu métier).
- 2026-02-18: ancrage explicite Lot 5 -> modules M5/M6 (SOCLE), sans changement contractuel.
