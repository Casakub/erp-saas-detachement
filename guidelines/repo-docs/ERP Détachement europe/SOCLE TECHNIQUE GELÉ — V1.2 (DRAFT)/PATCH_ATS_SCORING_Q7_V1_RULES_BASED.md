# PATCH ATS SCORING — Q7 — Algorithme V1 Règles-Based

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Figer la décision Q7 (modèle scoring ATS) — V1 = règles-based (pas LLM)
- **Document cible** : Addendum à `6.6 — CHECKLIST — LOT 5 IA (ATS, WORKERS)` §M5

---

## Contexte & Justification

### Gap identifié lors de l'audit 2026-02-22

La `6.6 — CHECKLIST — LOT 5 IA` (Statut: READY) référence :
- `CandidateScored` publié avec `ai_score` + `model_version` (§M5 DoD)
- `scoring: ai_score + model_version stockés, immuables après publication`

Mais le **modèle de scoring n'est pas défini** : règles-based vs LLM reste une question ouverte (Q7). Cette ambiguïté **bloque le build** (les développeurs ne savent pas ce qu'il faut implémenter).

### Décision retenue — Q7

> **V1 = règles-based (sans LLM)**
>
> Le scoring ATS en V1 est calculé par un algorithme déterministe basé sur des règles de matching. Aucun appel LLM n'est effectué lors du scoring V1.
>
> **LLM scoring (explanation enrichie) = V2** — à planifier dans le Lot suivant.

**Justification** :
- Déterminisme requis pour audit trail (score immuable, reproductible)
- Latence acceptable (scoring synchrone ou quasi-synchrone après parsing)
- Pas de dépendance coûteuse LLM en V1
- Conforme pattern "assisted, rules-first" du SOCLE V1

---

## Algorithme V1 — Scoring ATS (Rules-Based)

### Inputs utilisés

| Input | Source | Type | Obligatoire |
|---|---|---|---|
| `cv_skills` | `candidates.parsed_data.skills[]` | array\<string\> | Non (peut être vide) |
| `cv_experience_years` | `candidates.parsed_data.experience_years` | integer | Non |
| `cv_languages` | `candidates.parsed_data.languages[]` | array\<{lang, level}\> | Non |
| `cv_certifications` | `candidates.parsed_data.certifications[]` | array\<string\> | Non |
| `job_required_skills` | `job_offers.requirements.skills[]` | array\<string\> | Oui |
| `job_required_experience_years` | `job_offers.requirements.min_experience_years` | integer | Non (défaut: 0) |
| `job_required_languages` | `job_offers.requirements.languages[]` | array\<{lang, level}\> | Non |

> **Source des champs parsed** : pipeline parsing backend déclenché sur `ApplicationReceived` → `CandidateParsed`.
> Si le parsing n'est pas terminé, le scoring est différé jusqu'à réception de `CandidateParsed`.

### Format de score

```json
score : integer, plage [0, 100]
  0   = aucun critère de matching satisfait
  100 = tous les critères obligatoires satisfaits avec dépassement
```

### Calcul du score (4 composantes pondérées)

```json
COMPOSANTE 1 — Skills match (poids: 50%)
  matched_skills = intersection(cv_skills, job_required_skills)  [case-insensitive]
  if job_required_skills is empty → skills_score = 50 (neutre)
  else → skills_score = (len(matched_skills) / len(job_required_skills)) * 100
  contribution = skills_score * 0.50

COMPOSANTE 2 — Expérience (poids: 30%)
  if job_required_experience_years = 0 → experience_score = 100 (neutre)
  elif cv_experience_years >= job_required_experience_years → experience_score = 100
  elif cv_experience_years = 0 → experience_score = 0
  else → experience_score = (cv_experience_years / job_required_experience_years) * 100
  contribution = experience_score * 0.30

COMPOSANTE 3 — Langues (poids: 15%)
  if job_required_languages is empty → language_score = 100 (neutre)
  else:
    matched_langs = langues du candidat couvrant les langues requises
    (match = même langue ET niveau candidat >= niveau requis)
    language_score = (len(matched_langs) / len(job_required_languages)) * 100
  contribution = language_score * 0.15

COMPOSANTE 4 — Certifications (poids: 5%)
  if job_required_certifications is empty → certification_score = 100 (neutre)
  else:
    matched_certs = intersection(cv_certifications, job_required_certifications)
    certification_score = (len(matched_certs) / len(job_required_certifications)) * 100
  contribution = certification_score * 0.05

SCORE FINAL :
  raw_score = contribution_1 + contribution_2 + contribution_3 + contribution_4
  ai_score = min(100, round(raw_score))   [plafond 100]
```

