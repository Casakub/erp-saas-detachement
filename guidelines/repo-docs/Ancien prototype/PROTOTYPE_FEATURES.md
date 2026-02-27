# PROTOTYPE_FEATURES — Référentiel fonctionnel (extrait des captures PDF)

> Source : exports PDF de maquettes/prototype (Admin/Backoffice).  
> Objectif : servir de **checklist** pour comparer la couverture du cahier des charges (CDC) et des docs projet.  
> Remarque : ce référentiel reflète les éléments lisibles dans les captures ; si un écran/élément n’apparaît pas dans les PDFs, il peut manquer ici.

---

## 0) Structure de navigation (menu latéral)

- **Dashboard Administrateur**
- **Gestion Agences**
- **Analytics Système**
- **Gestion des Permissions**
- **Missions globales**
- **Conformité globale**
- **Tous les Talents**
- **Tous les Clients**
- **Rapports système** (entrée menu mentionnée)
- **Paramètres**
- **Aide** (entrée menu mentionnée)

Éléments communs (header) :
- Barre de recherche globale : “Rechercher missions, talents…”
- Boutons fréquents selon page : **Filtrer**, **Exporter**, **Actualiser**, **Nouveau** (ex: agence, A1, groupe).

---

## 1) Dashboard Administrateur (plateforme)

### 1.1 KPIs (cartes)
- Agences actives (+ variation mensuelle)
- Missions actives (+ % vs mois dernier) + total missions créées
- Talents inscrits (+ % vs mois dernier) + % avec documents à jour
- Revenus mensuels (valeur € + % vs mois dernier)
- Marge moyenne (ex: “12%”)
- Score conformité (ex: 94 + “+2 pts ce mois”)
- Documents à jour (nombre)
- Pays couverts (+ variation)

### 1.2 Graphs
- Croissance mensuelle (talents / missions)
- Revenus mensuels

### 1.3 Table “Top agences par activité”
- Agence
- Missions
- Talents
- Conformité
- Variation (mensuelle)

### 1.4 Alertes conformité (avec CTA)
- Alertes par pays/type (exemples visibles : **SIPSI** manquantes France, **A1** expirent Allemagne)
- Action : bouton/CTA “Traiter”

### 1.5 Activités récentes (audit / journal)
- Liste d’événements récents (actions et entités concernées)

---

## 2) Analytics Système (tableaux de bord & métriques)

### 2.1 Contrôles
- Filtre période (ex: “12 derniers mois”)
- Boutons : **Actualiser**, **Exporter**

### 2.2 KPIs
- Agences actives (vs mois dernier)
- Talents inscrits (vs mois dernier)
- Missions créées (vs mois dernier)
- Revenus mensuels (vs mois dernier)

### 2.3 Onglets
- **Croissance**
- **Distribution**
- **Conformité**
- **Système**

### 2.4 Onglet “Croissance”
- Évolution mensuelle : agences actives / talents inscrits
- Évolution mensuelle : missions créées
- Évolution mensuelle : revenus

### 2.5 Onglet “Distribution”
- Répartition talents par pays (graph)
- Revenus par pays (graph)
- Table métriques par pays :
  - Pays
  - Agences
  - Talents
  - Missions
  - Revenus
  - Revenu par talent

### 2.6 Onglet “Conformité”
- Vue d’ensemble des métriques :
  - **A1 Certificates** (volumétrie + progression)
  - **Pre-declarations** (volumétrie + progression)
  - **SIPSI Submissions** (volumétrie + progression)
- “Validité des documents” (barres / statuts)
- “Alertes” (liste) :
  - A1 expirés
  - Pré-déclarations en attente
  - Documents expirant < 15 jours
  - (autres alertes visibles selon capture)

### 2.7 Onglet “Système”
- Health checks (liste) :
  - API
  - Base de données
  - Intégration(s) (ex: SIPSI)
- Performance 24h (graph)
- Activité API
- Ressources infra : CPU / mémoire / stockage

---

## 3) Gestion des Agences

### 3.1 KPIs page
- Total agences
- Agences actives
- En attente
- Revenus mensuels (global)
- Score conformité moyen

### 3.2 Filtres / recherche
- “Filtres avancés”
- Filtre statuts (ex: Tous les statuts)
- Filtre pays (ex: Tous les pays)
- Filtre plans (ex: Tous les plans)
- Recherche : “Rechercher une agence…”

### 3.3 Table agences (colonnes)
- Agence
- Localisation
- Statut
- Plan
- Talents
- Missions
- Revenus
- Conformité
- Actions

