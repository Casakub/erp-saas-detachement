# OWNER SIGN-OFF — V1.2 — Décisions architecturales à valider

- **Statut**: EN ATTENTE DE SIGNATURE
- **Date émission**: 2026-02-22
- **Destinataire**: Product Owner / Decision Maker
- **Émetteur**: Équipe technique (via audit fonctionnel claude-code)
- **Délai**: 5 jours ouvrés à compter de la date d'émission — absence de réponse = approbation tacite des décisions par défaut

---

> **Mode d'emploi** :
> Ce document contient **3 décisions uniquement** — celles qui nécessitent un choix binaire OWNER.
> Toutes les autres décisions (D3/D4/D5) sont déjà résolues par la hiérarchie documentaire.
>
> Pour chaque décision : cocher ACCEPTER ou REFUSER, signer, dater.
> En cas de refus ou condition : préciser dans le champ "Commentaire".

---

## DÉCISION D1 — Architecture `platform_admin`

### Contexte

Le SaaS nécessite un rôle d'administration globale de la plateforme (dashboard stats, gestion tenants/agences, vue conformité cross-tenant). Trois architectures ont été évaluées ; l'Option A est la plus simple et recommandée par l'audit.

### Options évaluées

| Option | Description | Complexité | Réversibilité |
|---|---|---|---|
| **A — Retenue** | JWT `platform_admin` avec `tenant_id = null`. Bypass RLS via policies dédiées. | Faible | Migratable vers B en V2 |
| B | Tenant système séparé (`PLATFORM_TENANT_UUID`). RLS standard. | Moyenne | Complexe |
| C | Flag `is_platform_admin: true` dans table `users`. | Faible | Irréversible sans migration |

### Ce que "ACCEPTER Option A" signifie concrètement

```
JWT claims platform_admin :
  { sub: uuid, role_type: "platform_admin", tenant_id: null }

Permissions accordées :
  ✅ SELECT toutes tables métier (lecture cross-tenant)
  ✅ INSERT/UPDATE/DELETE sur : tenants, tenant_settings, agency_profiles, marketplace_access
  ✅ PATCH /v1/admin/platform/tenants/{id}/status (activer/suspendre tenant)

Permissions interdites :
  ❌ Modifier compliance_cases, missions, timesheets, workers d'un tenant
  ❌ Accéder aux données personnelles des workers (PII tenant)

Endpoints V1 MINIMAL (5 endpoints read-only + 1 write) :
  GET  /v1/admin/platform/stats
  GET  /v1/admin/platform/tenants
  GET  /v1/admin/platform/tenants/{id}
  PATCH /v1/admin/platform/tenants/{id}/status
  GET  /v1/admin/platform/compliance-overview
```

### Impact si ACCEPTÉ

- Lot 1 (Foundation) inclut la création du rôle JWT `platform_admin` + policies RLS `platform_admin` sur toutes les tables
- Le dashboard admin plateforme est buildable en V1 (5 endpoints + 1 write)
- Aucun tenant fictif en DB — architecture propre

### Impact si REFUSÉ

