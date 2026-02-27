# ERRATA — Clarifications contractuelles V1.1

Statut: LOCKED (2026-02-22)
Applicabilité: immédiate — document contractuellement contraignant
Portée: clarification contractuelle sans changement métier
Note de lock: ERRATA V1.1 était DRAFT depuis 2026-02-20 mais son contenu était déjà appliqué comme référence contractuelle. Lock effectué 2026-02-22 suite à audit fonctionnel (GAP-12). Aucun changement de contenu.

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

## 3b) Clarification 2 — Facturation depuis timesheets : actif en V1 (décision OWNER 2026-02-20)

- **Décision OWNER (2026-02-20)** : l'endpoint `POST /v1/invoices:from-timesheet` est **actif en V1** sans feature flag.
- **Source de décision** : §2 ci-dessus (OpenAPI 2.11 prime sur mention narrative SOCLE).
- **Conséquence** : toute mention "feature flag OFF" ou "V2 uniquement" relative à la facturation depuis timesheets dans SECTION 10.F et Lot 6 est caduque.
- **Lot 6 statut** : passe de PARTIAL → **READY**.
- **Aucun changement contractuel dans 2.11** : l'endpoint était déjà présent et LOCKED.

## 7) Clarification C2 — Mobile PWA : online-only en V1 (résolution SOCLE vs Checklist 6.0)

**Contradiction identifiée (audit 2026-02-22)** :
- SOCLE TECHNIQUE GELÉ V1 (LOCKED) §M13 : "PWA online-only (V1) — offline = V2"
- SECTION 6 — Checklist Globale 6.0 ligne 82 : "Offline partiel validé (lecture missions & documents)"

**Résolution par hiérarchie documentaire** : SOCLE (H1) prime sur Checklist 6.0 (H3).

**Décision confirmée** : La PWA worker est **online-only en V1**. L'item "Offline partiel validé" est reporté **V2**.

**Action documentaire** : Checklist 6.0 ligne 82 marquée V2 (correction effectuée 2026-02-22).

---

## 8) Clarification C3 — Section 2.10.4.11 : addendum events (résolution référence orpheline)

**Problème identifié (audit 2026-02-22)** :
Les documents `6.7` (ligne 41), `6.6`, `SECTION 9` référencent "2.10.4.11" comme source d'events
(`ComplianceDurationAlert`, `WorkerSkillAdded`) mais cette section n'existe pas dans `2.10 EVENTS MÉTIER V1 LOCKED`.

**Résolution** : Fichier patch `PATCH_EVENTS_2.10.4.11.md` créé dans `SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/`.
Ce patch fait autorité pour : `ComplianceDurationAlert`, `WorkerSkillAdded`, `SipsiDeclarationCreated`,
`SipsiDeclarationStatusChanged`, `ComplianceDossierExportRequested`, `ComplianceDossierExportCompleted`.

**Le document 2.10 LOCKED n'est pas modifié** — le patch est l'addendum officiel V1.2.2.

---

## 6) Changelog doc

- 2026-02-18: Création errata V1.1 — priorité contractuelle OpenAPI sur mention SOCLE contradictoire, sans changement métier.
- 2026-02-20: Ajout clarification 2 — facturation depuis timesheets actif V1 sans feature flag (décision OWNER Q1).
- 2026-02-22: LOCK effectué (était DRAFT depuis 2026-02-20). Ajout clarifications C2 (offline mobile V2) et C3 (section 2.10.4.11 addendum). Aucun changement de contenu existant.
