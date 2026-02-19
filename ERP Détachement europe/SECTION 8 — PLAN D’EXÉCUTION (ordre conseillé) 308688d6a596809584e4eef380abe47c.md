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

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
