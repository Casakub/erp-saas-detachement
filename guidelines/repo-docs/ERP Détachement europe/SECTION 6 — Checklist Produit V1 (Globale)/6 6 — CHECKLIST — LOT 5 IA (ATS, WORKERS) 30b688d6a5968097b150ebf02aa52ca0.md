# 6.6 — CHECKLIST — LOT 5 IA (ATS, WORKERS)

- Statut: READY
- Version: 1.1
- Date: 2026-02-20
- Portée: checklist opérationnelle complète du Lot 5 (M5 ATS, M6 Workers & Dossiers).
- Règles: aucun changement aux documents LOCKED (2.9/2.10/2.11/2.12). Complément opérationnel uniquement.
- Références SOCLE:
  - `SOCLE LOCKED:501` — plan d'exécution lots
  - `SOCLE LOCKED:522-527` — périmètre Lot 5 (ATS + Workers)
  - `SOCLE LOCKED:108-130` — catalogue modules M5/M6

---

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope | Notes |
| --- | --- | --- | --- |
| M5 | ATS (Annonces & Candidatures) | oui | Job offers, applications, scoring, shortlist. |
| M6 | Workers & Dossiers | oui | Workers, documents, skills (V1 — décision Q9-A). |
| M2 | CRM Prospection | non | Lot 4. |
| M4 | RFP Interne | non | Lot 4. |
| M13 | i18n & Comms | non | Transverse. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé (Foundation: tenant, users, RBAC, Vault, Outbox)
- [ ] Lot 2 validé (Core Métier: missions, compliance case, enforcement flags)
- [ ] Lot 3 validé (Timesheets & Mobile)
- [ ] Lot 4 validé (CRM, Clients, Vigilance, RFP)

---

## M5 — ATS (Annonces & Candidatures)

### Ancres contractuelles

- DB: `job_offers`, `applications`, `candidates` (2.9 LOCKED)
- OpenAPI: `POST /v1/job-offers`, `PATCH /v1/job-offers/{id}/status`, `GET /v1/job-offers`, `POST /v1/applications`, `PATCH /v1/applications/{id}/status`, `GET /v1/applications`, `POST /v1/applications/{id}:shortlist` (2.11.a V1.2.2)
- Events: `JobOfferPublished`, `ApplicationReceived`, `CandidateParsed`, `CandidateScored` (2.10.4.4 LOCKED)
- RBAC: `tenant_admin` + `agency_user` sur toute l'administration ATS; `consultant` en lecture scoped sur job-offers + applications; `client_user` et `worker` exclus (2.12.a V1.2.2)

### Règles métier V1

- `job_offer.status`: `draft → published → closed`. Seul `tenant_admin` + `agency_user` modifient le statut.
- `application.status`: `new → reviewed → shortlisted → rejected`. Transitions backend uniquement.
- Un `candidate` peut avoir plusieurs `applications` sur des `job_offers` différents.
- Parsing IA: `ApplicationReceived` → job de parsing backend → `CandidateParsed`. La logique IA est backend uniquement, le no-code ne prend pas de décision de scoring.
- Scoring: `CandidateScored` publié avec `ai_score` + `model_version`. Score stocké dans `applications.ai_score`, immuable après publication.
- Shortlist: `POST /v1/applications/{id}:shortlist` déclenché par `agency_user`/`tenant_admin`; le `consultant` ne peut pas shortlister.
- `GET /v1/applications` pour `consultant`: scoped aux applications des candidats de ses missions/RFP assignés.

### Critères d'acceptation (GWT)

**Given** création d'une `job_offer` → **Then** statut initial = `draft`, `JobOfferPublished` publié à la transition `draft → published`.

**Given** `PATCH /v1/job-offers/{id}/status` avec `{ status: "published" }` par `agency_user` → **Then** 200, event `JobOfferPublished` publié.

**Given** soumission d'une application → **Then** `ApplicationReceived` publié, parsing backend déclenché.

**Given** parsing terminé → **Then** `CandidateParsed` publié avec les champs extraits, `CandidateScored` publié avec `ai_score` et `model_version`.

**Given** `POST /v1/applications/{id}:shortlist` par `agency_user` → **Then** statut passe à `shortlisted`, no-code notifié.

**Given** `consultant` tentant `POST /v1/applications/{id}:shortlist` → **Then** 403 Forbidden.

