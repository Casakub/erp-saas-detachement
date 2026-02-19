# SECTION 3 — TEMPLATE NOTION / CLICKUP (PILOTAGE IA)

# 🎯 OBJECTIF DE LA SECTION 3

Cette section définit :

- la gouvernance des IA
- le pilotage des lots
- la traçabilité produit / tech / conformité
- le process de validation humaine

Elle s’applique à **tous les lots (V1 → Vn)**.
Aucune implémentation ne peut être validée sans conformité avec cette section.

## **3.1 Bases Notion recommandées**

### **DB: “Modules”**

- Name
- Owner IA
- Status (Backlog / In progress / Review / Approved / Merged)
- Dependencies
- Repo/Branch
- Definition of Done (DoD)
- Risks
- Criticality (Compliance / Business / Support)
- MVP Scope (V1 Assisté / V2 Automatisé / V3)
- Affects Compliance Engine? (Yes / No)
- Requires Legal Review? (Yes / No)
- Mobile Impact (None / Read-only / Full)

### **DB: “Specs & Contracts”**

- Module
- OpenAPI link
- Data model link
- Events list
- Version
- Approved (checkbox)
- Functional Version (ex: 1.0 / 1.1 / 2.0)
- Automation Level (Manual / Assisted / Automated)
- Legal Confidence Level (Low / Medium / High)

### **DB: “Prompts”**

- Type (Figma/Backend/QA/Doc)
- Target IA
- Prompt text
- Output link
- Status

### **DB: “QA & Acceptance”**

- Module
- Test plan
- Results
- Issues
- Approved by Alexandre

### RÈGLE DE TRAÇABILITÉ OBLIGATOIRE

Chaque module doit être traçable verticalement :

- Écrans Figma concernés
- Modules backend impactés
- Endpoints API exposés
- Événements métier émis (référence exacte à 2.10 + payload attendu)
- Scénarios de tests associés

Aucune implémentation backend ne peut être validée
sans référence explicite à au moins un écran Figma
et un scénario Given/When/Then.

## **3.2 Template tâche ClickUp/Notion (copier-coller)**

### STOP CONDITIONS — IA

Une IA DOIT s’arrêter et demander validation humaine si :

- Une règle légale est ambiguë
- Un calcul conformité est incertain
- Un impact cross-module est détecté
- Une donnée réglementaire manque ou est douteuse
- Une décision automatique est envisagée

### Continuer sans validation = rejet automatique.

# [MODULE] — Lot X
Owner: [IA / Dev]
Criticality: [Compliance / Business / Support]
Functional Version: [1.0 / 1.1]
Automation Level: [Manual / Assisted / Automated]

Linked Figma Screens:
- …

Linked API / Events:
- …

Branch: feature/[module]-lot-x
Dependencies: […]

Scope:
- …

STOP CONDITIONS CHECK:
☐ Aucun calcul légal incertain
☐ Aucun impact cross-module non validé
☐ Aucun automatisme non autorisé

DoD:
☐ Migrations versionnées
☐ OpenAPI conforme
☐ Tests unitaires + intégration
☐ Tests RBAC + multi-tenant
☐ Audit logs
☐ Enforcement respecté
☐ Aucun hors périmètre
☐ Events conformes à 2.10 (nommage, payload, moment d’émission)

Acceptance:
☐ Scénarios Given/When/Then validés
☐ Validation humaine finale

Artifacts:
- PR link
- Screenshots / logs

## **3.3 Pipeline de validation (obligatoire)**

1. Spec (PRD + OpenAPI + DB) approuvée
2. Implémentation module
3. Tests + QA
4. Review “AI Contribution Rules”
5. Merge

## 📦 LOT COURANT ACTIF

- Lot actif : Lot 2 — Missions / Compliance Case / Enforcement
- Lots gelés : Lot 1
- Lots non autorisés : Lot 3+

⚠️ Toute IA doit vérifier le lot actif avant toute implémentation.

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
