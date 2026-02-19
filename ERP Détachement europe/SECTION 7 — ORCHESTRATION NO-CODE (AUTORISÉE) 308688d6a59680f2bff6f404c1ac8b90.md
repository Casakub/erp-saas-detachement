# SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE)

# 🧠 SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE)

## Principe fondamental (NON NÉGOCIABLE)

**Le no-code orchestre.  
Le backend décide.  
Le no-code n’est JAMAIS une source de vérité.**

Le no-code est un **outil d’exécution technique**, jamais un moteur métier,
jamais un interprète réglementaire, jamais un décideur.

---

## 7.1 — USAGES AUTORISÉS (ORCHESTRATION UNIQUEMENT)

Le no-code peut **UNIQUEMENT** être utilisé pour :

- Envoi d’emails et SMS
- Notifications (email / push / webhook)
- Génération de documents PDF
- Relances automatiques (A1, documents, échéances)
- Exécution de batch jobs (cron), **si sécurisés**
- Parsing CV via IA (extraction de données)
- Extraction de données depuis documents PDF
- Traductions automatiques
- Exports comptables (CSV / API)

📌 **Condition impérative**  
Tous ces usages doivent être déclenchés :
- soit par un **event métier backend** (voir section **2.10 — Events métier V1**),
- soit par une **requête backend explicite, authentifiée et traçable**.

❌ Aucun trigger manuel  
❌ Aucun polling libre  
❌ Aucune logique conditionnelle métier dans le no-code

## 7.1.A — INTÉGRATIONS AUTORISÉES (LISTE CONTRÔLÉE)

Le no-code peut interagir uniquement avec :
- services email / SMS validés
- outils de génération PDF validés
- services IA validés (parsing, extraction, traduction)
- outils comptables déclarés (export uniquement)

❌ Toute intégration externe non listée ou non validée est interdite.
👉 En cas de besoin : création d’un endpoint backend dédié.

---

## 7.2 — USAGES STRICTEMENT INTERDITS

Le no-code **NE PEUT PAS**, sous aucun prétexte :

- Calculer une rémunération
- Calculer un score métier ou un ranking
- Prendre une décision métier
- Appliquer un enforcement ou un blocage
- Interpréter une règle légale ou pays
- Modifier un statut critique

### ❌ Interdictions absolues (cœur RegTech)
- ❌ Créer, modifier ou interpréter une **Compliance Case**
- ❌ Modifier un **Compliance Requirement**
- ❌ Modifier un **statut A1**

👉 Toute tentative = **rejet immédiat du scénario**.

📛 Toute violation de cette section entraîne :
- l’arrêt immédiat du scénario,
- la suppression du workflow concerné,
- et une correction à effectuer côté backend avant toute réactivation.

---

## 7.3 — SOURCE DE VÉRITÉ (LOCKED)

- Le **backend** est la **SEULE source de vérité**.
- Le no-code :
  - consomme des **états**, **flags**, **events**,
  - n’écrit **aucune donnée métier critique**,
  - ne génère **aucune vérité persistée**.

📌 En cas de conflit :
> **Backend > Events > No-code**

---

## 7.4 — TRACABILITÉ & AUDIT

Toute action no-code doit impérativement :

- être déclenchée par un **event backend identifié**
- générer une trace explicite (log ou event), persistée côté backend
- être rattachable à un **tenant**
- être rattachable à une **entité métier**
- être **horodatée**

### Exemples d’événements de traçabilité
- `EmailSent`
- `PdfGenerated`
- `ReminderTriggered`

📌 Ces événements doivent être stockés et auditables
via les tables de logs prévues dans le socle technique.

Ces événements **ne sont jamais des décisions métier**.

---

## 7.5 — USAGE IA (DANS LE NO-CODE) — MODE ASSISTÉ UNIQUEMENT

L’IA utilisée via no-code peut :

- extraire des informations
- détecter des incohérences ou signaux faibles
- proposer des scores **non décisionnels**  
  *(indicatifs, non persistés, non bloquants)*

⚠️ **Règles impératives sur les scores IA**
- ne doivent pas être stockés comme source de vérité
- ne doivent jamais déclencher un enforcement ou un blocage
- ne servent qu’à :
  - l’aide à la décision humaine
  - ou un traitement backend explicite

### ❌ L’IA NE PEUT PAS
- décider
- rejeter
- valider
- modifier un statut métier

📌 Toute sortie IA est considérée comme **ASSISTÉE**  
et doit être validée par :
- une **règle backend**, ou
- une **action humaine autorisée**.

---

## 7.6 — RÈGLE “LOT-AWARE” (CRITIQUE)

📌 Le périmètre no-code dépend **strictement du lot en cours**.

- Aucune automatisation ne doit anticiper :
  - une fonctionnalité prévue dans un lot ultérieur
  - une logique métier non encore implémentée côté backend

👉 En cas de doute :
> **STOP scénario → délégation backend**

---

## 7.7 — STOP CONDITIONS (OBLIGATOIRES)

Si une logique métier est requise (même partiellement) :
- le scénario no-code **doit s’arrêter**
- et déléguer explicitement au backend

❌ Aucune “rustine” no-code  
❌ Aucun contournement temporaire  
❌ Aucun calcul déguisé

---

## FIN — SECTION 7

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
