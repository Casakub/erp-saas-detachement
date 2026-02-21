# SECTION 8 — PLAN D’EXÉCUTION (ordre conseillé)

Ce plan est OBLIGATOIRE.
Aucune étape ne peut être sautée ou inversée sans validation explicite.

PHASE 0 — CADRAGE FINAL (PRÉ-REQUIS)
Objectif: éviter toute dérive dès le départ.

☐ Branding SaaS validé (nom distinct, non YoJob)
☐ Dual interface gravée (Desktop / Mobile worker)
☐ Périmètre V1 validé (assisté vs automatisé)
☐ Sections Notion 0 → 7 validées et verrouillées

PHASE 1 — DESIGN (FIGMA MAKE)
Objectif: figer l’expérience avant toute ligne de code.

Ordre obligatoire :
1) Design System
2) Mission > Conformité (cœur produit)
3) Dashboard conformité global
4) Dashboard agence
5) Missions / ATS / CRM
6) Finance (états bloqués visibles)
7) Marketplace (catalogue + RFP)
8) Mobile Worker (PWA, online-only V1, check-in/out)

Conditions de sortie :
☐ Tous les écrans critiques ont états NORMAL / WARNING / BLOCKED
☐ Aucun écran n’implémente de logique métier
☐ Validation UX explicite

PHASE 2 — CONTRACT-FIRST (SPÉCIFICATIONS)
Objectif: fournir un cadre inviolable aux IA backend.

☐ Modèle de données V1 validé (tables + relations)
☐ OpenAPI V1 validée (endpoints + schémas)
☐ Événements métier listés et classifiés
☐ Scénarios Given/When/Then écrits pour chaînes critiques

Condition de sortie :
☐ Aucun développement backend autorisé avant validation

PHASE 3 — FONDATIONS TECHNIQUES
Objectif: sécuriser la base du produit.

☐ Core/Auth/RBAC multi-tenant
☐ Audit logs immuables
☐ Isolation multi-tenant testée
☐ Infrastructure storage (vault) prête

Condition de sortie :
☐ Aucun accès non autorisé possible

PHASE 4 — PRODUIT OPÉRATIONNEL (VALEUR V1)
Objectif: rendre le produit utilisable et vendable.

---

## 📦 LOT 3 — TIMESHEETS & MOBILE WORKER (V1)

Objectif du lot  
Mettre à disposition une saisie terrain fiable (temps & présence),
mobile-first, exploitable par la facturation (Phase 6)
et l’enforcement conformité (Phase 5),
sans introduire de logique métier critique côté mobile.

Modules concernés :
- M7.T — Timesheets
- M7bis — Worker App API (Mobile PWA)

Principe clé :
Le mobile collecte.
Le backend valide.
La conformité décide.

---

Ordre recommandé :
1) Missions + Workers (M7)
2) Coffre-fort (Vault – M9)
3) Timesheets (M7.T)
4) Worker App (Mobile PWA – M7bis)

Conditions de sortie :
☐ Flux mission → worker → timesheets → documents fonctionnel
☐ Mobile worker opérationnel (lecture + check-in/out + saisie temps)

PHASE 5 — COMPLIANCE ENGINE (DIFFÉRENCIATION)
Objectif: activer le cœur RegTech.

☐ Compliance Case automatique
☐ Snapshot rémunération immuable
☐ Score mission calculé
☐ Enforcement flags actifs
☐ Blocages visibles (mission / timesheet / facture)

Condition de sortie :
☐ Chaîne rémunération → score → enforcement validée E2E

PHASE 6 — FINANCE (SÉCURISÉE)
Objectif: monétiser sans risque juridique.

☐ Devis versionnés
☐ Factures liées aux missions
☐ Blocage facturation si non conforme
☐ Exports comptables (CSV V1)

Condition de sortie :
☐ Impossible de facturer une mission non conforme

PHASE 7 — RISK, CERTIFICATION & GATING
Objectif: préparer la marketplace sans l’ouvrir.

☐ Calcul risk inspection agence
☐ Certification auto fonctionnelle
☐ Gating marketplace actif

Condition de sortie :
☐ Accès marketplace conditionné à conformité

