# SOCLE TECHNIQUE GELÉ — V1 (LOCKED)

## Déclaration officielle de gel V1

- **Statut**: LOCKED (Gel effectif)
- **Version socle**: V1.1
- **Date gel**: 2026-02-17
- **Périmètre gelé**: 2.9 DB, 2.10 Events, 2.11 OpenAPI, 2.12 RBAC
- **Règle de changement**: toute modification doit synchroniser DB ↔ Events ↔ OpenAPI ↔ RBAC + changelog, sinon STOP
- **Référence audit**: Audit conformité: OK (fences=0, OpenAPI↔RBAC OK, OpenAPI↔Events OK, mutants ok)

---

# ERP Détachement Europe — CAHIER DES CHARGES IA (V1) — VERSION CONSOLIDÉE

**Owner**: Alexandre
**Date**: 2026-02-15
**Scope**: France-first (host), Europe-ready (origin: PT/RO/PL), multi-secteurs + conventions collectives (BTP, Métallurgie, Transport) dès V1
**Cible business**: Modèle hybride SaaS + Marketplace en parallèle, avec moteur conformité comme différenciateur principal

## 0) OBJECTIF & PÉRIMÈTRE (ALIGNEMENT CONTEXTE)

### Objectif produit:

- Gérer l’activité "de la prospection au suivi des intérimaires" avec conformité détachement intégrée.
- Offrir une expérience inspection-ready: preuves, snapshots, audit trail, export dossier.

### Périmètre fonctionnel (6 piliers) — V1:

1. Acquisition & Prospection (CRM + RFP interne)
2. Marketplace & ATS (annonces + candidatures + scoring IA assisté)
3. Conformité Détachement (Compliance Case + règles dynamiques + conventions)
4. Finance & Comptabilité (devis/factures + exports + commissions)
5. Gestion Clients (multi-sites + vigilance + portail client)
6. Multi-langues & UX (UI + emails + documents, base terminologique)

### **Périmètre pays:**

- Host: France (V1)
- Origin: Portugal, Roumanie, Pologne (V1)
- Extension future: BE/DE/NL… via Country Packs

### **Périmètre rôles:**

- Platform Super Admin
- Agence
- Consultant indépendant
- Client (lecture/validation)
- Intérimaire (mobile-first)

## 1) PRINCIPES NON-NÉGOCIABLES (ANTI-CHAOS POUR IA)

### 1. Contract-first obligatoire:

- OpenAPI/Schémas validés AVANT implémentation.
- Aucun endpoint / champ inventé hors contrat.

### 2. Multi-tenant strict:

- tenant_id partout
- isolation testée (RLS si Supabase)
- aucun accès cross-tenant

### 3. Règles métier critiques hors no-code:

- no-code = orchestration (emails, PDF, alertes), jamais décision (score/enforcement)

### 4. Versioning + auditabilité:

- scoring models, ranking models, legal rules versionnés
- snapshots immuables (rémunération, score)
- audit_logs immuables

### 5. Tests obligatoires:

- unitaires + intégration
- RBAC
- multi-tenant isolation

## 2) ARCHITECTURE PRODUIT (DOMAIN MODULES) — 1 IA = 1 MODULE

## Règle d’or

- **1 module = 1 domaine = 1 schéma de données + 1 API + 1 service layer + 1 suite de tests (+ 1 UI slice si applicable)**
- **Aucune IA ne modifie un autre module** (tout changement cross-module = STOP + validation)
- Les communications inter-modules passent par **events** (event-driven) ou contrats API validés

---

## 2.1 Modules Fondation (obligatoires en premier)

### M1 — Identity & Access (Core)

**Rôle :** sécuriser la plateforme (multi-tenant, accès, auditabilité)

**Inclut :**

- Auth (login, reset, éventuellement MFA en V2)
- **RBAC/ABAC** (Platform Admin / Tenant Admin / Agency / Consultant / Client / Worker)
- **Multi-tenant strict** (tenant_id partout + isolation)
- **Audit logs immuables** (qui/quoi/quand/pourquoi)
- Session & gestion utilisateurs (activation/désactivation)

---

## 2.2 Modules Acquisition & Relation Client (Business Core)

### M2 — CRM Prospection

**Rôle :** gérer l’acquisition et la conversion

**Inclut :**

- Leads & pipeline multi-rôles (consultant/agence)
- Activités & historique interactions
- Scoring (manuel V1, IA assistée optionnelle)
- Attribution opportunités (ownership) & suivi transformation