### 3.4 Actions / création agence (“Nouvelle agence”)
Champs visibles :
- Nom commercial
- Nom légal
- Pays
- Ville
- Email
- Téléphone
- Plan tarifaire
Actions :
- Créer / Annuler (ou équivalent)

---

## 4) Gestion des Permissions (RBAC + features toggles)

### 4.1 Filtres / recherche
- Filtre (générique)
- Recherche : “Rechercher un groupe de permissions…”
- Filtres rapides visibles :
  - Groupes actifs
  - Agences configurées
  - Avec API access
  - Avec SIPSI
  - Tous les rôles

### 4.2 Concept “Groupe de permissions”
- Groupe rattaché à une **agence**
- Statut : Actif / (autres statuts possibles)
- Actions : voir/éditer (icône)

### 4.3 “Fonctionnalités activées” (toggles par agence/groupe)
Toggles visibles :
- **SIPSI**
- **Country Pack**
- **Rapports Avancés**
- **API** (Accès API)

### 4.4 Permissions granulaires (par domaines)
Domaines visibles (libellés tronqués mais intention claire) :
- Données personnelles
- Agences
- Missions
- Talents
- Clients
- Documents
- Conformité
- Facturation
- Rapports
- Fonctionnalités
Pour chaque domaine :
- compteur “X/Y” permissions
- actions type “Voir les analytics” / “Gérer …” (exemples visibles)
- permissions atomiques de type `create_*`, `edit_*`, etc. (style RBAC)

### 4.5 Création d’un groupe
- Bouton : “Nouveau groupe”
- Champs attendus : nom du groupe, agence, statut, toggles, sélection permissions

---

## 5) Missions globales (toutes les missions plateforme)

### 5.1 KPIs page
- Missions actives
- En planification
- Alertes conformité
- Score moyen

### 5.2 Filtres / recherche
- Bouton : Filtrer
- Bouton : Exporter
- Recherche : “Rechercher par mission, talent, client…”
- Filtres : “Tous les statuts”, “Pays d’accueil”

### 5.3 Table missions (colonnes)
- Mission (nom)
- Talent
- Corridor (pays origine → pays accueil)
- Période (dates)
- Statut
- A1 (statut)
- Pré-déclaration (statut)
- SIPSI (statut)
- Score
- Action(s)

Statuts visibles (exemples) :
- Mission : Actif / Planification / (autres)
- Conformité : OK / En attente / Manquant / Expire bientôt / Expiré (selon colonnes)

---

## 6) Conformité globale (vue plateforme)

### 6.1 Contrôles
- Boutons : **Exporter**, **Actualiser**, **Nouveau A1**
- Recherche : “Rechercher par talent, pays…”
- Filtre statut : “Filtrer par statut”

### 6.2 KPIs conformité
- A1 Actifs / total
- Pré-déclarations / total
- SIPSI France / total
- Égalité de traitement / total (ou score/compteur)

### 6.3 Onglets
- Vue d’ensemble
- Certificats A1
- Pré-déclarations
- Égalité de traitement

### 6.4 Tab “Certificats A1” (table)
Colonnes visibles :
- Talent
- Pays
- Mission
- Statut
- Émission (date)
- Expiration (date)
- Action

Statuts visibles (exemples) :
- Valide
- Expire bientôt
- En attente
- Expiré

### 6.5 “Nouveau A1” — Wizard (4 étapes)
**Étape 1 — Sélection**
- Talent
- Mission (optionnelle)

**Étape 2 — Détails A1**
- Pays d’origine
- Pays d’accueil
- Dates de mission (début/fin)
- Organisme compétent (ex: caisse/autorité)
- Pièces requises (liste attendue)

**Étape 3 — Informations complémentaires**
- Représentant local (si requis)
- Délai / échéances
- Langue (si applicable)
- Champs additionnels selon pays/corridor

**Étape 4 — Récapitulatif & dépôt**
- Récapitulatif
- Dépôt/Création de demande
- Joindre pièces (upload)
- Confirmation

### 6.6 SIPSI France + autres pré-déclarations
- Section SIPSI France :
  - Table pré-déclarations SIPSI (ex: code, validité, statut)
- Section “Autres pré-déclarations” :
  - Gestion similaire pour d’autres pays (UE)

### 6.7 Égalité de traitement
- Liste “Vérifications égalité de traitement”
- Action : bouton “Lancer une vérification”
- Statut/compteur de vérifications (ex: 6/79 visibles)