PHASE 8 — MARKETPLACE CONTRÔLÉE
Objectif: amorcer la traction marketplace.

☐ Catalogue agences
☐ RFP client
☐ Matching assisté
☐ Logs décisionnels

⚠️ Allocation automatique NON activée en V1

PHASE 9 — NO-CODE & AUTOMATISATION
Objectif: automatiser sans casser la logique métier.
Le no-code ne calcule, ne décide et ne valide jamais.
Il orchestre uniquement des actions déclenchées par events backend.

☐ Scénarios no-code branchés sur events backend
☐ Emails / PDF / relances / exports
☐ Logs no-code auditables

FIN PLAN D’EXÉCUTION

---


---

## 📦 LOT 4 — CRM, CLIENTS & VIGILANCE, RFP (V1)

Objectif du lot  
Activer le pipeline commercial (leads → clients), la gestion documentaire vigilance,
et la RFP unifiée (privée/publique) avec traçabilité anti-désintermédiation.

Modules concernés :
- M2 — CRM Prospection (leads, pipeline, conversion)
- M3 — Clients & Vigilance (docs, expiration, portail client)
- M4 — RFP Interne & Marketplace (visibility flag, contact logs, scoring)

Décisions structurantes :
- RFP unifiée visibility flag private|public (Q5-B)
- Anti-désintermédiation contact-logs 12 mois (Q6-B)
- Portail client optionnel client_portal_enabled (Q4-C)

Ordre recommandé :
1) M3 Clients & Vigilance (base)
2) M2 CRM Prospection (leads → conversion → clients)
3) M4 RFP (endpoints + visibility + contact-logs + scoring comparateur)

Conditions de sortie :
☐ Pipeline lead → client fonctionnel (conversion atomique)
☐ Batch expiration documents clients opérationnel (ClientDocumentExpired)
☐ RFP private/public fonctionnelle (PATCH /v1/rfps/{id}/visibility)
☐ Contact logs 12 mois (insert-only, retention policy)
☐ RBAC validé par endpoint (worker exclu total)
☐ Multi-tenant isolation testée

Référence checklist : 6.5 — Checklist Lot 4 (READY v1.1)

---

## 📦 LOT 5 — ATS & WORKERS (V1)

Objectif du lot  
Activer le pipeline recrutement (job offers → candidatures → scoring IA)
et la gestion des dossiers workers (documents, skills, expiration).

Modules concernés :
- M5 — ATS (Annonces & Candidatures)
- M6 — Workers & Dossiers

Décisions structurantes :
- worker_skills livré V1 (Q9-A)
- Pipeline parsing IA asynchrone backend uniquement
- Upload documents: ownership check strict (worker = own only)
- Conversion candidate → worker atomique

Ordre recommandé :
1) M6 Workers CRUD (base identité worker)
2) M5 ATS job-offers + applications
3) Pipeline parsing IA async (ApplicationReceived → CandidateParsed → CandidateScored)
4) worker_skills + batch expiration docs

Conditions de sortie :
☐ Pipeline job-offer → application → scoring fonctionnel
☐ ai_score immuable après CandidateScored (pas d'update)
☐ Ownership check worker (POST /v1/workers/{id}/documents)
☐ Batch expiration docs worker (WorkerDocumentStatusChanged)
☐ worker_skills: ajout agency_user only, lecture worker own-only
☐ Consultant 403 sur shortlist
☐ Multi-tenant isolation testée

Référence checklist : 6.6 — Checklist Lot 5 (READY v1.1)

---

## 📦 LOT 6 — FINANCE / BILLING (V1)

Objectif du lot  
Activer la facturation sécurisée (bloquée si non conforme),
les devis versionnés, les commissions et les exports comptables.

Modules concernés :
- M10 — Finance / Billing

Décisions structurantes :
- Finance ACTIVE en V1 (décision OWNER 2026-02-20 — feature flag caduc)
- from-timesheet active V1 (ERRATA V1.1 §3b)
- Enforcement: can_issue_invoice=false → 422 invoice_issuance_blocked

Ordre recommandé :
1) Facturation from-timesheet (POST /v1/invoices:from-timesheet)
2) Devis (POST /v1/quotes)
3) Émission facture (POST /v1/invoices/{id}:issue) + enforcement gate
4) Commissions (PATCH /v1/commissions/{id}/status)
5) Exports comptables (GET /v1/accounting-exports)