### Output attendu

```json
{
  "ai_score": 73,
  "model_version": "rules-v1.0",
  "score_breakdown": {
    "skills_score": 80,
    "skills_matched": ["soudure TIG", "lecture plans"],
    "skills_missing": ["CACES R482"],
    "experience_score": 100,
    "language_score": 50,
    "certification_score": 0
  },
  "scoring_engine": "rules-based",
  "scored_at": "ISO8601"
}
```

**Champs stockés dans `applications`** :
- `ai_score` : integer [0-100]
- `model_version` : `"rules-v1.0"` (en dur V1)
- `score_breakdown` : JSONB (détail ci-dessus)
- `scored_at` : timestamptz

**Immuabilité** : une fois `CandidateScored` publié, `ai_score` + `score_breakdown` sont en lecture seule (pas de recalcul automatique — déclenchement manuel si besoin via endpoint admin).

### Raisons listées (pour affichage frontend)

```json
Format des raisons (dans score_breakdown) :
  skills_matched   : liste des compétences trouvées = points positifs
  skills_missing   : liste des compétences requises absentes = gaps
  experience_score : message généré selon seuil
    → 100 : "Expérience suffisante ou non requise"
    → <100 : "Expérience insuffisante ({cv} ans vs {required} ans requis)"
  language_score   : message généré
    → 100 : "Langues requises couvertes"
    → <100 : "Langue(s) manquante(s) : {liste}"
```

---

## Critères d'acceptation (3 GWT)

### GWT-1 — Match partiel compétences

**Given** :
- `job_required_skills = ["soudure TIG", "lecture plans", "CACES R482"]`
- `cv_skills = ["soudure TIG", "lecture plans"]`
- `job_required_experience_years = 2`, `cv_experience_years = 3`
- Aucune langue ni certification requise

**When** : Scoring déclenché sur `CandidateParsed`

**Then** :
- `skills_score = (2/3) * 100 = 66.67` → contribution = 33.33
- `experience_score = 100` (3 >= 2) → contribution = 30
- `language_score = 100` (neutre) → contribution = 15
- `certification_score = 100` (neutre) → contribution = 5
- `ai_score = round(83.33) = 83`
- `model_version = "rules-v1.0"`
- `skills_missing = ["CACES R482"]`
- `CandidateScored` publié via outbox

### GWT-2 — Aucun critère satisfait

**Given** :
- `job_required_skills = ["béton armé", "coffrage"]`
- `cv_skills = []` (CV non parsé ou vide)
- `job_required_experience_years = 5`, `cv_experience_years = 0`

**When** : Scoring déclenché

**Then** :
- `skills_score = 0` → contribution = 0
- `experience_score = 0` → contribution = 0
- `language_score = 100` (neutre) → contribution = 15
- `certification_score = 100` (neutre) → contribution = 5
- `ai_score = 20`
- `skills_missing = ["béton armé", "coffrage"]`
- `CandidateScored` publié (score faible non-bloquant — shortlist reste possible)

### GWT-3 — Scoring différé (parsing non terminé)

**Given** :
- `ApplicationReceived` reçu mais `CandidateParsed` pas encore publié

**When** : Tentative de scoring

**Then** :
- Scoring NON déclenché immédiatement
- `applications.ai_score = null` (en attente)
- Scoring déclenché automatiquement à réception de `CandidateParsed`
- `CandidateScored` publié après le parsing

---

## Règles d'implémentation

