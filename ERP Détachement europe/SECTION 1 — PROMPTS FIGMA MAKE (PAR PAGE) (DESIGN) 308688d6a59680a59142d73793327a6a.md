# SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN)

> Règle: 1 prompt = 1 page/flow = 1 livrable clair + variantes d’états.
> 

## ⚠️ RÈGLE FIGMA MAKE — OBLIGATOIRE

- Cette section concerne UNIQUEMENT le DESIGN & UX.
- Aucune logique métier, règle de calcul ou automatisation ne doit être implémentée dans Figma.
- Les écrans doivent VISUALISER les états (score, blocage, conformité) sans implémenter la logique.
- Toute règle métier est gérée par le backend.

## 1.0 — PROMPT MAÎTRE (à utiliser avant les pages)

Tu es Lead Product Designer SaaS RegTech B2B (compliance, finance, audit).

Produit:
Plateforme de conformité détachement (France-first, Europe-ready) pour agences + mobile intérimaire.
Cœur: Score conformité (0–100), explications, blocages (enforcement), snapshots rémunération, coffre-fort, audit trail.
Marketplace: catalogue + RFP + allocation auto (accès conditionné à certification).

Contraintes:
- Desktop 1440 (agence/admin)
- Mobile 390 PWA (intérimaire)
- UI sérieuse, lisible, data-heavy, audit-friendly
- Composants modulaires, tokens, states (conforme/warning/bloqué)

Livrable:
Fichier Figma structuré (Pages + Components + States + Flows) + design system d’abord.

Chaque page critique (Mission, Finance, Compliance, Marketplace) doit inclure :
- état NORMAL
- état WARNING
- état BLOCKED (actions désactivées + message explicite)

## **1.1 — Design System (obligatoire en 1er)**

Créer un design system complet: couleurs (success/warn/danger), typographies, boutons (disabled/danger), badges, alertes, tables, cards, modals “blocked”, composants timeline, composants scoring (donut + breakdown), composants “audit log”, formulaires upload docs, champs multi-langue, empty/loading/error.
Desktop 1440, Mobile 390. Accessibilité.

## **1.2 — Landing page (3 personas)**

Designer une landing page SaaS avec 3 entrées: Agences / Clients / Intérimaires.
Sections: value prop, preuve “inspection-ready”, conformité (A1, durée 12 mois, frais vs salaire), démo visuelle dashboards, pricing (Starter/Pro/Elite), FAQ, formulaires segmentés.
CTA: Demander démo / Devenir agence / S’inscrire intérimaire.

## **1.3 — Auth & Onboarding Agence**

Écrans: login, reset, choix langue, onboarding agence (profil, pays, secteurs, corridors, paramètres compliance).
États: erreur auth, first login, MFA (placeholder).

## **1.4 — Desktop Navigation Shell**

Créer le shell: sidebar + header + breadcrumbs + global search + notifications + user menu.
Sections: Dashboard, CRM, Clients, ATS, Missions, Conformité, Finance, Coffre-fort, Marketplace, Paramètres.

## **1.5 — Dashboard Agence (pilotage)**

Widgets: score conformité moyen, indice risque inspection, missions bloquées, A1 expirants, docs expirants, durée >300j, factures impayées, accès marketplace, ranking.
CTA: créer mission, publier annonce, créer devis/facture, voir alertes.

## **1.6 — CRM Pipeline + Fiche Lead**

Pipeline drag/drop + fiche lead (infos, activités, notes, pièces, convert to client).
États: lead chaud, perdu, gagné.

## **1.7 — Clients: liste + fiche + vigilance**

Liste clients, fiche client (sites, contacts, docs vigilance, missions, factures).
Vigilance: statut doc (valid/expiring/expired/missing) + upload + alert.

## **1.8 — ATS: job offers + candidatures + fiche candidat**

Annonces: créer/éditer, corridor, secteur, compétences, dates.
Candidatures: tableau tri score IA, parsing CV, shortlisting.
Fiche candidat: profil, documents, score IA (explicable), actions: convertir worker / affecter mission.

## **1.9 — Workers (dossier intérimaire desktop)**

Fiche worker: identité, docs, expirations, habilitations, missions, A1 status, coffre-fort.
CTA: demander doc, relancer, exporter dossier.

## **1.10 — Missions: liste + création + fiche mission**

Création mission: client, worker, corridor, secteur, IDCC, classification, dates, heures, rémunération (inputs).
Fiche mission: onglets Détails / Conformité / Documents / Timesheets / Facturation / Audit.

## **1.11 — Mission > Conformité (CŒUR)**

Inclure: score global, breakdown catégories, bloc rémunération (minimum requis, admissible, frais exclus, snapshot), A1, durée 12 mois, checklist documents, enforcement (blocages + raisons).
Bouton: “Voir calcul détaillé” + “Exporter dossier inspection-ready”.
États: conforme / warning / blocked.

## **1.12 — Conformité Global (Dashboard + vues)**

Widgets risques + table missions avec filtres (corridor/secteur/client), vue “documents expirants”, vue “A1”, vue “durée”.

## **1.13 — Finance: devis + factures + commissions**

Devis: création/édition/statuts; Factures: statut paiement, relances; Commissions consultants.
États: facture bloquée (enforcement), overdue.

## **1.14 — Coffre-fort numérique (global)**

Recherche, filtres (entité/type/date), versionning, hash info, historique accès, permissions.

## **1.15 — Marketplace: catalogue + RFP + allocation auto**

Catalogue agences: badge certification, ranking score + composants visibles, corridors/secteurs.
RFP: création demande, mode allocation (manual/assisted/auto), shortlist, explications matching.
Allocation: écran “assignment” + accept/decline agence + reallocate.

## **1.16 — Paramètres (tenant)**

Langues, pays/corridors actifs, secteurs, modèles scoring/enforcement (verrouillés affichés), intégrations no-code, notifications, rôles & permissions, export compta.

## **1.17 — Mobile PWA Intérimaire (suite complète)**

Écrans: login OTP, dashboard, missions, conformité simplifiée, upload docs, planning, rémunération, notifications, support.
UX: zéro jargon, actions simples, statut clair (OK / action requise).

⚠️ Le produit mobile intérimaire est un PRODUIT À PART ENTIÈRE :
- UX dédiée terrain
- Aucun écran desktop “compressé”
- Simplicité maximale
- Priorité à la compréhension et à l’action

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
- 2026-02-17: Fix fence ambiguë (SECTION 1), sans changement métier.