### M3 — Gestion Clients + Vigilance

**Rôle :** piloter les entreprises utilisatrices + conformité de vigilance

**Inclut :**

- Fiches entreprises + **multi-sites**
- Contacts & contrats cadres (V1 “simple”, V2 “avancé”)
- **Documents vigilance** (Kbis, assurances, etc.) + statuts + expirations
- Portail client **lecture/validation** (devis, documents, suivi missions)

### M4 — RFP Interne (Mise en concurrence agences)

**Rôle :** structurer une demande client et la comparer entre agences

**Inclut :**

- Création “Demande” (besoin structuré : corridor/secteur/dates/volume)
- Invitations agences + suivi réponses
- Comparateur + score + traçabilité décisionnelle
- Sélection + attribution + logs (anti-désintermédiation à traiter au légal)

---

## 2.3 Modules Recrutement & Opérations (ATS → Missions)

### M5 — ATS (Annonces & Candidatures)

**Rôle :** recruter et qualifier des intérimaires

**Inclut :**

- Job offers (dépôt, publication, clôture)
- Réception candidatures + pipeline (screening → shortlist → validation)
- Parsing CV + extraction (IA assistée)
- Scoring IA **indicatif et explicable** + détection incohérences
- Shortlist client (si portail activé)

### M6 — Workers & Dossiers

**Rôle :** centraliser le dossier intérimaire (identité, habilitations, docs)

**Inclut :**

- Profil worker (identité, contacts, nationalité, langue)
- Documents worker + expirations + demandes de pièces
- Habilitations & compétences (V1 minimal)
- Historique missions & statut worker

### M7 — Missions & Timesheets

**Rôle :** exécuter l’activité terrain (mission, planning, temps)

**Inclut :**

- Création mission + affectation worker
- Planning & suivi présence (V1)
- Timesheets (saisie, validation, rejet)
- Incidents (absence / accident / non-conformité) **minimal V1**

### M7bis — Worker App (Mobile PWA)

**Rôle :** produit mobile parallèle pour intérimaires (terrain)

**Inclut :**

- Consultation missions & planning
- Upload documents (pièces demandées)
- **Check-in / Check-out** (présence)
- **V1** : lecture “rémunération déclarée” + indemnités déclarées (sans calcul légal) / V2 : lecture snapshot rémunération (Lot 7)
- Notifications (push/email)

**Check-in / Check-out :**

- Horodatage obligatoire
- Lié à la mission
- Journalisé (audit logs)
- V1 sans géolocalisation (option V2)

**Offline (V2+) :**

- V1 : PWA online only (aucune exigence offline)
- V2 : offline read-only (missions & documents) + sync contrôlée
- Interdiction : aucune action sensible offline (upload, validation, facturation)

**Principe :**

- Le mobile consomme **uniquement l’API**
- Aucun calcul métier côté mobile

---

## 2.4 Modules Conformité (Cœur Différenciant)

### M8 — Conformité Détachement (Compliance Case)

**Rôle :** sécuriser la conformité détachement (inspection-ready)

**Inclut :**

- **1 mission = 1 Compliance Case**
- Checklists dynamiques (country + sector + convention)
- A1 tracking (assisté V1 : statuts + pièces + dates + relances)
- Durée 12 mois (alertes / cumul)
- Frais vs salaire (preuves, exclusion du calcul)
- Score mission + **enforcement flags** (blocages expliqués)

---

## 2.5 Modules Documents & Preuves (Coffre-fort)

### M9 — Vault (Coffre-fort numérique)

**Rôle :** stocker, prouver, tracer (probatoire)

**Inclut :**

- Stockage sécurisé (chiffrement, permissions fines)
- Hashing documents + versioning
- Access logs immuables
- Liaison fichiers ↔ objets métier (mission/worker/compliance/A1/client)

---

## 2.6 Modules Finance (Monétisation et contrôle)

### M10 — Finance (Devis / Factures / Commissions)

**Rôle :** facturer et piloter la performance financière sans risque conformité

**Inclut :**

- Devis (création, versioning, acceptation)
- Factures (émission, statut, paiement minimal V1)
- Export compta CSV V1 (connecteurs V2)
- Commissions consultants (suivi, taux, statut)
- **Respect enforcement** : facture bloquée si mission non conforme
- **V1 : blocage uniquement à l’émission (can_issue_invoice=false)**
- **Devis jamais bloqués par enforcement**
- **Paiement = record-only (pas de PSP)**
- **Facturation depuis timesheets = V2**