**Given** `client_user` tentant `GET /v1/job-offers` → **Then** 403 Forbidden.

**Given** cross-tenant sur applications → **Then** 403/404 (RLS).

### Definition of Done (M5)

- [ ] Tables `job_offers`, `applications`, `candidates` migrées avec RLS tenant_id
- [ ] Endpoints ATS implémentés (`POST/PATCH/GET job-offers`, `POST/PATCH/GET applications`, `POST applications:shortlist`)
- [ ] Pipeline parsing IA backend déclenché sur `ApplicationReceived`
- [ ] Scoring: `ai_score` + `model_version` stockés, immuables après publication
- [ ] Events `JobOfferPublished`, `ApplicationReceived`, `CandidateParsed`, `CandidateScored` publiés via outbox
- [ ] RBAC par endpoint validé (unit tests par rôle)
- [ ] `consultant` scoped uniquement sur ses ressources
- [ ] Multi-tenant: aucune application d'un tenant visible depuis un autre
- [ ] Tests: unit + integration + RBAC + multi-tenant

---

## M6 — Workers & Dossiers

### Ancres contractuelles

- DB: `workers`, `worker_documents`, `worker_skills` (2.9 LOCKED + 2.9.16-D patch — `worker_skills` livré V1, décision Q9-A)
- OpenAPI: `POST /v1/workers`, `GET /v1/workers/{id}`, `PATCH /v1/workers/{id}`, `GET /v1/workers/{id}/documents`, `POST /v1/workers/{id}/documents`, `GET /v1/workers/{id}/skills`, `POST /v1/workers/{id}/skills` (2.11.a V1.2.2)
- Events: `WorkerCreated`, `WorkerDocumentStatusChanged`, `WorkerSkillAdded` (2.10.4.5 LOCKED + 2.10.4.11 addendum)
- RBAC (2.12.a V1.2.2):
  - `POST /v1/workers` : `tenant_admin` + `agency_user`
  - `GET /v1/workers/{id}` : `tenant_admin`, `agency_user`, `consultant` (scoped), `worker` (own only)
  - `PATCH /v1/workers/{id}` : `tenant_admin` + `agency_user`
  - `GET /v1/workers/{id}/documents` : `tenant_admin`, `agency_user`, `consultant` (scoped), `worker` (own only)
  - `POST /v1/workers/{id}/documents` : `tenant_admin`, `agency_user`, `worker` (own only — upload uniquement)
  - `GET /v1/workers/{id}/skills` : `tenant_admin`, `agency_user`, `consultant` (scoped), `worker` (own only)
  - `POST /v1/workers/{id}/skills` : `tenant_admin` + `agency_user` uniquement

### Règles métier V1

- Un `worker` est une personne physique détachée. Il a un `user_id` optionnel (si accès à la worker app).
- Documents worker: chaque `worker_document` a `doc_type` (passport, a1, cni, work_permit…), `valid_to`, `status` (missing|pending|valid|expiring|expired).
- Batch quotidien: recalcule les statuts expiration docs worker, publie `WorkerDocumentStatusChanged` si changement.
- Upload docs worker: `worker` peut uploader ses propres documents uniquement (`POST /v1/workers/{id}/documents` avec `id` = son propre worker_id). Vérification ownership en backend.
- Skills (décision Q9-A, livré V1): `worker_skills` table avec `skill_code`, `skill_label`, `level` (beginner|intermediate|expert|null). Ajout par `tenant_admin`/`agency_user` uniquement — le worker lit ses propres skills en lecture seule.
- `WorkerSkillAdded` publié à chaque ajout de skill (addendum 2.10.4.11).
- Liaison avec missions: un `worker` peut être attaché à plusieurs missions simultanément (vérifier contraintes de durée via M8).

### Critères d'acceptation (GWT)

**Given** création d'un worker par `agency_user` → **Then** `WorkerCreated` publié, `tenant_id` scoped.

**Given** document worker passant de `valid` à `expiring` (batch quotidien) → **Then** `WorkerDocumentStatusChanged` publié avec `from: valid, to: expiring`, `valid_to` renseigné.

**Given** `worker` tentant `POST /v1/workers/{id}/documents` avec son propre `worker_id` → **Then** upload accepté, `FileUploaded` publié.

**Given** `worker` tentant `POST /v1/workers/{autre_id}/documents` → **Then** 403 (ownership check).

