# SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN)

> Règle: 1 prompt = 1 page/flow = 1 livrable clair + variantes d’états.
> 

## ⚠️ RÈGLE FIGMA MAKE — OBLIGATOIRE

- Cette section concerne UNIQUEMENT le DESIGN & UX.
- Aucune logique métier, règle de calcul ou automatisation ne doit être implémentée dans Figma.
- Les écrans doivent VISUALISER les états (score, blocage, conformité) sans implémenter la logique.
- Toute règle métier est gérée par le backend.

## 0.9 — PROMPT D’AMORÇAGE GLOBAL (OBLIGATOIRE EN TOUT PREMIER)

Avant toute création de page/flow, appliquer ce prompt.

Prompt à utiliser dans Figma Make:

- Tu conçois un produit SaaS RegTech multi-tenant en mode contract-first.
- Tu dois lire et suivre le fichier racine `FIGMA_MAKE_CONCEPTION_GUIDE.md`.
- Tu dois lire et suivre le fichier racine `FIGMA_MAKE_DOC_IMPORT_PACK.md` pour charger le bon périmètre documentaire.
- Tu dois organiser le fichier Figma selon les dossiers/pages définis dans ce guide.
- Tu dois produire des écrans orientés états backend (`NORMAL`, `WARNING`, `BLOCKED`) sans logique métier implémentée.
- Tu dois préparer un handoff design compatible avec une implémentation TypeScript modulaire.
- Tu dois respecter les contraintes V1: mobile PWA online-only, allocation marketplace assistée (pas d’auto-allocation), backend décisionnel, no-code orchestration uniquement.
- Tu dois livrer:
- arborescence Figma complète (pages + composants + variants + states),
- conventions de nommage cohérentes modules/lots,
- mapping écran -> module (`M1..M13`, `M7bis`) -> état backend attendu.
- Tu ne dois pas:
- inventer des règles légales,
- créer des décisions automatiques côté UI,
- introduire des fonctionnalités V2 dans des écrans V1.

Sortie attendue:
1. Structure Figma initiale complète.
2. Design system prêt.
3. Liste des écrans prioritaires Lot 1 à Lot 8 avec états requis.

## 0.10 — MODE IMPORT MANUEL DOCS (GITHUB -> FIGMA MAKE)

Contexte:
- En l’absence de synchronisation bidirectionnelle native Figma Make <-> GitHub, les docs sont importées manuellement.

Règle:
- Ne pas importer “tout le cahier des charges” brut dans un seul bloc.
- Importer un pack documentaire ciblé par lot pour limiter le bruit de contexte.

Dossier Figma obligatoire:
1. Créer une page `00_DOCS_READONLY`.
2. Créer des sous-sections:
- `00_DOCS_GLOBAL_RULES`
- `01_DOCS_LOT_ACTIVE`
- `02_DOCS_MAPPING_SCREEN_TO_MODULE`
- `03_DOCS_DECISIONS_V1_V2`

Référence source du pack:
- `FIGMA_MAKE_DOC_IMPORT_PACK.md` (racine repo).

Critère de conformité avant design:
1. Le lot actif est identifié.
2. Les contraintes V1/V2 du lot sont rappelées dans `00_DOCS_READONLY`.
3. Les pages design créées ne dépassent pas le scope du lot actif.

## 0.11 — PROMPT DE CONTRÔLE AVANT CHAQUE PAGE

Prompt à utiliser juste avant de générer un écran:

- Vérifie le lot actif et les modules concernés.
- Vérifie les contraintes V1 applicables depuis `00_DOCS_READONLY`.
- Rappelle les exclusions V2 à ne pas implémenter visuellement.
- Rappelle les états requis (`NORMAL`, `WARNING`, `BLOCKED`).
- Si la demande sort du lot actif, STOP et demande validation.

## 1.0 — PROMPT MAÎTRE (à utiliser avant les pages)

Tu es Lead Product Designer SaaS RegTech B2B (compliance, finance, audit).

Produit:
Plateforme de conformité détachement (France-first, Europe-ready) pour agences + mobile intérimaire.
Cœur: Score conformité (0–100), explications, blocages (enforcement), snapshots rémunération, coffre-fort, audit trail.
Marketplace: catalogue + RFP + allocation assistée V1 (accès conditionné à certification).

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

