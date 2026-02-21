# SECTION 6 — Checklist Produit V1 (Globale)

## 📌 STATUT DE LA CHECKLIST

Cette page (**6.0**) est la **gate produit globale V1**.

➡️ Elle valide que le produit est :

- cohérent de bout en bout
- exploitable en production
- vendable sans risque majeur

⚠️ Les checklists de lots (6.1 / 6.2 / 6.3) sont **obligatoires**
mais **ne remplacent pas** cette validation globale.

---

## 📚 SOMMAIRE DES CHECKLISTS DE LOTS

- [ ]  **6.1 — Checklist Lot 1 IA — Foundation**

→ Core / Auth / RBAC / Audit / Events Outbox

- [ ]  **6.2 — Checklist Lot 2 IA — Core métier**

→ Missions / Compliance Case / Enforcement

- [ ]  **6.2.A — Checklist Validation Inter-Modules (Lot 2)**

→ Contrôles transverses & cohérence inter-modules

- [ ]  **6.3 — Checklist Lot 3 IA — Timesheets & Mobile**

→ Saisie temps / PWA worker / check-in-out

- [ ]  **6.4 — Checklist Lot 6 IA — Finance / Billing**

→ Devis / Factures / Commissions / Gating enforcement

- [ ]  **6.5 — Checklist Lot 4 IA — CRM / Clients / Vigilance / RFP**

→ Leads / pipeline / clients multi-sites / documents vigilance / RFP interne

- [ ]  **6.6 — Checklist Lot 5 IA — ATS / Workers**

→ Annonces / candidatures / parsing IA / dossiers intérimaires

- [ ]  **6.7 — Checklist Lot 7 IA — Compliance Engine Rémunération**

→ Moteur salaire / IDCC / snapshots immuables / durées cumulées / enforcement flags

- [ ]  **6.8 — Checklist Lot 8 IA — Risk / Certification / Marketplace**

→ Risk score agence / certification / gating marketplace / ranking / RFP externe

➡️ Chaque checklist de lot doit être **100 % cochée**
avant validation finale du produit V1.

---

## 🖥 PRODUIT — DESKTOP (AGENCES / CONSULTANTS)

- [ ]  Dashboard agence opérationnel (données réelles)
- [ ]  CRM prospection fonctionnel (leads, pipeline, historique)
- [ ]  Gestion clients + multi-sites + documents de vigilance
- [ ]  ATS : annonces, candidatures, scoring IA indicatif
- [ ]  Missions : création, affectation, planning
- [ ]  Compliance Case accessible depuis chaque mission
- [ ]  Devis & factures liés aux missions
- [ ]  Coffre-fort accessible et relié aux objets métier

---

## 📱 PRODUIT — MOBILE WORKER (PWA)

- [ ]  Onboarding sécurisé fonctionnel
- [ ]  Consultation missions & planning
- [ ]  Upload documents (pièces obligatoires)
- [ ]  Check-in / Check-out opérationnel
- [ ]  Consultation rémunération & indemnités
- [ ]  Notifications (A1, documents, mission)
- [ ]  Offline partiel validé (lecture missions & documents)
- [ ]  Aucun calcul métier côté mobile

---

## 👤 PORTAIL CLIENT (V1 — LECTURE)

- [ ]  Accès sécurisé client
- [ ]  Consultation missions
- [ ]  Validation devis
- [ ]  Téléchargement documents autorisés

---

## 🌍 MULTI-LANGUES

- [ ]  UI disponible en FR / EN / PL / RO
- [ ]  Templates emails multilingues
- [ ]  Terminologie juridique harmonisée

---

## ⚖️ CONFORMITÉ — CŒUR DU PRODUIT

- [ ]  Compliance Case créé automatiquement par mission
- [ ]  Snapshot rémunération immuable
- [ ]  Distinction claire salaire / indemnités / frais
- [ ]  Conventions collectives V1 intégrées (BTP, Transport, Métallurgie)
- [ ]  A1 tracking (assisté) fonctionnel
- [ ]  Calcul durée cumulée 12 mois + alertes
- [ ]  Checklist documents dynamique + expirations
- [ ]  Export dossier “inspection-ready” (PDF) fonctionnel

---

## 🔗 CHAÎNES CRITIQUES (OBLIGATOIRES)

- [ ]  Chaîne complète validée :

