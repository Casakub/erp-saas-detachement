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

## 📦 ÉTAT DES LOTS (mise à jour 2026-02-20)

| Lot | Modules | Statut CDC | Checklist | Prêt à coder |
| --- | --- | --- | --- | --- |
| Lot 1 | M1 Foundation (tenant, users, RBAC, Vault, Outbox) | LOCKED | — | ✅ |
| Lot 2 | M7 Missions + M8 Compliance Case base + M9 Vault | LOCKED | — | ✅ |
| Lot 3 | M7.T Timesheets + M7bis Mobile PWA | READY v1.3 | 6.3 READY | ✅ |
| Lot 4 | M2 CRM + M3 Clients/Vigilance + M4 RFP | READY v1.1 | 6.5 READY | ✅ |
| Lot 5 | M5 ATS + M6 Workers & Dossiers | READY v1.1 | 6.6 READY | ✅ |
| Lot 6 | M10 Finance / Billing | READY v1.3 | 6.4 READY | ✅ |
| Lot 7 | M8 extension Salary Engine + Snapshots + Durées | READY | 6.7 READY | ✅ |
| Lot 8 | M11 Marketplace + M12 Risk & Certification | READY v1.1 | 6.8 READY | ✅ |

**Lot actif recommandé** : Lot 1 (Foundation) — débuter l'implémentation ici.
**Séquence obligatoire** : Lot 1 → Lot 2 → Lot 3 → Lot 4 → Lot 5 → Lot 6 → Lot 7 → Lot 8.

⚠️ Toute IA doit respecter la séquence des lots. Un lot ne peut démarrer qu'une fois le lot précédent validé (gate DoD cochée dans la checklist correspondante). Référence: `SECTION 9 LOCKED v1.1`.

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
- 2026-02-20: Mise à jour LOT COURANT ACTIF → tableau état complet Lots 1→8 (tous READY, séquence implémentation clarifiée).