**Note** :“ Dépend de : M7, M8, M9, 2.10, 2.11, 2.12”.

---

## 2.7 Modules Marketplace (Traction contrôlée)

### M11 — Marketplace (Catalogue + RFP Externe)

**Rôle :** activer la traction marketplace de façon conditionnée

**Inclut :**

- Catalogue agences + ranking transparent
- RFP client + matching + allocation assistée (auto en phase suivante)
- Logs décisionnels (traçabilité)

### M12 — Risk & Certification

**Rôle :** contrôler l’accès marketplace et réduire le risque inspection

**Inclut :**

- Risk inspection score agence (versionné)
- Certification (auto → interne → externe)
- Suspension / révocation
- **Gating marketplace** conditionné certification

---

## 2.8 Modules Transverses (Support produit)

### M13 — i18n & Comms

**Rôle :** multi-langues et communications cohérentes

**Inclut :**

- UI i18n (FR/EN/PL/RO)
- Templates emails multilingues
- Terminologie juridique harmonisée (glossaire)
- Notifications (routage langue adaptée)

## 2.9 SCHÉMA BASE DE DONNÉES V1 — SaaS Détachement Europe (Multi-tenant, RegTech)

[2.9 - Schéma DB V1.1 **(V1 + Patch)**](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%209%20-%20Sch%C3%A9ma%20DB%20V1%201%20(V1%20+%20Patch)%20308688d6a5968011b4f1f037d9e623f3.md)

## 2.10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-friendly)

[2.10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-friendly)](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%2010%20EVENTS%20M%C3%89TIER%20V1%20(Event-driven,%20Outbox,%20IA-fr%20308688d6a596802bad05fb3834118422.md)

## 2.11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2

[2.11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%2011%20%E2%80%94%20OPENAPI%20V1%20(PARCOURS%20MVP)%20%E2%80%94%201%20%E2%86%92%203%20%E2%86%92%202%20308688d6a596801dad76e1c4a1a96c02.md)

## 2.12 — RBAC & PERMISSIONS (MATRIX) — V1

[2.12 — RBAC & PERMISSIONS (MATRIX) — V1](SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)/2%2012%20%E2%80%94%20RBAC%20&%20PERMISSIONS%20(MATRIX)%20%E2%80%94%20V1%20308688d6a596802d8e81c1623900db41.md)

## 2.13 — CHECKLIST “LOT 1 IA” (FOUNDATION) — Core/Auth/RBAC/Audit + Events Outbox

[6.1 — CHECKLIST “LOT 1 IA” (FOUNDATION) — Core/Auth/RBAC/Audit + Events Outbox](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%201%20%E2%80%94%20CHECKLIST%20%E2%80%9CLOT%201%20IA%E2%80%9D%20(FOUNDATION)%20%E2%80%94%20Core%20Aut%20309688d6a59680289ab6c2610e2ea8c2.md)

## 2.14 — CHECKLIST “LOT 2 IA” (CORE MÉTIER) — Missions + Compliance Case + Enforcement

[6.2 — CHECKLIST “LOT 2 IA” (CORE MÉTIER) — Missions + Compliance Case + Enforcement](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%202%20%E2%80%94%20CHECKLIST%20%E2%80%9CLOT%202%20IA%E2%80%9D%20(CORE%20M%C3%89TIER)%20%E2%80%94%20Mission%20309688d6a5968025b83ee89daae2af50.md)

[6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)](SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)/6%203%20%E2%80%94%20CHECKLIST%20%E2%80%94%20LOT%203%20IA%20(TIMESHEETS%20&%20MOBILE)%20309688d6a596802db703f94bc41b8d6c.md)

## 3) CHAÎNE CRITIQUE (CŒUR MÉTIER) — “RÉMUNÉRATION → SCORE → ENFORCEMENT → MARKETPLACE”

Déclencheurs:

- event-driven (temps réel) + batch quotidien (hybride)

### 3.1 Moteur rémunération (ultra détaillé)

- distingue strictement:
    - rémunération admissible (salaire + primes obligatoires)
    - frais remboursables (logement/transport/repas) exclus du calcul
- compare au minimum requis (IDCC + classification + date)
- génère snapshot immuable

### 3.2 Score mission (corridor/secteur/convention)

- modèle corridor adaptable (verrouillé plateforme)
- breakdown visible + reasons explicables

### 3.3 Enforcement (soft/semi/hard + règles blocking)

- règles blocking non négociables (ex: salaire < min, A1 requis manquant, >365j)
- flags mission: can_activate / can_validate_timesheets / can_issue_invoice