### Direction visuelle moderne (obligatoire)

- Construire une direction visuelle premium, claire et crédible B2B (pas de template générique).
- Privilégier lisibilité, hiérarchie forte, contraste maîtrisé et sections narratives.
- Prévoir variantes desktop + mobile dès le départ.
- Prévoir états UI réels (hover/focus/disabled/loading/success/error) pour CTA et formulaires.

### Landing “CMS-ready” (design de l’outil de gestion contenu)

Concevoir les écrans d’un mini CMS marketing lié à la landing:

- Liste des pages marketing (`slug`, langue, statut draft/published, updated_at).
- Éditeur par blocs (hero, proof, features, faq, cta, legal section).
- Gestion SEO par page: `meta_title`, `meta_description`, `og_title`, `og_description`, `og_image`, `canonical_url`.
- Gestion indexation: `robots_index`, `robots_follow`, `sitemap_inclusion`.
- Prévisualisation desktop/mobile avant publication.
- Historique versions (lecture seule en V1 design, sans logique backend).

### Traduction assistée (DeepL / ChatGPT / Claude) — design only

Concevoir un workflow UX de traduction de contenu marketing:

- Sélecteur langue source/cible.
- Actions: “Pré-traduire”, “Réviser”, “Valider”, “Publier”.
- Provider abstrait côté UI (`DeepL`, `OpenAI`, `Claude`) sans implémentation technique.
- Diff visuel source vs traduction.
- Statuts traduction: `not_started`, `machine_draft`, `in_review`, `approved`, `published`.
- Toujours inclure validation humaine avant publication.

### SEO-first (obligatoire)

- Concevoir chaque template landing pour un rendu SEO robuste:
- H1 unique, structure H2/H3 cohérente, zone FAQ structurée.
- Blocs “preuve” et “cas d’usage” exploitables en rich snippets.
- Emplacement explicite pour données structurées (schema.org) dans le handoff.
- Prévoir composants dédiés pour liens internes, breadcrumbs marketing et CTA contextuels.
- Prévoir états multilingues avec logique `hreflang` visualisable.

Contraintes:

- Figma ne calcule pas de score SEO et ne génère pas de logique d’indexation.
- Le backend/CMS décide publication, routes, sitemap, robots, canonical.
- L’UI expose uniquement les champs et états nécessaires.

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

## **1.15 — Marketplace: catalogue + RFP + allocation assistée (V1)**

Catalogue agences: badge certification, ranking score + composants visibles, corridors/secteurs.
RFP: création demande, mode allocation (manual/assisted), shortlist, explications matching.
Allocation: écran “assignment” + accept/decline agence + reallocate.
⚠️ V1: aucune allocation automatique active. Prévoir un placeholder explicite “Auto (V2)”.

## **1.16 — Paramètres (tenant)**

Langues, pays/corridors actifs, secteurs, modèles scoring/enforcement (verrouillés affichés), intégrations no-code, notifications, rôles & permissions, export compta.

## **1.17 — Mobile PWA Intérimaire (suite complète)**

> ⚠️ **Remplacé et détaillé par 1.19 — Mobile PWA flows détaillés (A→F).** Ce prompt reste en référence pour les principes UX globaux. La conception opérationnelle flow par flow se fait sur la base du prompt **1.19**.

Écrans: login OTP, dashboard, missions, conformité simplifiée, upload docs, planning, rémunération, notifications, support.
UX: zéro jargon, actions simples, statut clair (OK / action requise).

⚠️ Le produit mobile intérimaire est un PRODUIT À PART ENTIÈRE :
- UX dédiée terrain
- Aucun écran desktop “compressé”
- Simplicité maximale
- Priorité à la compréhension et à l’action

## **1.18 — Timesheets (desktop agence + mobile worker)**

### Vue desktop — Agence

Concevoir l'écran de gestion des timesheets côté agence.

Liste timesheets par mission :
- Colonnes : worker, mission, période (semaine), total heures, statut, billing_status, actions.
- Filtres : statut (`draft / submitted / client_validated / agency_validated / validated / rejected`), mission, worker, période.
- Badges statut colorés : draft (gris), submitted (bleu), client_validated (bleu-clair), agency_validated (bleu-moyen), validated (vert), rejected (rouge).

