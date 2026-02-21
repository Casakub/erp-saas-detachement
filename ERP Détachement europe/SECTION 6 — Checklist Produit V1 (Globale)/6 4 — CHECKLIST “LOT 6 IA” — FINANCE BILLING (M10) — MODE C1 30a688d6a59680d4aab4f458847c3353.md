# 6.4 — CHECKLIST “LOT 6 IA” — FINANCE / BILLING (M10) — MODE C1

**Statut** : READY
**Version** : 1.3
**Date** : 2026-02-19
**Objectif** : ancrer Lot 6 sur les contrats LOCKED (OpenAPI/Events/RBAC). `POST /v1/invoices:from-timesheet` est actif en V1 (décision OWNER 2026-02-20, ERRATA V1.1 §3b).

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

## 6.4.3 Décision OWNER — `POST /v1/invoices:from-timesheet` actif en V1 (2026-02-20)

- **Décision OWNER (2026-02-20)** : `POST /v1/invoices:from-timesheet` est **actif en V1** sans feature flag.
- **Source** : ERRATA V1.1 §3b + SECTION 10.F (ligne matrice mise à jour) — OpenAPI 2.11 LOCKED fait foi.
- **Conséquence** : toute mention antérieure "feature flag OFF" ou "V2 uniquement" relative à cet endpoint est **caduque**.
- **Lot 6 statut** : passe de PARTIAL → **READY**.
- Aucun changement contractuel dans 2.11 : l'endpoint était déjà LOCKED et présent.

## 6.4.4 Events anchors (LOCKED 2.10)

- `InvoiceIssued` (`...2 10 EVENTS...md:394`)
- `InvoiceDraftCreated` (`...2 10 EVENTS...md:401`)
- `InvoiceBlocked` (`...2 10 EVENTS...md:408`)
- `InvoiceVoided` (`...2 10 EVENTS...md:415`)
- `PaymentRecorded` (`...2 10 EVENTS...md:422`)
- `ConsultantCommissionCalculated` (`...2 10 EVENTS...md:429`)
- `TimesheetBillingStatusChanged` (`...2 10 EVENTS...md:507`)

## 6.4.5 RBAC anchors (LOCKED 2.12 + V1.2.1 patch policy)

- `POST /invoices:from-timesheet` (`...2 12...md:111`)
- `POST /invoices/{id}:issue` (`...2 12...md:112`)
- `POST /invoices/{id}:block` (`...2 12...md:113`)
- `POST /invoices/{id}:void` (`...2 12...md:114`)
- `PATCH /timesheets/{id}/billing-status` (`...2 12...md:115`)
- `POST /payments` (`...2 12...md:123`)

Résumé dérivé (sans nouvelle règle):
- Allowed: `tenant_admin` et `agency_user` sur création/émission/paiement.
- Forbidden: `consultant`, `client_user`, `worker`; `agency_user` interdit sur `block`/`void`.
- V1.2.1 patch n'ajoute pas de nouvelle route M10; la note porte uniquement sur la politique d'activation V1/V2.

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
- Contradiction SOCLE/OpenAPI résolue par décision OWNER Q1 (ERRATA V1.1 §3b) — feature flag OFF caduc.
- Nouveaux events V1.2.2 : `QuoteCreated`, `CommissionApproved` (décisions Q1-Q4, surfaces M10 V1.2.2).
- Aucun changement contractuel dans 2.11 LOCKED.


## 6.4.9 Surfaces M10 V1.2.2 (décisions OWNER 2026-02-20)

Nouveaux events (addendum 2.10.4.11, DRAFT) :

- `QuoteCreated` (Producer: M10) — déclenché sur `POST /v1/quotes`
- `CommissionApproved` (Producer: M10) — déclenché sur `PATCH /v1/commissions/{id}/status` → `approved`

Nouveaux endpoints V1.2.2 (2.11.a patch) à implémenter dans ce lot :

| Endpoint | Rôles autorisés | Notes |
| --- | --- | --- |
| `POST /v1/quotes` | `tenant_admin`, `agency_user` | Création devis |
| `PATCH /v1/quotes/{id}` | `tenant_admin`, `agency_user` | Modification devis |
| `POST /v1/quotes/{id}:send` | `tenant_admin`, `agency_user` | Envoi devis au client |
| `POST /v1/quotes/{id}:accept` | `tenant_admin`, `agency_user`, `client_user` (si flag=full) | Validation devis (Q4-C) |
| `GET /v1/quotes/{id}` | `tenant_admin`, `agency_user`, `consultant` (scoped), `client_user` (own) | Lecture |
| `GET /v1/invoices/{id}/commissions` | `tenant_admin`, `agency_user` | Lecture commissions |
| `PATCH /v1/commissions/{id}/status` | `tenant_admin` uniquement | Approbation commission |
| `POST /v1/accounting-exports` | `tenant_admin`, `agency_user` | Export CSV compta V1 |
| `GET /v1/accounting-exports/{id}` | `tenant_admin`, `agency_user` | Lecture export |

Note: `client_user` sur `POST /v1/quotes/{id}:accept` conditionné au flag `tenant_settings.modules.client_portal.level = full` (décision Q4-C).

## Changelog doc

- 2026-02-17: Création checklist Lot 6 (Finance/Billing), sans changement métier.
- 2026-02-19: patch P0 executable-spec (anchors + GWT dérivés + note d'arbitrage V1/V2), sans changement métier.
- 2026-02-19: alignement V1.2.1 (feature flag OFF V1 pour invoices-from-timesheet), Lot 6 PARTIAL documented & acceptable.
- 2026-02-20: décision OWNER Q1 — feature flag OFF caduc, `from-timesheet` actif V1, statut PARTIAL → READY. Surfaces M10 V1.2.2 (quotes/commissions/accounting-exports) ajoutées (2.11.a patch V1.2.2). Events QuoteCreated + CommissionApproved référencés.