### 6.8 Actions urgentes
Exemples d’items :
- A1 expirent < 15 jours
- Pré-déclarations en attente
- SIPSI manquantes
- Vérifications égalité traitement à lancer/compléter

---

## 7) Talents (vue globale + fiche)

### 7.1 Liste “Tous les Talents”
Contrôles :
- Filtrer
- Filtre pays : “Tous pays”
- Filtre habilitations : “Toutes habilitations”
- Recherche : “Rechercher par nom, langue…”

Table talents (colonnes) :
- Talent
- Nationalité / Langue
- A1 (statut)
- ID (statut)
- Médical (statut)
- Formation (statut)
- Missions actives
- Action(s)

Statuts documents visibles (exemples) :
- Valide
- Expire bientôt
- Expiré
- Manquant

### 7.2 Fiche Talent (drawer / panneau)
Onglets visibles :
- Profil
- Documents
- Missions
- A1
- Temps
- Journal

#### Profil
- Informations personnelles (nom, etc.)
- Tags/habilitations (ex: HSE, CACES)

#### Documents
- Documents par type (A1, ID, médical, formation)
- Actions : voir / remplacer / uploader
- Statuts : valide / expire bientôt / expiré / manquant

#### Missions
- Historique + missions actives (détails non exhaustifs dans capture)

#### A1
- Vue A1 liés au talent (détails non exhaustifs dans capture)

#### Temps
- Résumé heures :
  - Soumises
  - Validées
  - Refusées

#### Journal (audit)
- Historique d’actions :
  - A1 téléchargé
  - doc médical mis à jour
  - profil modifié
  - etc.

---

## 8) Clients (vue globale)

### 8.1 Liste “Tous les Clients”
Contrôles :
- Filtrer
- Recherche : “Rechercher un client”
- Filtre pays : “Tous pays”

Table clients (colonnes) :
- Client
- Site(s)
- Pays
- Missions actives
- Score conformité
- Action(s)

---

## 9) Paramètres (compte utilisateur)

### 9.1 Onglets
- Profil
- Notifications
- Sécurité
- Préférences

### 9.2 Profil
Champs visibles/attendus :
- Nom
- Email
- Téléphone
- Entreprise
- Localisation
- Photo (avatar)

### 9.3 Notifications (préférences multi-canaux)
Canaux :
- Email
- Push
- SMS

Thèmes (au moins) :
- Conformité : alertes certificats A1, pré-déclarations, échéances
- Missions
- Temps de travail

### 9.4 Sécurité
- Changer mot de passe
- Activer 2FA
- Sessions actives
- Journal d’activité
- Zone “danger” :
  - Export des données
  - Suppression du compte (delete)

### 9.5 Préférences (UX)
- Langue
- Fuseau horaire
- Thème sombre
- Densité d’affichage
- Format date/heure
- Navigation compacte
- Animations
- Sons

---

## 10) Landing page (marketing)

### 10.1 Proposition de valeur
- Conformité UE : A1, pré-déclarations, égalité de traitement
- Automatisation / gain de temps / réduction des risques
- Mention multi-pays (ex: “18 pays/corridors” visible comme promesse)

### 10.2 Offres / conversion
- CTA : Démarrer essai gratuit / Demander une démo
- Essai gratuit 14 jours, sans engagement, support inclus

### 10.3 Intégrations mises en avant
- YouSign
- DocuSign
- Silae
- Google Drive
- SharePoint
- Slack

### 10.4 Trust / conformité
- RGPD
- ISO27001 (mentionnée comme promesse)
- Audit trail (promesse)

### 10.5 Fonctionnalités marketing listées (exemples visibles)
- Timesheet mobile
- Dashboard KPI
- Multi-rôles / permissions
- Intégrations
- ROI calculator (mentionné)
- “Early adopter” (mentionné)


## 11) Mapping suggéré vers domaines ERP (optionnel, pour analyse CDC)

- Administration plateforme : Dashboard, Analytics, Rapports système, Health checks
- Multi-tenant agences : Gestion agences + plans + activation fonctionnalités
- IAM/RBAC : Groupes de permissions + toggles + permissions granulaires
- Opérations : Missions globales + états + score + export
- Conformité détachement : A1, pré-déclarations, SIPSI, égalité de traitement, urgences
- Référentiels : Talents, Clients + scores conformité
- Temps : vue “Temps” dans fiche talent (timesheets)
- Comms : notifications multi-canaux + préférences
- Sécurité : 2FA, sessions, audit log
