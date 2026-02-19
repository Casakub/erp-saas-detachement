# 6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)

**Statut** : READY
**Version** : 1.2
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

### 6.3.2.a Covered by V1.2.1 patch — check-in/check-out mobile

- Endpoint unique: `POST /v1/check-events` (`...V1.2 (DRAFT)/2 11 ...31b688d6...0701.md:116`).
- Le switch check-in/out est porté par `event_type = check_in|check_out` (`...0701.md:214`).
- Notes: V1 sans géolocalisation requise (`...0701.md:121`).

## 6.3.3 Events anchors (LOCKED 2.10)

- `TimesheetCreated` (`...2 10 EVENTS...md:276`)
- `TimesheetEntryAdded` (`...2 10 EVENTS...md:283`)
- `TimesheetSubmitted` (`...2 10 EVENTS...md:262`)
- `TimesheetValidated` (`...2 10 EVENTS...md:269`)
- `TimesheetRejected` (`...2 10 EVENTS...md:290`)
- `WorkerCheckEventRecorded` (`...2 10 EVENTS...md:255`)

## 6.3.4 RBAC anchors (LOCKED 2.12 + V1.2.1 patch)

- `POST /missions/{id}/timesheets` (`...2 12...md:99`)
- `POST /timesheets/{id}/entries` (`...2 12...md:100`)
- `POST /timesheets/{id}:submit` (`...2 12...md:101`)
- `POST /timesheets/{id}:validate` (`...2 12...md:102`)
- `POST /timesheets/{id}:reject` (`...2 12...md:103`)
- `POST /v1/check-events` (`...V1.2 (DRAFT)/2 12 ...31b688d6...0702.md:42`)

Résumé dérivé (sans nouvelle règle):
- Allowed: `tenant_admin`, `agency_user` sur création/validation/rejet; `worker` limité à `entries` et `submit` en own scope.
- Forbidden: `worker` sur validation/rejet; `consultant` hors mutations timesheets; `client_user` seulement cas explicite sur reject (`si double validation activée`).
- Sur check-events patch V1.2.1: `tenant_admin`, `agency_user`, `worker` autorisés; autres interdits (`...0702.md:42`).

## 6.3.5 Acceptance Tests (GWT)

- Référence centrale: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`.
- Given un `worker` sur sa mission, When `POST /v1/check-events` avec `event_type=check_in`, Then 2xx + enregistrement d'un check-event.
- Given un `worker` tentant un `check_in` sur mission hors scope, When `POST /v1/check-events`, Then refus (tenant/ownership scope).
- Given `agency_user` sur mission du tenant, When `POST /v1/check-events` avec `event_type=check_out`, Then 2xx + event `WorkerCheckEventRecorded`.
- Given une mission avec `can_validate_timesheets=false`, When `POST /v1/timesheets/{timesheet_id}:validate`, Then `422 timesheet_validation_blocked` + `blocking_reasons` (`SECTION 10.E:65-73`).
- Given une timesheet d'un autre tenant, When validation/rejet est tentée, Then refus cross-tenant (`SECTION 10.E:83-84`).
- Given une mission conforme et timesheet validée, When transition vers billing status, Then publication `TimesheetBillingStatusChanged` (`SECTION 10.E:115-118`).

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
- Check-in/check-out API couvert par patch V1.2.1 (`POST /v1/check-events`).
- Aucun endpoint/event/permission ajouté hors contrats LOCKED.

## Changelog doc

- 2026-02-18: Alignement référentiel Lot 3 sur modules canoniques (M7.T, M7bis) et events 2.10, sans changement métier.
- 2026-02-19: patch P0 executable-spec (anchors + GWT dérivés + contract gap check-in/out), sans changement métier.
- 2026-02-19: réalignement V1.2.1 (check-events couvert OpenAPI/RBAC + GWT check-in/out), docs-only.
