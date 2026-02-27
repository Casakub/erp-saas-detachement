# ERP Détachement europe

# ERP Détachement europe — HUB PILOTAGE IA (V1)

**Statut**: 🟢 Ready-to-code (CDC complet — Lots 1→8 READY)
**Owner**: Alexandre
**Vision**: RegTech HR SaaS (France-first, Europe-ready) — moteur conformité intelligent + marketplace certifiée.
**Personas**: Agence (desktop), Intérimaire (mobile-first), Client (lecture), Admin plateforme.

---

# 0) SOMMAIRE & RÈGLES DU JEU (à lire avant toute IA)

## Objectif

- Construire une plateforme modulaire, audit-able, explicable, multi-tenant.
- La conformité (rémunération / A1 / durée / docs / conventions) pilote le score, l’enforcement, l’accès marketplace, la certification et le ranking.

## Non-négociables

- Contract-first (OpenAPI / schémas) avant code.
- Multi-tenant strict (tenant_id partout + RLS / isolation).
- Pas de logique métier critique dans l’outil no-code.
- Versionning modèles (scoring / ranking / legal rules) + snapshots immuables.
- Tests obligatoires.

## Stack cible (proposition compatible IA)

- Web: Next.js (desktop admin) + PWA (mobile worker)
- DB: Postgres (Supabase possible) + migrations
- Storage: S3 compatible + hashing + audit logs
- Orchestration: no-code (n8n/Make/Pipedream) = notifications, PDF, IA parsing, batch jobs (mais pas règles)
- AI: scoring CV, extraction docs, résumé risques (assisté)

## 0.1 BRANDING & IDENTITÉ PRODUIT (NON NÉGOCIABLE)

- Le produit est une MARQUE SaaS DISTINCTE.
- “YoJob” n’est pas la marque visible du logiciel.
- Le nom final pourra être défini ultérieurement (branding configurable).

### Positionnement produit :

“La plateforme européenne de gestion et conformité du détachement de personnel.”

### Principes branding :

- Branding découplé du code (logo, couleurs, nom).
- Aucun texte, nom de variable, route ou schéma ne doit être lié à “YoJob”.
- Prévoir une configuration future de branding par tenant (V2).

### Objectif stratégique :

- Valorisation indépendante
- Possibilité de spin-off
- Scalabilité commerciale

## 0.2 DUAL INTERFACE STRATEGY (À GRAVER)

Le produit repose sur DEUX INTERFACES DISTINCTES connectées au même backend.

### 🖥 Desktop — Agences / Consultants / Admin

Interface opérationnelle complète :

- CRM & Prospection
- Gestion Clients
- ATS & Matching
- Missions
- Compliance Case
- Finance (devis / factures)
- Reporting & Risk
- Coffre-fort
- Paramètres

### 📱 Mobile-first — Intérimaires (PRODUIT PARALLÈLE)

Ce n’est PAS une version réduite du desktop.

Fonctionnalités mobile :

- Onboarding sécurisé
- Upload documents
- Consultation missions
- Planning
- Check-in / Check-out (présence)
- Consultation rémunération & indemnités
- Notifications (A1 / documents / missions)

### Principe clé :

- UX mobile pensée terrain
- Zéro jargon
- Zéro surcharge fonctionnelle

---

[SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN)](ERP%20D%C3%A9tachement%20europe/SECTION%201%20%E2%80%94%20PROMPTS%20FIGMA%20MAKE%20(PAR%20PAGE)%20(DESIGN)%20308688d6a59680a59142d73793327a6a.md)

[**SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV)**
](ERP%20D%C3%A9tachement%20europe/SECTION%202%20%E2%80%94%20PROMPTS%20IA%20BACKEND%20(PAR%20MODULE)%20(DEV)%20308688d6a59680ebb64fe4ddb4223b41.md)

[**SECTION 3 — TEMPLATE NOTION / CLICKUP (PILOTAGE IA)**](ERP%20D%C3%A9tachement%20europe/SECTION%203%20%E2%80%94%20TEMPLATE%20NOTION%20CLICKUP%20(PILOTAGE%20IA)%20308688d6a59680acb6b6f7306e1d9a4b.md)

[**SECTION 4 — AI CONTRIBUTION RULES (OFFICIEL)**
](ERP%20D%C3%A9tachement%20europe/SECTION%204%20%E2%80%94%20AI%20CONTRIBUTION%20RULES%20(OFFICIEL)%20308688d6a5968046b8c5d098ffffff15.md)

[**SECTION 5 — “DEFINITION OF DONE” GLOBAL (DoD)**
](ERP%20D%C3%A9tachement%20europe/SECTION%205%20%E2%80%94%20%E2%80%9CDEFINITION%20OF%20DONE%E2%80%9D%20GLOBAL%20(DoD)%20308688d6a596807789b6f97e7433f4fd.md)

[**SECTION 6 — Checklist Produit V1 (Globale)**](ERP%20D%C3%A9tachement%20europe/SECTION%206%20%E2%80%94%20Checklist%20Produit%20V1%20(Globale)%20308688d6a5968026b6d6e3a94a6817f4.md)

[**SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE)**
](ERP%20D%C3%A9tachement%20europe/SECTION%207%20%E2%80%94%20ORCHESTRATION%20NO-CODE%20(AUTORIS%C3%89E)%20308688d6a59680f2bff6f404c1ac8b90.md)

[**SECTION 8 — PLAN D’EXÉCUTION (ordre conseillé)**
](ERP%20D%C3%A9tachement%20europe/SECTION%208%20%E2%80%94%20PLAN%20D%E2%80%99EX%C3%89CUTION%20(ordre%20conseill%C3%A9)%20308688d6a596809584e4eef380abe47c.md)

[**SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS)**
](ERP%20D%C3%A9tachement%20europe/SECTION%209%20%E2%80%94%20IMPLEMENTATION%20SUBSTRATE%20(STACK%20%26%20CONVENTIONS)%2030a688d6a596803a8541ef09201359f2.md)

✅ SECTION 9 LOCKED v1.1 (2026-02-20) — Ready-to-code activé.
SECTION 9 (substrat d’exécution backend) est distincte de la PHASE 9 de la SECTION 8 (no-code & automatisation).

[SOCLE TECHNIQUE GELÉ — V1 (LOCKED)](ERP%20D%C3%A9tachement%20europe/SOCLE%20TECHNIQUE%20GEL%C3%89%20%E2%80%94%20V1%20(LOCKED)%20308688d6a596805b8e40c7f8a22944ea.md)

Socle V1 gelé au 2026-02-17 (voir page SOCLE TECHNIQUE GELÉ — V1 (LOCKED)).

## Changelog doc

- 2026-02-18: Ajout référence SECTION 9 dans le hub + rappel Ready-to-code (LOCK SECTION 9), sans changement métier.
- 2026-02-21: Statut 🟡 Build → 🟢 Ready-to-code. SECTION 9 LOCKED v1.1. Lien SECTION 9 corrigé (bon ID fichier). CDC complet Lots 1→8.
