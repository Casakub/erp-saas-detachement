# 6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)

**Statut** : PARTIAL
**Version** : 1.1
**Date** : 2026-02-19
**Objectif** : cadrer l'exécution M7.T/M7bis avec anchors contractuels explicites (2.10/2.11/2.12), sans ajout de logique métier.

## 6.3.1 Scope (SOCLE)

- Module principal: `M7.T` (timesheets).
- Module mobile associé: `M7bis` (worker app PWA).
- Référence plan lots: `SOCLE ...44ea.md:511-516`.

## 6.3.2 OpenAPI anchors (2.11)

- `POST /v1/missions/{mission_id}/timesheets` (`...2 11...md:422`)
- `POST /v1/timesheets/{timesheet_id}/entries` (`...2 11...md:444`)
- `POST /v1/timesheets/{timesheet_id}:submit` (`...2 11...md:466`)
- `POST /v1/timesheets/{timesheet_id}:validate` (`...2 11...md:489`)
- `POST /v1/timesheets/{timesheet_id}:reject` (`...2 11...md:519`)

`operationId`: non spécifié dans le document LOCKED 2.11.

### 6.3.2.a CONTRACT GAP — check-in/check-out mobile

- Recherche 2.11: aucune route `check-in/check-out` trouvée (`check-in`, `check_in`, `check-out`, `check_out`, `attendance`, `presence`, `punch`, `clock`).
- Scope dérivé: check-in/check-out reste hors contrat OpenAPI V1 actuel (STOP / V2 tant que non contractualisé).

## 6.3.3 Events anchors (2.10)

- `TimesheetCreated` (`...2 10 EVENTS...md:276`)
- `TimesheetEntryAdded` (`...2 10 EVENTS...md:283`)
- `TimesheetSubmitted` (`...2 10 EVENTS...md:262`)
- `TimesheetValidated` (`...2 10 EVENTS...md:269`)
- `TimesheetRejected` (`...2 10 EVENTS...md:290`)
- `WorkerCheckEventRecorded` (`...2 10 EVENTS...md:255`) — event présent, endpoint API absent en 2.11 (contract gap ci-dessus).

## 6.3.4 RBAC anchors (2.12)

- `POST /missions/{id}/timesheets` (`...2 12...md:99`)
- `POST /timesheets/{id}/entries` (`...2 12...md:100`)
- `POST /timesheets/{id}:submit` (`...2 12...md:101`)
- `POST /timesheets/{id}:validate` (`...2 12...md:102`)
- `POST /timesheets/{id}:reject` (`...2 12...md:103`)

Résumé dérivé (sans nouvelle règle):
- Allowed: `tenant_admin`, `agency_user` sur création/validation/rejet; `worker` limité à `entries` et `submit` en own scope.
- Forbidden: `worker` sur validation/rejet; `consultant` hors mutations timesheets; `client_user` seulement cas explicite sur reject (`si double validation activée`).

## 6.3.5 Acceptance Tests (GWT) — Derived

- Référence centrale: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`.
- Given une mission avec `can_validate_timesheets=false`, When `POST /v1/timesheets/{timesheet_id}:validate`, Then `422 timesheet_validation_blocked` + `blocking_reasons` (`SECTION 10.E:65-73`).
- Given une timesheet d'un autre tenant, When validation/rejet est tentée, Then refus cross-tenant (`SECTION 10.E:83-84`).
- Given une mission conforme et timesheet validée, When transition vers billing status, Then publication `TimesheetBillingStatusChanged` (`SECTION 10.E:115-118`).
- TODO: CONTRACT GAP — scénarios GWT check-in/check-out absents de `SECTION 10.E`.

## 6.3.6 Décisions structurantes (LOCKED)

- [x] Modèle temps: Daily entries + soumission hebdomadaire.
- [x] Validation: Client + Agence (double validation, selon RBAC).
- [x] Mobile: PWA online only (V1).

## 6.3.7 Interdictions strictes

- [ ] Aucune logique de rémunération.
- [ ] Aucun calcul de paie.
- [ ] Aucune décision conformité.
- [ ] Aucune logique critique côté mobile.
- [ ] Aucun offline complexe (V1).

## 6.3.8 Validation finale

- [ ] Tests unitaires
- [ ] Tests intégration
- [ ] Tests RBAC
- [ ] Tests multi-tenant
- [ ] Review via SECTION 2.C

## 6.3.9 Impact & Changelog (docs-only)

- Impact: anchors OpenAPI/Events/RBAC explicités.
- Contract gap explicite sur check-in/check-out API non présent en 2.11.
- Aucun endpoint/event/permission ajouté hors contrats LOCKED.

## Changelog doc

- 2026-02-18: Alignement référentiel Lot 3 sur modules canoniques (M7.T, M7bis) et events 2.10, sans changement métier.
- 2026-02-19: patch P0 executable-spec (anchors + GWT dérivés + contract gap check-in/out), sans changement métier.