Fiche timesheet (détail) :
- Header : mission liée, worker, période (lun→dim), total heures calculé.
- Tableau entries daily : colonnes date, heures, notes. Ligne par jour de la semaine.
- Bloc double validation : deux zones distinctes — "Validation client" (statut + date + nom) et "Validation agence" (idem). Badge "En attente" si non encore validé par le rôle.
- Bloc enforcement : si `can_validate_timesheets = false` → banner rouge avec `blocking_reasons` explicites. Bouton "Valider" désactivé.
- Actions : valider (si rôle autorisé + enforcement OK), rejeter (modal de rejet avec champ reason + notes), voir audit.

États obligatoires à couvrir :
- Timesheet soumise, en attente validation client.
- Timesheet bloquée enforcement (mission non conforme) — actions désactivées + raison visible.
- Timesheet rejetée — raison + possibilité de rework worker.
- Timesheet fully validated — billing_status bascule `not_billed → billed` visible.

### Vue mobile — Worker (saisie + soumission)

Écran hebdomadaire :
- Semaine courante avec 7 jours. Chaque jour = champ heures (0 à 24h, validation simple).
- Bouton "+ Ajouter" pour entry quotidienne.
- Total heures semaine recalculé en temps réel.
- État de la mission affiché (active / bloquée enforcement). Si bloquée : message clair, saisie autorisée mais soumission bloquée.

Soumission :
- Bouton "Soumettre la semaine" — confirmation modale (récapitulatif heures + avertissement si mission warning).
- Si `can_validate_timesheets = false` → bouton désactivé + message explication (jamais de jargon technique).

Historique timesheets :
- Liste des semaines passées avec statut visuel simple : soumis / validé / rejeté.
- Timesheet rejetée : notification + raison lisible + bouton "Corriger".

Contraintes UX mobile :
- Zéro jargon : "Semaine validée" pas "TimesheetValidated". "Correction requise" pas "rejected".
- Un écran = une action. Pas de tableau complexe.
- Feedback immédiat sur chaque saisie.

---

## **1.19 — Mobile PWA — Flows détaillés (intérimaire terrain)**

> Ce prompt remplace et précise 1.17. Concevoir chaque flow comme un parcours autonome.

### Flow A — Onboarding & Login

- Écran splash (logo produit + langue).
- Login OTP : saisie numéro → code SMS → accès dashboard.
- Premier login : confirmation identité + langue + notification de pièces à fournir.
- États : erreur OTP, code expiré, compte désactivé (message clair).

### Flow B — Dashboard mobile

- Vue synthétique : missions actives (1 card par mission), alertes en cours (docs manquants / A1 / mission bloquée), notifications non lues.
- Cards mission : client, dates, statut (active/warning/blocked), bouton check-in rapide.
- Aucun chiffre de conformité brut — statut visuel uniquement : vert / orange / rouge + texte explicatif simple.

### Flow C — Check-in / Check-out

- Écran check-in : carte mission, bouton grand "Je pointe mon arrivée", heure côté serveur affichée après confirmation.
- Confirmation visuelle : "Arrivée enregistrée à 08h47" (horodatage serveur, non modifiable).
- Écran check-out : même logique, heure de départ.
- État : déjà pointé → afficher heure d'arrivée + bouton check-out uniquement.
- Erreur : mission inactive ou bloquée → message clair, pointage impossible, raison affichée sans jargon.
- Pas de géolocalisation V1 (aucun champ GPS visible).

### Flow D — Upload documents

- Liste pièces demandées (classées : manquantes / en attente / valides / expirantes).
- Card document : type, statut, date expiration si connue, bouton "Fournir".
- Upload : sélection photo / fichier → aperçu → confirmation → spinner upload → statut mis à jour.
- États : upload réussi (confirmation verte), erreur upload (retry), document refusé (raison + re-upload possible).
- Aucun champ technique (hash, vault_id) visible.

### Flow E — Consultation rémunération & indemnités

- Écran lecture seule : rémunération déclarée (montant brut), indemnités (logement / transport / repas — séparées), total déclaré.
- Mention claire : "Ces montants sont déclarés par l'agence. En cas de désaccord, contacter l'agence."
- V1 : lecture des données saisies par l'agence (pas de calcul IDCC côté mobile).
- Pas de snapshot ni calcul affiché — uniquement les valeurs déclarées.