Conditions de sortie :
☐ Impossible de facturer si can_issue_invoice=false (422 + blocking_reasons)
☐ Impossible d'émettre si can_issue_invoice=false (422 + blocking_reasons)
☐ InvoiceIssued + TimesheetBillingStatusChanged publiés
☐ QuoteCreated + CommissionApproved publiés
☐ client_user / worker exclus (403)
☐ Multi-tenant isolation testée

Référence checklist : 6.4 — Checklist Lot 6 (READY v1.3)

---

## 📦 LOT 7 — COMPLIANCE ENGINE RÉMUNÉRATION (V1)

Objectif du lot  
Activer le moteur de conformité rémunération (5 étapes),
les snapshots immuables, les grilles salariales IDCC et les alertes durée.

Modules concernés :
- M8 extension — Salary Engine + Snapshots + Durées cumulées

Décisions structurantes :
- Algorithme 5 étapes: grille → admissible → comparaison → snapshot → enforcement
- 3 IDCC V1: BTP-1702, Métallurgie-3109, Transport-16
- Snapshots immuables (pas de updated_at, historique complet)
- Durées per-mission: seuils 300d warning / 365d critical (Q7-C)

Ordre recommandé :
1) Migrations salary_grids, mandatory_pay_items, country_rulesets, worker_remuneration_snapshots
2) Algorithme moteur 5 étapes (backend uniquement)
3) Seed IDCC V1 (fixtures BTP/Métallurgie/Transport)
4) Admin endpoints salary-grids / mandatory-pay-items / country-rulesets
5) Batch quotidien ComplianceDurationAlert

Conditions de sortie :
☐ Algorithme 5 étapes implémenté et testé (unit + cas limites)
☐ Snapshots immuables (test dédié: no update possible)
☐ 3 IDCC V1 chargés
☐ Enforcement flags mis à jour après chaque snapshot
☐ Batch durées: ComplianceDurationAlert publié (300d/365d)
☐ client_user / worker / consultant exclus (403)
☐ Multi-tenant isolation testée

Référence checklist : 6.7 — Checklist Lot 7 (READY)

---

## 📦 LOT 8 — RISK, CERTIFICATION & MARKETPLACE (V1)

Objectif du lot  
Activer le scoring de risque agence, le gating certification,
la suspension automatique et le catalogue marketplace.

Modules concernés :
- M12 — Risk & Certification
- M11 — Marketplace (Catalogue + RFP Externe)

Décisions structurantes :
- Risk score V1: règles-based batch (pas de ML — V2)
- Certification gating: controlled = risk_score ≤ 40 + vigilance + 1 mission clôturée
- Suspension automatique si risk_score > 70
- RFP marketplace = visibility flag (Q5-B, réutilise M4)
- Allocation automatique NON activée en V1

Ordre recommandé :
1) M12 migrations + algorithme risk score V1
2) M12 certification gating (validation manuelle tenant_admin)
3) M12 suspension automatique + MarketplaceAccessChanged
4) M12 ranking batch (agency_marketplace_rankings)
5) M11 catalogue marketplace (GET /v1/marketplace/agencies + filtres)
6) M11 RFP publique (réutilise PATCH /v1/rfps/{id}/visibility de M4)

Conditions de sortie :
☐ Risk score 0-100 calculé batch quotidien
☐ agency_risk_scores: insert-only (aucun delete — test dédié)
☐ Certification: validation manuelle tenant_admin uniquement
☐ Suspension auto risk_score > 70: marketplace_access.status = suspended
☐ Catalogue: filtre agences active uniquement (secteur/corridor/certification)
☐ Allocation auto ABSENTE (PR check explicite)
☐ worker / client_user exclus (403)
☐ Multi-tenant isolation testée

Référence checklist : 6.8 — Checklist Lot 8 (READY v1.1)

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
- 2026-02-20: Ajout fiches Lots 4→8 avec objectifs, modules, décisions structurantes, ordre recommandé et conditions de sortie (même niveau de détail que Lot 3).