```json
- model_version = "rules-v1.0" (constante en dur dans le code V1)
- Comparaison skills : case-insensitive, trim whitespace, exact match après normalisation
  → V2 : matching sémantique (LLM embeddings)
- Comparaison langues : match sur code ISO 639-1 (fr, en, de...) + niveau (A1..C2)
  → Niveau candidat >= niveau requis : compare en ordre A1 < A2 < B1 < B2 < C1 < C2
- ai_score stocké une seule fois (immuable) — nouveau scoring = nouvelle application uniquement
- score_breakdown stocké en JSONB dans applications.score_breakdown
  (champ à ajouter si absent du DDL LOCKED — via patch DB si nécessaire)
- LLM scoring explanation = V2 uniquement (pas d'appel OpenAI/Anthropic en V1)
```

---

## Décision sur LLM Scoring

```json
LLM SCORING = V2 UNIQUEMENT

V1 : algorithme règles-based déterministe
  → reproductible, auditable, pas de coût variable par candidature
  → score immuable après CandidateParsed

V2 (planifié) :
  → Appel LLM pour enrichir score_breakdown avec explication en langage naturel
  → Matching sémantique (embeddings) pour skills et compétences implicites
  → model_version passera à "llm-v2.x" avec identification du modèle exact
  → Nécessite: choix modèle, coût par appel, gestion latence, versioning prompts

Trigger migration V1→V2 :
  → Décision OWNER formelle
  → model_version mis à jour (breaking change pour consommateurs de CandidateScored)
```

---

## Alignement avec documents existants

| Document | Section | Alignement |
|---|---|---|
| `6.6 CHECKLIST LOT 5` | §M5 DoD ligne "Scoring: ai_score + model_version" | ✅ model_version = "rules-v1.0" conforme |
| `6.6 CHECKLIST LOT 5` | §M5 GWT "CandidateScored publié avec ai_score + model_version" | ✅ Conforme |
| `2.10.4.4 LOCKED` | Event `CandidateScored` | ✅ Payload conforme (ai_score, model_version) |
| `PATCH_EVENTS_2.10.4.11 §B` | Event `WorkerSkillAdded` (M5 ATS scoring consommateur) | ✅ WorkerSkillAdded déclenche recalcul scoring si pertinent |
| `SECTION 10.E E2E-07` | Scénario ATS shortlist — score immuable | ✅ "CandidateScored n'est pas re-publié (score immuable)" |

---

## Definition of Done (Q7 ATS Scoring V1)

- [ ] Algorithme rules-v1.0 implémenté (4 composantes pondérées)
- [ ] `model_version = "rules-v1.0"` codé en dur (pas de paramètre)
- [ ] `score_breakdown` JSONB stocké dans `applications` (skills_matched, skills_missing, raisons)
- [ ] Scoring déclenché sur réception `CandidateParsed` (pas avant)
- [ ] Score immuable après publication `CandidateScored`
- [ ] `ai_score` dans plage [0, 100], arrondi à l'entier
- [ ] GWT-1 : score 83 pour match partiel compétences (valeurs exactes ci-dessus)
- [ ] GWT-2 : score 20 pour candidat sans compétences ni expérience
- [ ] GWT-3 : scoring différé si `CandidateParsed` pas encore reçu
- [ ] Tests : unit (algorithme 4 composantes) + cas limites (empty skills, null cv_data)
- [ ] Aucun appel LLM en V1 (vérifiable par absence d'import SDK LLM)

---

## Notes de traçabilité

- Ce patch ne modifie pas les documents LOCKED (2.9, 2.10, 2.11, 2.12).
- Il fait autorité pour la décision Q7 (scoring ATS V1) jusqu'à intégration dans une révision formelle.
- Document source : `6.6 — CHECKLIST — LOT 5 IA (ATS, WORKERS)` §M5 Scoring.
- Gap identifié : MEMORY.md section "Gaps encore ouverts" — Q7 ATS scoring modèle non défini.

## Mini-changelog

- 2026-02-22 : Création. Décision Q7 figée : V1 = règles-based (sans LLM). Algorithme 4 composantes (skills 50%, expérience 30%, langues 15%, certifications 5%). 3 GWT. LLM scoring = V2. Sources : 6.6 §M5, 2.10.4.4, E2E-07.
