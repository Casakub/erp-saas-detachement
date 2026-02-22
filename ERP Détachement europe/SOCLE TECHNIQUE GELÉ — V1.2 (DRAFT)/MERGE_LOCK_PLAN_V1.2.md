# MERGE & LOCK PLAN — V1.2

- **Statut**: DRAFT — À exécuter après sign-off OWNER
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Ordre et règles de stabilisation documentaire — passage DRAFT → READY → LOCKED.

---

> **Règle fondamentale** : Un document est LOCKEDé avant le démarrage du Lot qui en dépend.
> Un LOCKED ne peut jamais être modifié — créer un patch à la place.
> Un READY peut encore être édité (corrections mineures) mais pas restructuré.

---

## Prérequis avant exécution de ce plan

- [ ] `OWNER_SIGNOFF_V1.2.md` retourné signé (D1 / D2 / D6)
- [ ] Aucun refus OWNER qui invaliderait un patch existant
- [ ] QA Final V1.2 passé (✅ VALIDÉ le 2026-02-22)

---

## ÉTAPE 1 — Fichiers à passer READY (éditables, contractuels)

Ces fichiers sont stables mais peuvent encore recevoir des corrections mineures de typo/clarification. Ils doivent être en READY avant le Lot correspondant.

| Fichier | Statut actuel | Passage READY | Condition | Lot concerné |
|---|---|---|---|---|
| `PATCH_DB_2.9.16-C_worker_push_subscriptions.md` | DRAFT V1.2.2 | ✅ MAINTENANT | Aucune (QA validé) | Lot 3 |
| `PATCH_DB_2.9.16-E_rfp_visibility_contact_logs.md` | DRAFT V1.2.2 | ✅ MAINTENANT | Aucune | Lot 4 |
| `PATCH_DB_2.9.16-F_sipsi_declarations.md` | DRAFT V1.2.2 | ✅ MAINTENANT | Aucune | Lot 2/7 |
| `PATCH_EVENTS_2.10.4.11.md` | DRAFT V1.2.3 | ✅ MAINTENANT | Aucune (§A-E complets) | Lot 2→7 |
| `PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` | DRAFT V1.2.2 | Après sign-off D2 | Sign-off OWNER D2 | Lot 5 |
| `6.9 — CHECKLIST LOT 7 BIS IA` | DRAFT v1.1 | Après sign-off D6 | Sign-off OWNER D6 | Lot 7 Bis |
| `CDC_COMPLETIONS_FROM_AUDIT.md` | DRAFT V1.2.2 | ✅ MAINTENANT | Aucune | Tous |
| `RELEASE_PACK_V1.2_*.md` (4 fichiers) | DRAFT V1.2 | ✅ MAINTENANT | Aucune | Référence |

**Action** : Mettre à jour le champ `Statut:` dans l'en-tête de chaque fichier concerné de `DRAFT` → `READY`.

---

## ÉTAPE 2 — Fichiers à passer LOCKED (immuables avant démarrage lot)

Un fichier LOCKED avant un lot = engagement contractuel pour l'équipe dev. Toute modification ultérieure = nouveau patch.

### LOCKED Lot 1 (Foundation) — Requis avant J+0 build

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` | Sign-off OWNER D1 reçu | Changer statut → LOCKED, ajouter date |
| `2.12.a — RBAC & PERMISSIONS V1.2 (PATCH)` | Aucune | Passer LOCKED (déjà stable) |

### LOCKED Lot 3 (Timesheets & Mobile) — Requis avant build Lot 3

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_DB_2.9.16-C_worker_push_subscriptions.md` | Aucune (QA validé) | Passer LOCKED avant Lot 3 |

### LOCKED Lot 4 (CRM, Clients, RFP) — Requis avant build Lot 4

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_DB_2.9.16-E_rfp_visibility_contact_logs.md` | Aucune | Passer LOCKED avant Lot 4 |
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` §2 (leads/activities) | Décision `LeadActivityCreated` (voir OPEN_ITEMS) | Passer LOCKED après décision event CRM |

### LOCKED Lot 5 (ATS, Workers) — Requis avant build Lot 5

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` | Sign-off OWNER D2 reçu | Passer LOCKED avant Lot 5 |
| `PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md` §B (compliance_exports) | Aucune (export = scope confirmé) | Peut rester READY jusqu'à Lot 7 |

### LOCKED Lot 7 (Compliance Engine) — Requis avant build Lot 7

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_DB_2.9.16-F_sipsi_declarations.md` | Aucune | Passer LOCKED avant Lot 7 |
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` §1/3/4 (marketplace, export, score) | Aucune | Passer LOCKED avant Lot 7/8 |
| `PATCH_EVENTS_2.10.4.11.md` | Aucune (8 events complets) | Passer LOCKED avant Lot 5 |

### LOCKED Lot 7 Bis (Égalité de Traitement) — Requis avant build Lot 7 Bis

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md` §A (equal_treatment_checks) | Sign-off OWNER D6 reçu | Passer LOCKED avant Lot 7 Bis |
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` §5 (equal-treatment-check) | Sign-off OWNER D6 reçu | Passer LOCKED avant Lot 7 Bis |
| `6.9 — CHECKLIST LOT 7 BIS IA` | Sign-off OWNER D6 reçu | Passer LOCKED avant Lot 7 Bis |

### LOCKED Lot 8 (Risk, Marketplace) — Requis avant build Lot 8

| Fichier | Condition de LOCK | Action |
|---|---|---|
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` §1 (marketplace/agencies) | Aucune | Passer LOCKED avant Lot 8 |

