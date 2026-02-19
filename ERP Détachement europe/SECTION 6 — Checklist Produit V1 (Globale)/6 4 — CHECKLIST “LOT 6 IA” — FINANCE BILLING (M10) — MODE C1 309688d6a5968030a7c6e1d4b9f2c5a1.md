# 6.4 — CHECKLIST “LOT 6 IA” — FINANCE / BILLING (M10) — MODE C1

**Statut** : PARTIAL
**Version** : 1.1
**Date** : 2026-02-19
**Objectif** : ancrer Lot 6 sur les contrats LOCKED (OpenAPI/Events/RBAC) avec explicitation de l'ambiguïté V1/V2.

## 6.4.1 Décisions structurantes (LOCKED)

- [ ] Mode facturation: C1 (timesheets.billing_status = billed dès création d'une facture draft ou issued).
- [ ] Gating: interdiction d'émettre/créer une facture si `mission_enforcement_flags.can_issue_invoice = false`.
- [ ] Finance ≠ paie: aucun calcul rémunération/indemnités/minima ici.

## 6.4.2 OpenAPI anchors (2.11)

- `POST /v1/invoices:from-timesheet` (`...2 11...md:553`)
- `POST /v1/invoices/{invoice_id}:issue` (`...2 11...md:623`)
- `POST /v1/invoices/{invoice_id}:block` (`...2 11...md:650`)
- `POST /v1/invoices/{invoice_id}:void` (`...2 11...md:672`)
- `POST /v1/payments` (`...2 11...md:692`)
- `PATCH /v1/timesheets/{timesheet_id}/billing-status` (`...2 11...md:715`)

`operationId`: non spécifié dans le document LOCKED 2.11.

## 6.4.3 Contradiction V1/V2 — note d'arbitrage documentaire (non contractuelle)

- Endpoint exists in contract but is disabled/not used in V1 per SOCLE; V1 behaviour: manual invoice only; V2: invoice-from-timesheet activated.
- Sources: SOCLE `...44ea.md:259` vs OpenAPI `...2 11...md:553`.
- Cette note n'édite pas les contrats LOCKED; elle signale un arbitrage requis.

## 6.4.4 Events anchors (2.10)

- `InvoiceIssued` (`...2 10 EVENTS...md:394`)
- `InvoiceDraftCreated` (`...2 10 EVENTS...md:401`)
- `InvoiceBlocked` (`...2 10 EVENTS...md:408`)
- `InvoiceVoided` (`...2 10 EVENTS...md:415`)
- `PaymentRecorded` (`...2 10 EVENTS...md:422`)
- `ConsultantCommissionCalculated` (`...2 10 EVENTS...md:429`)
- `TimesheetBillingStatusChanged` (`...2 10 EVENTS...md:507`)

## 6.4.5 RBAC anchors (2.12)

- `POST /invoices:from-timesheet` (`...2 12...md:111`)
- `POST /invoices/{id}:issue` (`...2 12...md:112`)
- `POST /invoices/{id}:block` (`...2 12...md:113`)
- `POST /invoices/{id}:void` (`...2 12...md:114`)
- `PATCH /timesheets/{id}/billing-status` (`...2 12...md:115`)
- `POST /payments` (`...2 12...md:123`)

Résumé dérivé (sans nouvelle règle):
- Allowed: `tenant_admin` et `agency_user` sur création/émission/paiement.
- Forbidden: `consultant`, `client_user`, `worker`; `agency_user` interdit sur `block`/`void`.

## 6.4.6 Acceptance Tests (GWT) — Derived

- Référence centrale: `ERP Détachement europe/SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E 30b688d6a59680adaadedb2ffea55aa7.md`.
- Given `can_issue_invoice=false`, When `POST /v1/invoices:from-timesheet` ou `POST /v1/invoices/{invoice_id}:issue`, Then `422 invoice_issuance_blocked` avec `blocking_reasons` (`SECTION 10.E:88-95`).
- Given mission conforme + timesheet validée, When billing status est mis à jour, Then `TimesheetBillingStatusChanged` est publié (`SECTION 10.E:115-118`).
- Given ressource d'un autre tenant, When facturation/paiement est tenté, Then refus cross-tenant (`SECTION 10.E:105-106`, `SECTION 10.E:127-128`).

## 6.4.7 Validation finale Lot 6

- [ ] Tests unitaires OK
- [ ] Tests intégration OK
- [ ] Tests RBAC OK
- [ ] Tests multi-tenant OK
- [ ] Audit logs sur actions critiques (issue/block/void/payment)
- [ ] Outbox events publiés sur mutations

## 6.4.8 Impact & Changelog (docs-only)

- Impact: anchors OpenAPI/Events/RBAC + GWT dérivés ajoutés.
- Contradiction SOCLE/OpenAPI documentée sans modification des contrats LOCKED.
- Aucun endpoint/event/permission nouveau ajouté.

## Changelog doc

- 2026-02-17: Création checklist Lot 6 (Finance/Billing), sans changement métier.
- 2026-02-19: patch P0 executable-spec (anchors + GWT dérivés + note d'arbitrage V1/V2), sans changement métier.