- Option A est retirée ; choisir B ou C (décision OWNER requise sur l'alternative)
- Lot 1 **ne peut pas démarrer** tant que l'architecture RBAC n'est pas figée
- Le dashboard admin plateforme est repoussé en V2 minimum
- Patches à modifier : `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md`, `CDC_COMPLETIONS §C3`, `DECISIONS_OWNER_V1.2.md §D1`

### Option acceptation conditionnelle

> **"Accepter Option A pour V1, UI dashboard admin = V2"**
> → L'architecture JWT + RLS est buildée en Lot 1 (socle technique).
> → Les endpoints `/v1/admin/platform/*` sont implémentés mais l'interface graphique d'administration est reportée en V2.
> → Permet de démarrer le build sans bloquer sur la question de l'UI.

### Risques (Option A)

- Le `platform_admin` bypass la RLS — tout développeur avec accès au compte `platform_admin` voit toutes les données. Mitigation : provisionnement strict, audit trail des actions `platform_admin`.
- Si multi-platform-admin est nécessaire en V1 (plusieurs admins), Option A reste compatible (plusieurs users avec `role_type=platform_admin`).
- Migration vers Option B en V2 nécessite une migration DB + changement JWT schema — prévoir.

### Docs impactés

| Fichier | Section |
|---|---|
| `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` | Tout le document |
| `CDC_COMPLETIONS_FROM_AUDIT.md` | §COMPLÉMENT 3 — M1.2 Dashboard Admin |
| `DECISIONS_OWNER_V1.2.md` | §D1 |
| `RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md` | §Section C — platform_admin |
| `RELEASE_PACK_V1.2_INDEX.md` | §Ce qui est V1 — platform_admin |

### Décision Owner

```
☐ ACCEPTER — Option A (tenant_id=null, bypass RLS)
☐ ACCEPTER CONDITIONNELLEMENT — Option A tech, UI admin V2
☐ REFUSER — Choisir une alternative (préciser ci-dessous)
☐ ALTERNATIVE CHOISIE : ________________________________

Commentaire : ____________________________________________
_________________________________________________________

Nom : __________________________  Date : ________________
Signature : _____________________________________________
```

---

## DÉCISION D2 — Modèle de scoring ATS

### Contexte

Le module M5 (ATS) doit calculer un score de pertinence pour chaque candidature. Le score est déclenché après le parsing CV (`CandidateParsed`) et stocké dans `applications.ai_score`. Deux approches ont été évaluées.

### Options évaluées

| Option | Description | Complexité | Coût |
|---|---|---|---|
| **Rules-based V1 — Retenue** | Algorithme déterministe 4 composantes. Pas d'appel LLM. | Faible | 0€/candidature |
| LLM scoring V2 | Appel modèle de langage (ex: Claude) pour matching sémantique + explication naturelle | Haute | ~0.01-0.05€/candidature |

### Ce que "ACCEPTER Rules-based" signifie concrètement

```
model_version = "rules-v1.0" (stocké dans applications.model_version)

Algorithme 4 composantes :
  Skills match    : 50% — intersection CV skills / job required skills (exact match)
  Expérience      : 30% — cv_experience_years vs job_required_experience_years
  Langues         : 15% — matching code ISO 639-1 + niveau (A1..C2)
  Certifications  :  5% — intersection CV certs / job required certs

Output :
  ai_score         : integer [0-100]
  score_breakdown  : JSONB { skills_matched[], skills_missing[], experience_score, language_score }
  scored_at        : timestamptz

Score immuable après publication CandidateScored.

GWT reproductibles :
  Exemple match partiel : skills 2/3 + expérience OK + langues neutres → score = 83
  Exemple zero match    : skills 0/2 + expérience 0/5 + langues neutres → score = 20
```

### Impact si ACCEPTÉ

- Lot 5 (ATS) buildable sans dépendance LLM
- Scoring synchrone post-`CandidateParsed` — latence <100ms
- Coût nul à l'usage
- L'explication LLM enrichie est disponible en V2 (migration `model_version` → `"llm-v2.x"`)

### Impact si REFUSÉ (LLM V1 requis)

- Dépendance externe : choix modèle LLM, clé API, coût variable par candidature
- Latence accrue (~1-3s par scoring)
- Versioning prompts à gérer
- Patch `PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` à remplacer par spécification LLM complète
- Lot 5 retardé (spécification LLM à écrire + tests de qualité du scoring)

### Option acceptation conditionnelle

> **"Accepter rules-based V1, avec pilote LLM parallèle sur 100 candidatures en Lot 5"**
> → Le scoring rules-v1.0 est le scoring officiel.
> → Un A/B test LLM peut être mené en parallèle (sans impact prod) pour calibrer V2.
> → Décision go/no-go LLM V2 basée sur les résultats pilote.

### Risques (Rules-based)

- Matching exact sur skills : un CV avec "JS" ne matche pas "JavaScript" → résolu par normalisation (liste de synonymes en V1.1 si nécessaire).
- Score non interprétable par recruteur sans `score_breakdown` — mitigé : le breakdown est exposé dans l'API et affichable en UI.
- Qualité limitée vs LLM sur postes complexes — acceptable pour V1 détachement EU (postes souvent très codifiés : IDCC, classifications).

### Docs impactés

| Fichier | Section |
|---|---|
| `PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` | Tout le document |
| `6.6 — CHECKLIST LOT 5 IA §M5` | Scoring / DoD |
| `DECISIONS_OWNER_V1.2.md` | §D2 |
| `SECTION 10.E` | E2E-07 (score immuable) |

### Décision Owner

```
☐ ACCEPTER — Rules-based V1 (model_version="rules-v1.0")
☐ ACCEPTER CONDITIONNELLEMENT — Rules-based V1 + pilote LLM parallèle
☐ REFUSER — LLM scoring requis en V1 (spécification complète à écrire)

Commentaire : ____________________________________________
_________________________________________________________

Nom : __________________________  Date : ________________
Signature : _____________________________________________
```

---

## DÉCISION D6 — Égalité de traitement (Directive 2018/957/UE) : périmètre V1

### Contexte

La Directive 2018/957/UE (Art. 3 §1bis) impose que les travailleurs détachés bénéficient des mêmes conditions de rémunération que les travailleurs locaux du pays hôte. Cette obligation légale était **totalement absente du CDC V1 initial** — elle a été identifiée lors de l'audit.

Le module M8.3 a été créé pour couvrir cette obligation. La question : périmètre V1 = **vérification manuelle assistée** ou **automatisée** ?

### Ce que "ACCEPTER V1 Manuel" signifie concrètement

```
V1 — Check manuel assisté :
  L'agent (tenant_admin / agency_user) saisit manuellement :
    - host_country_reference_wage (salaire de référence pays hôte — ex: SMIC FR 2026 = 11.88€/h)
    - reference_period_type (hourly | monthly)
    - Items Directive : working_time_compliant, paid_leave_compliant, health_safety_compliant, accommodation_compliant

  Le système calcule automatiquement :
    - worker_eligible_wage (depuis dernier worker_remuneration_snapshot)
    - is_compliant = (worker_eligible_wage >= host_country_reference_wage) AND tous items = true
    - gap_amount, gap_percentage

  En cas de non-conformité :
    - Event EqualTreatmentViolationDetected → notification push tenant_admin + agency_user
    - AUCUN blocage automatique de mission (alerte uniquement)

  Snapshot immuable (audit trail complet — inspection-ready).
```

### Impact si ACCEPTÉ

- Module M8.3 buildable en Lot 7 Bis avec les patches existants
- Obligation légale Directive 2018/957/UE couverte en V1 (traçabilité manuelle)
- Snapshot immuable = prêt pour inspection administrative
- L'automatisation (API externe salaires minimaux pays hôte) est reportée en V2

### Impact si REFUSÉ (automatisation requise V1)

- Nécessite : intégration API externe salaires minimaux par pays (ex: Eurostat, API gouvernementale)
- Ces APIs n'ont pas de contrat défini dans le CDC
- Lot 7 Bis ne peut pas démarrer sans spécification API externe
- Risque : APIs gouvernementales souvent instables ou payantes
- Patches à créer : connecteur API externe + fallback + gestion versions référentiels

### Option acceptation conditionnelle

> **"Accepter V1 Manuel avec avertissement légal visible dans l'UI"**
> → L'interface affiche explicitement : "La référence salariale est saisie manuellement — vérifier sur le site officiel du pays hôte."
> → Décharge de responsabilité documentée.
> → V2 automatise la récupération via API (dès que les connecteurs sont disponibles).

### Risques (V1 Manuel)

- Risque d'erreur humaine sur la saisie du salaire de référence — mitigé : avertissement UI + audit trail + link vers source officielle recommandé.
- Risque légal si un contrôle administratif montre un manque de diligence — mitigé : snapshot immuable horodaté = preuve documentaire.
- Si blocage automatique requis par client enterprise : négocier contractuellement que le V1 = "assisted compliance" et que le blocage auto est en roadmap V2.

### Docs impactés

| Fichier | Section |
|---|---|
| `PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md` | §Table A — equal_treatment_checks |
| `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` | §5 — equal-treatment-check |
| `PATCH_EVENTS_2.10.4.11.md` | §E — EqualTreatmentCheckCreated / ViolationDetected |
| `6.9 — CHECKLIST LOT 7 BIS IA` | §Algorithme V1, §Out of scope |
| `CDC_COMPLETIONS_FROM_AUDIT.md` | §COMPLÉMENT 1 |
| `DECISIONS_OWNER_V1.2.md` | §D6 |

### Décision Owner

```
☐ ACCEPTER — V1 Manuel assisté (saisie manuelle, alerte uniquement, pas de blocage auto)
☐ ACCEPTER CONDITIONNELLEMENT — V1 Manuel + mention UI "source à vérifier manuellement"
☐ REFUSER — Automatisation requise en V1 (API externe à spécifier)

Commentaire : ____________________________________________
_________________________________________________________

Nom : __________________________  Date : ________________
Signature : _____________________________________________
```

---

## Récapitulatif des signatures

| Décision | Sujet | Lot bloqué | Signature Owner |
|---|---|---|---|
| D1 | platform_admin architecture | Lot 1 | ☐ |
| D2 | ATS scoring modèle | Lot 5 | ☐ |
| D6 | Égalité traitement périmètre V1 | Lot 7 Bis | ☐ |

**Date limite de retour** : 5 jours ouvrés après émission (2026-02-22)
**Contact technique** : Transmettre le document signé (PDF ou scan) pour mise à jour de `DECISIONS_OWNER_V1.2.md`.

---

## Ce qui n'est PAS dans ce document (déjà résolu)

| Décision | Statut | Source |
|---|---|---|
| D3 — PWA offline | ✅ Résolu — online-only V1 | `ERRATA C2`, hiérarchie SOCLE > Checklist 6.0 |
| D4 — Facturation depuis timesheets | ✅ Résolu — V1 actif sans feature flag | `ERRATA C1`, `2.11 LOCKED` fait autorité |
| D5 — Export dossier V1 scope | ✅ Confirmé — livrable obligatoire | `6.0 Checklist ligne 113` |

---

## Mini-changelog

- 2026-02-22 : Création — Kit de décision Owner. 3 décisions (D1/D2/D6) avec impact si accepté/refusé, option conditionnelle, risques, docs impactés. Format prêt à soumettre.