### Flow F — Notifications

- Centre de notifications : liste chronologique (A1 à fournir / doc expirant / mission modifiée / timesheet rejetée).
- Card notification : icône type, message clair en langue worker, date, action rapide si applicable ("Fournir le doc", "Voir la mission").
- Badge non-lu sur l'icône dashboard.
- Marquer tout comme lu.

Contraintes transversales tous flows :
- Langue résolue automatiquement selon préférence worker (`fr/en/pl/ro`).
- Accessibilité : contraste élevé, taille texte minimum 16px actions, tap targets ≥ 44px.
- Offline V1 : écran d'erreur explicite si pas de connexion (jamais de fausse action silencieuse).

---

## **1.20 — RFP Interne (M4) — Mise en concurrence agences**

> À ne pas confondre avec le Marketplace RFP externe (1.15). Le RFP interne est l'outil de pilotage côté agence / admin pour comparer et sélectionner des agences partenaires sur un besoin client.

### Liste RFPs internes

- Tableau : titre besoin, client, corridor, secteur, dates, volume (headcount), statut (`draft / open / evaluating / closed`), visibilité (`private / public`).
- Filtres : statut, client, corridor, secteur.
- Bouton : "Créer une demande".

### Création / édition RFP

- Formulaire structuré : client (sélecteur), corridor origine/destination, secteur, intitulé poste, volume, dates souhaitées, IDCC cible (optionnel).
- Champ visibilité : `Interne (privé)` ou `Publier sur Marketplace` (bascule).
- Résumé besoin (texte libre).
- CTA : "Enregistrer brouillon" / "Publier + inviter agences".

### Gestion des réponses agences

- Vue par RFP : liste des agences invitées + statut réponse (en attente / réponse reçue / refus).
- Card réponse agence : nom agence, badge certification, taux proposé, délai, score comparateur (4 critères : prix / conformité / expérience / délai) + total pondéré.
- Vue comparateur : tableau côte-à-côte des réponses reçues avec tri par critère.
- CTA : "Sélectionner cette agence" → confirmation modale → statut RFP = `closed`, agence = allocated.

### Log anti-désintermédiation

- Bloc visible sur la fiche RFP : historique des contacts directs loggués (date, nature du contact, note contextuelle).
- Mention : "Tout contact direct avec une agence est tracé automatiquement".

États obligatoires :
- RFP en brouillon (éditable, non publiée).
- RFP ouverte (en attente réponses).
- RFP en évaluation (réponses reçues, comparateur actif).
- RFP clôturée (agence sélectionnée, décision tracée).
- RFP publiée marketplace (`visibility=public`) — badge distinctif.

---

## **1.21 — Admin Plateforme (Super Admin)**

> Interface réservée au rôle `Platform Super Admin`. Distincte des paramètres tenant (1.16). Accès global, multi-tenant, sans scope tenant.

### Dashboard Admin Plateforme

- Widgets globaux : nombre de tenants actifs, missions en cours (total), agences certifiées vs non certifiées, alertes compliance cross-tenants (sans données PII visibles), events outbox en erreur.
- Accès rapide : gestion tenants, grilles IDCC, country-rulesets, audit trail global, suspensions.

### Gestion des tenants

- Liste tenants : nom, plan (Starter/Pro/Elite), statut (actif/suspendu/révoqué), date création, nombre missions actives.
- Fiche tenant : informations générales, utilisateurs, modules activés, log activité, actions (suspendre / réactiver / révoquer).
- Modal suspension : raison obligatoire + durée (temporaire / définitive).

### Gestion grilles IDCC (salary-grids)