---

## ÉTAPE 3 — Fichiers à laisser en DRAFT (dépendent OWNER ou Vague 4)

| Fichier | Raison | Condition de sortie DRAFT |
|---|---|---|
| `OWNER_SIGNOFF_V1.2.md` | Document de travail — remplacé par les décisions signées | Archive après sign-off |
| `DECISIONS_OWNER_V1.2.md` | Mise à jour après sign-off Owner | Passer READY après D1/D2/D6 signés |
| `RELEASE_PACK_V1.2_OPEN_ITEMS.md` | Vivant jusqu'à clôture de tous les items | Passer READY quand 0 open item |

---

## Tableau Lot → Fichiers requis en LOCKED

| Lot | Sujet | Fichiers LOCKED requis avant démarrage |
|---|---|---|
| **Lot 1** | Foundation (auth, RBAC, tenant, Vault, Outbox) | `PATCH_RBAC_2.12.b` *(après D1)*, `2.12.a` |
| **Lot 2** | Core Métier (missions, compliance_case) | `PATCH_DB_2.9.16-F` (SIPSI), `PATCH_EVENTS_2.10.4.11` §C |
| **Lot 3** | Timesheets & Mobile | `PATCH_DB_2.9.16-C` (push) |
| **Lot 4** | CRM, Clients, Vigilance, RFP | `PATCH_DB_2.9.16-E` (contact-logs), `PATCH_OPENAPI_V1.3` §2 *(après décision event CRM)* |
| **Lot 5** | ATS, Workers | `PATCH_ATS_SCORING_Q7` *(après D2)*, `PATCH_EVENTS_2.10.4.11` §B |
| **Lot 6** | Finance Billing | Aucun patch V1.2 nouveau — LOCKED existants suffisent |
| **Lot 7** | Compliance Engine (rémunération, SIPSI, export) | `PATCH_DB_2.9.16-F`, `PATCH_DB_2.9.16-G §B`, `PATCH_OPENAPI_V1.3 §3/4`, `PATCH_EVENTS_2.10.4.11 §D` |
| **Lot 7 Bis** | Égalité de Traitement | `PATCH_DB_2.9.16-G §A` *(après D6)*, `PATCH_OPENAPI_V1.3 §5` *(après D6)*, `6.9 Checklist` *(après D6)*, `PATCH_EVENTS_2.10.4.11 §E` |
| **Lot 8** | Risk, Certification, Marketplace | `PATCH_OPENAPI_V1.3 §1` |

---

## Ordre d'exécution recommandé (timeline)

```
J+0 (aujourd'hui) :
  ✅ Soumettre OWNER_SIGNOFF_V1.2.md au Product Owner
  ✅ Passer READY immédiatement :
     PATCH_DB_2.9.16-C, -E, -F
     PATCH_EVENTS_2.10.4.11
     CDC_COMPLETIONS_FROM_AUDIT
     RELEASE_PACK V1.2 (4 fichiers)

J+0 → J+5 (délai sign-off OWNER) :
  ⏳ Attendre sign-off D1/D2/D6

J+1 (ne pas attendre D1) :
  🚀 Démarrer Lot 1 Foundation sans les endpoints /v1/admin/platform/*
     (le RBAC de base, tenant, auth, outbox peuvent être buildés sans platform_admin)
  ⚠️ Ajouter les policies RLS platform_admin dès réception sign-off D1

J+5 (ou dès réception sign-off) :
  🔒 Passer LOCKED selon tableau ci-dessus (dans l'ordre des lots)
  ✅ Mettre à jour DECISIONS_OWNER_V1.2.md avec les décisions signées
  ✅ Mettre à jour RELEASE_PACK_V1.2_OPEN_ITEMS.md → statut "D1/D2/D6 : RÉSOLU"

J+5 → J+? (parallèle au build) :
  📝 Créer E2E-14 SIPSI (scénario acceptance test dédié)
  📝 Décider LeadActivityCreated (V1 ou V2)
  🚀 Continuer build dans l'ordre des lots
```

---

## Règles de LOCK (à respecter impérativement)

```
RÈGLE 1 — Un LOCKED ne peut jamais être modifié.
  → En cas d'erreur détectée : créer un PATCH_ ou ERRATA dédié.
  → Nommer le correctif : PATCH_<FICHIER>_ERRATA_<DATE>.md

RÈGLE 2 — Un fichier est LOCKED uniquement quand il est complet et validé.
  → Ne jamais LOCK un fichier avec des ⚠️ ou "À compléter".
  → Vérifier DoD dans chaque patch avant LOCK.

RÈGLE 3 — Le statut LOCKED est indiqué dans l'en-tête du fichier.
  → Champ : Statut: LOCKED
  → Champ : Date LOCK: YYYY-MM-DD
  → Champ : Lock validé par: [nom]

RÈGLE 4 — Ne jamais forcer un LOCK sans sign-off.
  → Si un fichier dépend d'une décision OWNER et que le sign-off est absent :
     garder en READY, ne pas LOCK.
```

---

## Mini-changelog

- 2026-02-22 : Création — Plan merge/lock V1.2. Ordre par lot, conditions, règles de LOCK. Tableau Lot → Fichiers requis.