### 3.4 Agrégation Risk & Certification

- risk inspection agence calculé et versionné
- certification auto + suspension/revocation

### 3.5 Gating & Ranking Marketplace

- accès marketplace conditionné à certification
- ranking transparent versionné

### 3.6 Matching RFP & Allocation auto

- shortlist + allocation auto selon seuils
- logs décisionnels explicables

## 4) CONFORMITÉ FRANCE — MULTI-SECTEURS + CONVENTIONS V1

### V1 inclut conventions clés:

- BTP
- Métallurgie
- Transport

### Données nécessaires (V1):

- IDCC, classifications, minima (horaire/mensuel), primes obligatoires, indemnités (si intégrées)
- historique versions (effective_from/effective_to)

### Règles “FR générique”:

- déclaration détachement (SIPSI en V2 auto, V1 assisté: formulaire + checklist + preuves)
- représentant FR
- vigilance donneur d’ordre
- docs disponibles sur site
- assurance / logement (preuves)

### A1:

- V1: tracking assisté (statuts + pièces + dates + relances)
- V2: connecteurs par pays si possible

## 5) MARKETPLACE — ALIGNEMENT AVEC TON PLAN (V1 PARALLÈLE)

### Catalogue (V1):

- profil agence, corridors, secteurs
- score marketplace (ranking) + composants visibles
- badge certification

### RFP client (V1):

- création demande
- shortlist auto
- attribution assistée
- allocation auto en phase suivante (mais API déjà prévue)

### Anti-désintermédiation (à prévoir contractuellement):

- tracking RFP + période anti-contournement (à documenter côté légal)

## 6) MULTI-LANGUES (V1 MINIMUM VIABLE)

### Langues UI: FR / EN / PL / RO (V1)

- i18n UI + notifications
- terminologie juridique (glossaire)
- templates email par langue

### Documents générés multilingues:

- V1: templates PDF basiques (FR/EN) + extension PL/RO
- V2: génération avancée par corridor

## 7) STACK TECHNIQUE (CONFORME À TON CONTEXTE)

### Recommandation V1 (simple & IA-friendly):

- Backend: Supabase Postgres + RLS + Edge Functions (ou API Node TS) + migrations
- Front: Next.js App Router + Tailwind + i18n
- Storage: Supabase Storage ou S3 compatible (hashing + access logs)
- Jobs/batch: n8n/Make + cron sécurisé (déclencheur) MAIS logique critique backend
- Observabilité: logs + alertes + audit trail

### COUCHE NO-CODE / AUTOMATISATION — RÈGLES STRICTES

**Utilisation autorisée :**

- Envoi emails & notifications
- Génération PDF
- Parsing CV via IA
- Relances A1
- Alertes expiration
- Traductions
- Exports comptables
- Jobs batch (cron déclenchés)

**Interdictions absolues :**

- Aucun calcul conformité
- Aucun calcul rémunération
- Aucun scoring
- Aucun enforcement
- Aucune règle pays

**Principe fondamental :**
Le no-code ORCHESTRE.
Le backend DÉCIDE.
Toute logique métier critique hors backend = rejet.

## 8) LIVRABLES ATTENDUS DE CHAQUE IA (FORMAT OBLIGATOIRE)

### Pour un module backend:

- (1) PRD module (objectif, non-objectif, règles, edge cases)
- (2) Modèle de données + migrations
- (3) OpenAPI endpoints + schémas
- (4) Services + handlers events
- (5) Tests (unit + intégration + RBAC + tenant isolation)
- (6) Notes d’impact + changelog

### Pour Figma Make:

- 1 prompt = 1 page/flow
- inclure states (compliant/warning/blocked), tables data-heavy, modals blocage
- Desktop 1440, Mobile 390, composants réutilisables

## 9) PLAN D’EXÉCUTION (ORDRE CONSEILLÉ) — VERSION ALIGNÉE SOCLE GELÉ (V1)

### Étape 1 — Figma Make (Design)

- Design system (tokens + composants + states)
- Mission → Compliance Case (compliant / warning / blocked)
- Dashboard conformité (enforcement + blocages)
- Dashboard agence (ops)
- CRM / Clients / RFP (écrans)
- ATS / Workers (écrans)
- Finance (devis/factures) — écrans V1 (lecture + actions conditionnées par enforcement)
- Marketplace (écrans)
- Mobile Worker PWA (écrans)

### Étape 2 — Contracts (LOCKED)

