# 6.4 — CHECKLIST “LOT 6 IA” — FINANCE / BILLING (M10) — MODE C1

## A) Décisions structurantes (LOCKED)
[] Mode facturation : C1 (timesheets.billing_status = billed dès création d’une facture draft ou issued)
[] Gating : interdiction d’émettre/créer une facture si mission_enforcement_flags.can_issue_invoice = false
[] Finance ≠ paie : aucun calcul rémunération / indemnités / minimums ici

## B) Contrats obligatoires (références)
[] DB V1.1 (2.9) — LOCKED
[] Events métier V1.1 (2.10) — LOCKED
[] OpenAPI V1 (2.11) — LOCKED
[] RBAC matrix V1 (2.12) — LOCKED
[] DoD globale (SECTION 5)

## C) Périmètre M10 (V1)
[] Invoices:from-timesheet (draft/issued selon règles mode C/C1)
[] invoices/{id}:issue (draft → issued avec re-check enforcement)
[] invoices/{id}:block (system/tenant_admin)
[] invoices/{id}:void (annulation/correction V1 minimal)
[] payments (enregistrer paiement)
[] consultant_commissions (calcul à l’enregistrement paiement, si activé)
[] timesheets/{id}/billing-status (mettre à jour + event)

## D) Events obligatoires (doivent exister dans 2.10)
[] InvoiceIssued (M10)
[] InvoiceBlocked (M10)
[] InvoiceDraftCreated (M10) (si utilisé)
[] InvoiceVoided (M10) (si utilisé)
[] PaymentRecorded (M10)
[] ConsultantCommissionCalculated (M10)
[] TimesheetBillingStatusChanged (M10)

## E) Interdictions strictes
[] Aucune décision conformité (M8)
[] Aucune logique timesheets (M7.T) hors lecture timesheet validée
[] Aucun calcul enforcement (consommation read-only uniquement)
[] Aucun no-code décisionnel (orchestration uniquement)

## F) Scénarios de tests (Given/When/Then) — obligatoires
[] Facture créée depuis timesheet VALIDÉE (happy path)
[] Création/issue refusée si can_issue_invoice=false (422 + blocking_reasons)
[] Draft → Issue avec re-check enforcement (422 si blocage)
[] Void invoice → état cohérent + event (si utilisé)
[] PaymentRecorded → commission calculée (si activée) + events
[] TimesheetBillingStatusChanged cohérent avec mode C1

## G) Validation finale Lot 6
[] Tests unitaires OK
[] Tests intégration OK (cashflow minimal)
[] Tests RBAC OK
[] Tests multi-tenant OK
[] Audit logs sur actions critiques (issue/block/void/payment)
[] Outbox events publiés sur toutes mutations
[] doc_check.sh = OK

---

## Changelog doc
2026-02-17: Création checklist Lot 6 (Finance/Billing), sans changement métier.