Rémunération → snapshot → score → enforcement

- [ ]  Blocage effectif et testé sur :
- [ ]  activation mission
- [ ]  validation timesheets
- [ ]  émission facture
- [ ]  Raisons de blocage visibles, explicables et traçables

---

## 🧩 MARKETPLACE (V1 CONTRÔLÉE)

- [ ]  Certification agence automatique fonctionnelle
- [ ]  Gating marketplace actif (certification requise)
- [ ]  Ranking agences calculé et visible
- [ ]  RFP client avec shortlist et matching assisté
- [ ]  Allocation automatique **NON activée en V1** (prévue V2)

---

## 💶 FINANCE

- [ ]  Devis versionnés
- [ ]  Factures générées depuis missions
- [ ]  Facturation bloquée si enforcement actif
- [ ]  Suivi règlements minimal
- [ ]  Export comptable CSV fonctionnel

---

## 🔐 SÉCURITÉ & CONFORMITÉ TECHNIQUE

- [ ]  Coffre-fort chiffré
- [ ]  Hash d’intégrité documents
- [ ]  Access logs consultables
- [ ]  RBAC complet testé
- [ ]  Isolation multi-tenant vérifiée

---

## 🚫 HORS SCOPE V1 (VOLONTAIRE)

- [ ]  Génération automatique SIPSI
- [ ]  Automatisation complète A1
- [ ]  Matching IA avancé multi-critères
- [ ]  Marketplace ouverte multi-agences
- [ ]  Géolocalisation check-in / check-out

**✅ FIN CHECKLIST PRODUIT V1**

---

## Autres checklists importante :

[6.1 — CHECKLIST “LOT 1 IA” (FOUNDATION) — Core/Auth/RBAC/Audit + Events Outbox](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%201%20%E2%80%94%20CHECKLIST%20%E2%80%9CLOT%201%20IA%E2%80%9D%20(FOUNDATION)%20%E2%80%94%20Core%20Aut%20309688d6a59680289ab6c2610e2ea8c2.md)

[6.2 — CHECKLIST “LOT 2 IA” (CORE MÉTIER) — Missions + Compliance Case + Enforcement](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%202%20%E2%80%94%20CHECKLIST%20%E2%80%9CLOT%202%20IA%E2%80%9D%20(CORE%20M%C3%89TIER)%20%E2%80%94%20Mission%20309688d6a5968025b83ee89daae2af50.md)

[6.2.A — CHECKLIST DE VALIDATION INTER-MODULES (LOT 2) (1)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%202%20A%20%E2%80%94%20CHECKLIST%20DE%20VALIDATION%20INTER-MODULES%20(LOT%2030a688d6a59680cd973bcefa1b8dea2e.md)

[6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%203%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%203%20IA%20(TIMESHEETS%20&%20MOBILE)%20309688d6a596802db703f94bc41b8d6c.md)

[6.4 — CHECKLIST "LOT 6 IA" — FINANCE BILLING (M10)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%204%20%E2%80%94%20CHECKLIST%20%E2%80%9CLOT%206%20IA%E2%80%9D%20%E2%80%94%20FINANCE%20BILLING%20(M10)%20%E2%80%94%20MODE%20C1%2030a688d6a59680d4aab4f458847c3353.md)

[6.5 — CHECKLIST — LOT 4 IA (CRM, CLIENTS, VIGILANCE, RFP)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%205%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%204%20IA%20(CRM%2C%20CLIENTS%2C%20VIGILANCE%2C%20RFP)%2030b688d6a596805a8ee3fa3fc97db271.md)

[6.6 — CHECKLIST — LOT 5 IA (ATS, WORKERS)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%206%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%205%20IA%20(ATS%2C%20WORKERS)%2030b688d6a5968097b150ebf02aa52ca0.md)

[6.7 — CHECKLIST — LOT 7 IA (COMPLIANCE ENGINE RÉMUNÉRATION)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%207%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%207%20IA%20(COMPLIANCE%20ENGINE%20REMUNERATION)%2030b688d6a59680cca2c4f65092f93b55.md)

[6.8 — CHECKLIST — LOT 8 IA (RISK, CERTIFICATION, MARKETPLACE)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%208%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%208%20IA%20(RISK%2C%20CERTIFICATION%2C%20MARKETPLACE)%2030b688d6a59680fba415f73561265313.md)