- Schéma DB V1.x (2.9) + migrations versionnées
- Events métier V1 (2.10) + outbox
- OpenAPI V1 (2.11) (parcours 1 → 3 → 2)
- RBAC matrix V1 (2.12)
- DoD globale + DoD par lot (2.13, 2.14)

### Étape 3 — Implémentation par lots (IA) — ORDRE RÉEL DES DÉPENDANCES

- **Lot 1 — FOUNDATION (2.13)**
    - Core/Auth/RBAC/Audit + Events Outbox + Tenant settings
- **Lot 2 — CORE MÉTIER (2.14 + 2.14.A)**
    - Missions (M7)
    - Compliance Case + Requirements + A1 tracking assisté (M8)
    - Enforcement flags + blocking reasons (M8)
    - Vault minimal (upload + hash + file_links + access_logs) (M9)
    - ✅ Validation obligatoire via **2.14.A — Checklist inter-modules**
- **Lot 3 — TIMESHEETS & MOBILE OPS (V1)**
    - Timesheets (create/submit/validate) + entries
    - Worker check-in / check-out (sans géoloc V1)
    - Incidents minimal (absence/accident/noncompliance)
    - (option) règles enforcement sur validation timesheets (lecture flags)
    - ⛔ Aucun lien direct avec devis ou facturation (V1)
- **Lot 4 — CRM / CLIENTS / VIGILANCE / RFP**
    - Leads + conversion client
    - Clients multi-sites + documents vigilance + expirations
    - RFP interne (invites, responses, allocation)
    - Tasks transverses (si non livré avant)
- **Lot 5 — ATS / WORKERS (RECRUTEMENT)**
    - Job offers + applications
    - Candidates + parsing IA assisté (orchestration)
    - Workers dossier + documents + expirations
    - Matching simple (rules + score indicatif)
- **Lot 6 — FINANCE (DEVIS / FACTURES / COMMISSIONS)**
    - Quotes + invoices (Mode C / C1 — émission manuelle, gating enforcement obligatoire)
    - Payments minimal
    - Commissions consultants
    - Gating facturation basé sur enforcement flags (can_issue_invoice)
- **Lot 7 — COMPLIANCE ENGINE RÉMUNÉRATION (ADVANCED)**
    - Salary engine (IDCC/classification/minima) + versions
    - Remuneration snapshots immuables + explicabilité
    - Règles “frais vs salaire” + exclusions
    - Durée cumulée + seuils (365j) + warnings/blocks
- **Lot 8 — RISK / CERTIFICATION / MARKETPLACE**
    - Risk score agence (versionné)
    - Certification + gating marketplace
    - Ranking transparent + logs
    - Marketplace RFP + matching + allocation assistée

> 📌 Règle de pilotage : **1 lot = 1 PR = tests + audit + outbox + RBAC**
> 
> 
> Tout écart au contrat (DB / OpenAPI / Events / RBAC) ⇒ **STOP + validation**.
> 

### 9.1 — Règles transverses d’exécution (IA & humains)

- Aucun lot ne démarre sans contrats LOCKED (DB / OpenAPI / Events / RBAC)
- Aucun lot ne modifie un lot précédent sans validation explicite
- Toute logique critique doit être testée + auditable
- Toute ambiguïté = STOP + clarification dans le socle

## 10) POINTS À AJOUTER DANS NOTION (POUR NE RIEN PERDRE)

- A. Ajouter une SECTION “PILIERS FONCTIONNELS” (les 6 pôles) avec liens vers modules M1..M13
- B. Ajouter une SECTION “RÔLES & PERMISSIONS” (matrice RBAC) + parcours par rôle
- C. Ajouter une SECTION “DATA & LEGAL SOURCES” (sources IDCC, versions, effective dates)
- D. Ajouter une SECTION “SECURITY BASELINE” (hashing, access logs, encryption, retention)
- E. Ajouter une SECTION “ACCEPTANCE TESTS” (Given/When/Then) pour la chaîne critique
- F. Ajouter une SECTION “MVP V1/V2” (ce qui est assisté vs auto) — notamment SIPSI/A1

## 11) PROMPT “MAÎTRE” À DONNER AUX IA (COMMUN À TOUS)

Tu es une IA contributrice sur un SaaS RegTech multi-tenant.
Tu dois respecter: contract-first, multi-tenant isolation, versioning, audit logs, tests.
Tu produis des livrables vérifiables, pas des intentions.
Toute sortie hors périmètre = rejet.

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
- 2026-02-17: Gel V1 officialisé (socle verrouillé).