- Liste grilles : IDCC, secteur, classification, montant minimum, `period_type`, `effective_date`, `model_version`, statut (active / archivée).
- Import nouvelle grille : formulaire structuré (IDCC + classification + montant + period_type + date d'entrée en vigueur).
- Historique versions : ligne par version, conservée — pas de delete. Mention visible "Historique immuable".
- Filtres : secteur, IDCC, date d'application.

### Gestion country-rulesets

- Liste règles par pays : pays, seuil warning (jours), seuil critical (jours), statut.
- Édition seuil : formulaire simple (warning_days / critical_days) + confirmation obligatoire ("Ce changement affecte tous les calculs de durée cumulée pour ce pays").

### Gestion mandatory-pay-items

- Liste primes obligatoires : libellé, `is_reimbursable` (toujours false ici), secteur/IDCC cible, statut.
- Ajout / désactivation (pas de delete).

### Audit trail global (cross-tenant)

- Table d'audit filtrée par : module, action, tenant (optionnel), date, acteur.
- Lecture seule. Export CSV.
- Aucune donnée PII en clair — références par ID uniquement.

### Suspensions / révocations agences marketplace

- Liste agences avec accès marketplace actif.
- Actions : suspendre (avec raison) / réactiver / révoquer certification.
- Confirmation modale obligatoire avec récapitulatif de l'impact (missions en cours bloquées ?).

États obligatoires :
- Vue normale (tenant actif, grilles à jour).
- Vue alerte (events outbox en erreur, tenant suspendu).
- Import grille : succès / erreur validation (IDCC non reconnu, dates incohérentes).

---

## **1.22 — Égalité de Traitement (M8.3) — Check manuel V1**

> Objectif design: visualiser un contrôle “égalité de traitement” assisté, sans décision automatique en V1.

### Écran — Formulaire de check (lié à une compliance case)

- Header: mission, worker, compliance_case_id, date du contrôle, agent responsable.
- Bloc “Référence pays hôte”:
- montant de référence (champ numérique),
- période (`hourly` / `monthly`),
- source de référence (texte libre encadré).
- Bloc “Items directive” (checkboxes):
- temps de travail conforme,
- congés payés conformes,
- santé/sécurité conforme,
- hébergement conforme (optionnel / N.A.).
- Bloc “Traitement des allocations” (`wage` / `reimbursement` / `mixed`).
- Bloc notes justification.
- CTA: “Enregistrer le check”.

### Écran — Résultat du check (snapshot immuable)

- Card résultat:
- statut `conforme` / `non conforme` / `données insuffisantes`,
- `gap_amount` et `gap_percentage`,
- source de la référence salariale.
- Timeline des checks successifs (historique immuable, newest first).
- Badge warning si `NO_REMUNERATION_SNAPSHOT`.
- Zone “Traçabilité”: date, acteur, id snapshot, lien audit.

### États obligatoires

- État conforme: tous items validés + comparaison rémunération conforme.
- État non conforme: au moins un item critique non conforme.
- État warning: snapshot rémunération absent (`NO_REMUNERATION_SNAPSHOT`), check enregistré avec données partielles.
- État lecture worker: lecture seule, aucune action d’édition.

### Contraintes UX contractuelles

- Ne jamais afficher un blocage automatique de mission en V1 depuis cet écran.
- Afficher un message explicite: “Alerte conformité — décision finale côté backend/humain”.
- Aucune logique de calcul dans Figma; visualisation uniquement des statuts et explications.

---

## **1.23 — Gestion des Permissions (RBAC) — Vue opérationnelle**

> Objectif design: couvrir explicitement les surfaces “Gestion des permissions” de l’ancien prototype, sans inventer de règles hors contrat.

### Écran — Liste des groupes de permissions

- Tableau: nom du groupe, tenant/agence, statut (`active`/`inactive`), périmètre (modules), date de mise à jour.
- Recherche par nom de groupe + filtres statut/tenant.
- CTA: “Nouveau groupe”.

### Écran — Fiche groupe de permissions

- Onglet “Permissions atomiques” par domaine: missions, compliance, finance, clients, workers, documents, rapports.
- Onglet “Rôles liés”: rôles autorisés sur le groupe.
- Onglet “Fonctionnalités activées” (toggles visuels): `sipsi`, `country_pack`, `api_access`, `advanced_reports`.
- Diff visuel “avant/après” lors d’une modification de droits.

### États obligatoires

- État normal: groupe actif et permissions cohérentes.
- État warning: combinaison sensible (ex: droits d’écriture larges) avec message de confirmation.
- État blocked: rôle non autorisé en édition (lecture seule explicite).

### Contraintes V1/V2

- V1: la matrice RBAC contractuelle reste la seule source de vérité backend.
- V1: les toggles sans surface API contractée doivent rester visuels (`disabled` + badge “V2 / hors contrat actif”).
- V2: extensions de feature toggles avancés possibles après contractualisation.

---

## **1.24 — Paramètres Utilisateur (profil, notifications, sécurité, préférences)**

> Objectif design: couvrir la granularité “Paramètres” de l’ancien prototype avec bornage V1 réaliste.

### Onglets à concevoir

- Profil: nom, email, téléphone, société, langue préférée.
- Notifications: canaux (`email`, `push`, `sms`), thèmes (missions, conformité, timesheets, finance).
- Sécurité: changement mot de passe, sessions actives (lecture), activité récente.
- Préférences: langue UI, format date/heure, fuseau horaire, densité d’affichage.

### États obligatoires

- Succès sauvegarde (toast + horodatage mise à jour).
- Erreur validation formulaire.
- Lecture seule si permission insuffisante.

### Contraintes V1/V2

- V1: MFA/2FA peut être affiché en placeholder, non activable si non contracté.
- V1: suppression de compte et export complet de données en zone “danger” uniquement si endpoint contracté; sinon état non disponible.
- Aucun écran paramètre ne doit contourner RBAC tenant.

---

## **1.25 — Rapports Système & Observabilité (V1 minimal, V2 avancé)**

> Objectif design: reprendre l’intention “Rapports système / Analytics système” du prototype tout en respectant le périmètre V1.

### Écran — Rapports système V1 (minimum)

- Blocs: santé générale (API/DB/outbox), incidents récents, export conformité, activité d’audit.
- Filtres: période, module, statut.
- CTA: exporter CSV (si surface contractée), actualiser.

### Écran — Monitoring opérationnel

- Journal d’événements: type, entité, statut, date, correlation_id.
- Vue erreurs: incidents ouverts/traités, priorité, dernier retry.
- Encart runbook: liens vers actions opérationnelles standardisées.

### États obligatoires

- Normal: indicateurs dans les seuils.
- Warning: erreurs récurrentes ou latence élevée.
- Blocked: indisponibilité d’une source critique (lecture dégradée explicite).

### Contraintes V1/V2

- V1: privilégier une vue agrégée et lisible, sans inventer de métriques infra non contractées.
- V2: onglets analytics avancés (croissance/distribution/conformité/système détaillé) peuvent être enrichis après validation contractuelle.

---

## **1.26 — Aide & Support (centre d’assistance produit)**

> Objectif design: couvrir l’entrée “Aide” du prototype pour réduire la friction utilisateur en exploitation.

### Écrans à concevoir

- Centre d’aide: recherche, catégories (auth, missions, conformité, finance, mobile).
- FAQ contextualisée par module.
- Contact support: formulaire incident/besoin, priorité, pièce jointe.
- Suivi ticket: statut (`open`, `in_progress`, `resolved`), historique échanges.

### États obligatoires

- Aide disponible + navigation par thème.
- Aucun résultat recherche (fallback guidé).
- Ticket créé avec référence.
- Ticket en attente d’informations.

### Contraintes

- Aucune décision métier dans le centre d’aide.
- Terminologie alignée avec le glossaire produit (M13).
- Prévoir variantes multilingues FR/EN/PL/RO.

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
- 2026-02-17: Fix fence ambiguë (SECTION 1), sans changement métier.
- 2026-02-21: Ajout prompts manquants 1.18 (Timesheets desktop + mobile), 1.19 (Mobile PWA flows détaillés A→F), 1.20 (RFP Interne M4), 1.21 (Admin Plateforme Super Admin). Couverture design 100 % alignée avec SOCLE + Section 2.
- 2026-02-23: Alignement V1 avec `SECTION 8` et `SECTION 10.F` (Marketplace en allocation assistée, auto déplacée V2) + ajout prompt 1.22 “Égalité de Traitement (M8.3)”.
- 2026-02-23: Ajout du prompt 0.9 d’amorçage global + référence au guide racine `FIGMA_MAKE_CONCEPTION_GUIDE.md`.
- 2026-02-23: Ajout du mode `import manuel docs` (0.10) + prompt de contrôle lot avant chaque page (0.11) + référence `FIGMA_MAKE_DOC_IMPORT_PACK.md`.
- 2026-02-23: Ajout prompts 1.23 à 1.26 (permissions avancées, paramètres utilisateur détaillés, rapports système V1/V2, aide/support) pour combler les écarts avec l’ancien prototype.