**Given** `POST /v1/workers/{id}/skills` par `agency_user` → **Then** skill créé, `WorkerSkillAdded` publié.

**Given** `worker` tentant `POST /v1/workers/{id}/skills` → **Then** 403 (lecture seule pour worker).

**Given** `consultant` tentant `GET /v1/workers/{id}` sur un worker hors de son scope → **Then** 403.

**Given** `client_user` tentant `GET /v1/workers/{id}` → **Then** 403.

**Given** cross-tenant sur workers → **Then** 403/404 (RLS).

### Definition of Done (M6)

- [ ] Tables `workers`, `worker_documents`, `worker_skills` migrées avec RLS tenant_id
- [ ] `worker_skills`: champ `level` enum `beginner|intermediate|expert|null`, versioning documenté
- [ ] Endpoints workers CRUD implémentés (`POST/GET/PATCH workers`, `GET/POST documents`, `GET/POST skills`)
- [ ] Upload docs via Vault (`files` + `file_links`) — pas de stockage direct en DB
- [ ] Ownership check sur `POST /v1/workers/{id}/documents` (worker = own only)
- [ ] Batch quotidien: expiration docs worker + `WorkerDocumentStatusChanged`
- [ ] Events `WorkerCreated`, `WorkerDocumentStatusChanged`, `WorkerSkillAdded` publiés via outbox
- [ ] RBAC par endpoint validé (unit tests par rôle)
- [ ] `worker` : lecture own only stricte, aucune écriture hors upload propres docs
- [ ] Multi-tenant: aucun worker d'un tenant visible depuis un autre
- [ ] Tests: unit + integration + RBAC + multi-tenant + batch expiration

---

## Intégration M5 ↔ M6 (points de contact)

- Un `candidate` (M5) peut être converti en `worker` (M6): opération backend atomique. Pas d'endpoint dédié en V1 — géré via `POST /v1/workers` avec `application_id` en payload optionnel.
- Le matching ATS (scoring candidat vs job offer) peut lire `worker_skills` pour enrichir le score (pipeline backend M5, lecture seule sur M6).
- Frontière stricte: M5 ne modifie jamais une table M6 directement. Tout passe par events ou appels backend internes.

---

## Livrables obligatoires (Lot 5 global)

- [ ] DB / migrations (M5 + M6 — job_offers, applications, candidates, workers, worker_documents, worker_skills)
- [ ] Events outbox (tous events M5/M6 ci-dessus)
- [ ] OpenAPI contrat respecté (endpoints V1.2.2 patch 2.11.a)
- [ ] RBAC: tous rôles testés par endpoint
- [ ] Tests (unit, integration, RBAC, multi-tenant)
- [ ] Audit trail: toutes mutations loggées (created_by, updated_by, tenant_id)
- [ ] Batch quotidien: expiration docs worker opérationnel
- [ ] Pipeline parsing IA: déclenché de façon asynchrone, résultat publié via events

## Ready-to-code gate

- [ ] Gate ready-to-code validée (tous DoD ci-dessus cochés)

---

## Notes de traçabilité

- Contrats référencés: SOCLE V1 LOCKED + 2.9 DB (V1.1) + 2.9.16 (patch V1.2, worker_skills Q9-A) + 2.10 Events (V1.1 + addendum 2.10.4.11: WorkerSkillAdded) + 2.11.a V1.2.2 + 2.12.a V1.2.2.
- Décision OWNER intégrée: Q9-A (`worker_skills` livré V1, option V1 retirée).
- Aucune modification des documents LOCKED.

## Out of scope

- M2/M3/M4 (CRM/Clients/RFP) → Lot 4.
- M8 (compliance engine rémunération) → Lot 7.
- M11/M12 (risk/certification/marketplace) → Lot 8.
- Job board externe / connecteurs ATS partenaires → V2 (Backlog 2.10.7).
- Parsing IA avancé (NLP multilingue) → V2.
- Offline worker app → V2.

## Mini-changelog

- 2026-02-18: création du squelette documentaire (sans contenu métier).
- 2026-02-18: ancrage explicite Lot 5 → modules M5/M6 (SOCLE).
- 2026-02-20: réécriture complète READY — ancres contractuelles complètes, règles métier M5/M6, GWT, DoD par module. Décision Q9-A (`worker_skills` V1) intégrée.
