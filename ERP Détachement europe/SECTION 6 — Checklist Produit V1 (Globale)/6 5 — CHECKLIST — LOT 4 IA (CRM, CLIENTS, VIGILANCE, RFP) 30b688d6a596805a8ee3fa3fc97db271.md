# 6.5 — CHECKLIST — LOT 4 IA (CRM, CLIENTS, VIGILANCE, RFP)

- Statut: READY
- Portée: checklist opérationnelle complète du Lot 4 (M2 CRM, M3 Clients/Vigilance, M4 RFP).
- Règles: aucun changement aux documents LOCKED (2.9/2.10/2.11/2.12). Complément opérationnel uniquement.
- Références SOCLE:
  - `SOCLE LOCKED:501` — plan d'exécution lots
  - `SOCLE LOCKED:517-521` — périmètre Lot 4
  - `SOCLE LOCKED:108-130` — catalogue modules M2/M3/M4

---

## Modules couverts par ce lot

| Module | Nom SOCLE | In scope | Notes |
| --- | --- | --- | --- |
| M2 | CRM Prospection | oui | Leads, pipeline, conversions. |
| M3 | Gestion Clients + Vigilance | oui | Clients, sites, documents vigilance. |
| M4 | RFP Interne | oui | RFP unifiée, visibility flag, anti-désintermédiation. |
| M5 | ATS | non | Lot 5. |
| M13 | i18n & Comms | non | Transverse, intégration au moment des UIs. |

## Dépendances (lots précédents)

- [ ] Lot 1 validé (Foundation: tenant, users, RBAC, Vault base)
- [ ] Lot 2 validé (Core Métier: missions, compliance case base)
- [ ] Lot 3 validé (Timesheets & Mobile: timesheets, worker app base)

---

## M2 — CRM Prospection

### Ancres contractuelles

- DB: `leads` (2.9 §leads), `tasks` (2.9 §tasks)
- OpenAPI: `POST /v1/leads`, `PATCH /v1/leads/{id}`, `PATCH /v1/leads/{id}/status`, `POST /v1/tasks` (2.11 LOCKED)
- Events: `LeadCreated`, `LeadStatusChanged`, `LeadConvertedToClient`, `TaskCreated`, `TaskStatusChanged` (2.10.4.2, 2.10.4.10)
- RBAC: `tenant_admin` + `agency_user` en lecture/écriture; `consultant` lecture scoped (2.12 LOCKED)

### Règles métier V1

- Un lead appartient à un `owner_user_id` (agency_user ou consultant).
- Statuts lead: `new → qualified → proposal_sent → won → lost`. Transitions validées en backend.
- Conversion lead → client: opération atomique (transaction DB), publie `LeadConvertedToClient`.
- `corridor_target` obligatoire (ex: `PL->FR`).
- Tasks liées à entity_type/entity_id: un lead peut porter plusieurs tasks.

### Critères d'acceptation (GWT)

**Given** un `agency_user` créant un lead → **Then** `LeadCreated` publié, `owner_user_id` = créateur, `tenant_id` scoped.

**Given** un lead en statut `qualified` passé à `won` → **Then** `LeadStatusChanged` publié avec `from: qualified, to: won`.

**Given** conversion lead → client → **Then** `client_id` créé, `lead.converted_to_client_id` renseigné, `LeadConvertedToClient` publié, opération atomique (pas de lead sans client ou client sans lead après conversion).

**Given** un `consultant` tentant d'accéder à un lead hors de son scope → **Then** 403 Forbidden.

**Given** un `client_user` tentant d'accéder à `/v1/leads` → **Then** 403 Forbidden.

### Definition of Done (M2)

- [ ] Table `leads` migrée avec RLS tenant_id
- [ ] Endpoints `POST/PATCH /v1/leads`, `PATCH /v1/leads/{id}/status` implémentés
- [ ] Conversion lead → client atomique (transaction + rollback si erreur)
- [ ] Events `LeadCreated`, `LeadStatusChanged`, `LeadConvertedToClient` publiés via outbox
- [ ] RBAC validé (unit tests par rôle)
- [ ] Multi-tenant: aucun lead d'un tenant visible depuis un autre tenant
- [ ] Tests: unit + integration + RBAC + multi-tenant

---

## M3 — Gestion Clients + Vigilance

### Ancres contractuelles

- DB: `clients`, `client_sites`, `client_documents` (2.9 §clients), `files` + `file_links` (2.9 §vault)
- OpenAPI: `POST /v1/clients`, `GET /v1/clients/{id}`, `POST /v1/clients/{id}/sites`, `GET /v1/clients/{id}/documents`, `POST /v1/clients/{id}/documents` (2.11 LOCKED + 2.11.a V1.2.2)
- Events: `ClientCreated`, `ClientSiteCreated`, `ClientDocumentStatusChanged`, `FileUploaded` (2.10.4.2, 2.10.4.6)
- RBAC: `tenant_admin` + `agency_user` toute écriture; `client_user` lecture + upload docs vigilance si `client_portal.level=full` (2.12.a V1.2.2 Q4-C)

### Règles métier V1

- Un `client` est un donneur d'ordre (entreprise utilisatrice). Chaque `client_site` est un site géographique lié à un `client`.
- Documents vigilance: chaque `client_document` a un `doc_type` (kbis, urssaf, rc_pro, vigilance_attestation...), `valid_to`, `status` (missing|pending|valid|expiring|expired).
- Batch quotidien: recalcule les statuts expiration docs client, publie `ClientDocumentStatusChanged` si changement.
- `client_user` upload uniquement via `POST /v1/clients/{id}/documents` si flag `client_portal.level=full` — sinon 403.
- Vigilance: chaque document client doit être archivé dans le Vault (`file_links` reliant `files` à `client_documents`).

### Critères d'acceptation (GWT)

**Given** création d'un client → **Then** `ClientCreated` publié, `tenant_id` scoped, `default_language` hérité depuis `tenant_settings`.

**Given** création d'un site client → **Then** `ClientSiteCreated` publié avec `country_code` obligatoire (FR|PT|RO|PL).

**Given** un document client passant de `valid` à `expiring` (batch quotidien) → **Then** `ClientDocumentStatusChanged` publié avec `from: valid, to: expiring`, `valid_to` renseigné.

**Given** `client_user` avec `client_portal.level=readonly` tentant `POST /v1/clients/{id}/documents` → **Then** 403.

**Given** `client_user` avec `client_portal.level=full` → **Then** upload accepté, `FileUploaded` publié.

**Given** un `client_user` d'un tenant différent tentant d'accéder au client → **Then** 403 (RLS).

### Definition of Done (M3)

- [ ] Tables `clients`, `client_sites`, `client_documents` migrées avec RLS
- [ ] Endpoints CRUD clients/sites/documents implémentés
- [ ] Documents vigilance: statuts + batch quotidien expiration
- [ ] Upload docs via Vault (`files` + `file_links`) — pas de stockage direct en DB
- [ ] RBAC `client_user` conditionnel au flag `client_portal.level`
- [ ] Events `ClientCreated`, `ClientSiteCreated`, `ClientDocumentStatusChanged`, `FileUploaded` publiés
- [ ] Tests: unit + integration + RBAC + multi-tenant + batch expiration

---

## M4 — RFP Interne (unifiée — décision Q5-B)

### Ancres contractuelles

- DB: `rfp_requests` (+ champ `visibility` enum `private|public`), `rfp_invites`, `rfp_responses`, `rfp_allocations`, `rfp_contact_logs` (2.9.16-A, 2.9.16-E)
- OpenAPI: `POST /v1/rfps`, `GET /v1/rfps`, `PATCH /v1/rfps/{id}`, `POST /v1/rfps/{id}:publish`, `POST /v1/rfps/{id}/invites`, `POST /v1/rfps/{id}/responses`, `POST /v1/rfps/{id}:allocate`, `PATCH /v1/rfps/{id}/visibility`, `POST /v1/rfps/{id}/contact-logs`, `GET /v1/rfps/{id}/contact-logs` (2.11 LOCKED + 2.11.a V1.2.2)
- Events: `RfpCreated`, `RfpPublished`, `RfpInviteCreated`, `RfpResponseSubmitted`, `RfpAllocated`, `RfpContactLogged` (2.10.4.3, 2.10.4.11)
- RBAC: `tenant_admin` + `agency_user` + `consultant` (scoped) en lecture/écriture; `client_user` et `worker` exclus (2.12.a V1.2.2 Q5-B, Q6-B)

### Mécanisme RFP unifié (Q5-B)

- Une seule table `rfp_requests` avec champ `visibility: enum('private', 'public')`.
  - `private`: RFP visible uniquement pour les agences explicitement invitées (`rfp_invites`).
  - `public`: RFP visible pour toutes les agences du réseau marketplace (V2 scope réduit en V1: selon `tenant_settings`).
- `PATCH /v1/rfps/{id}/visibility` modifie la visibilité post-création (droits: `tenant_admin` + `agency_user` + `consultant`).
- La publication (`POST /v1/rfps/{id}:publish`) ne change pas le flag `visibility`; elle change le statut de `draft` à `published`.

### Anti-désintermédiation — Contact Logs (Q6-B)

- `rfp_contact_logs`: chaque interaction entre une agence et un client sur un RFP doit être tracée.
- Champs: `rfp_id`, `logged_by_user_id`, `contact_type` (email|call|meeting|other), `counterparty_name`, `occurred_at`, `notes`.
- Rétention minimale: 12 mois glissants.
- RBAC: `POST` pour `tenant_admin` + `agency_user` + `consultant`; `GET` pour `tenant_admin` + `agency_user` uniquement.
- Event `RfpContactLogged` publié à chaque log.

### Modèle Scoring RFP Comparateur V1

Critères pondérés (versionnés — `model_version = "rfp-score-1.0"`):

| Critère | Poids V1 | Description |
| --- | --- | --- |
| Taux proposé vs budget client | 40% | Écart en % par rapport au budget cible |
| Score conformité historique agence | 30% | `agency_risk_scores` moyen sur 12 mois glissants |
| Complétude réponse | 20% | Champs renseignés dans `rfp_responses` |
| Délai de réponse | 10% | Rapidité par rapport à la date de clôture |

- `score_breakdown` (jsonb) obligatoire: chaque critère + sa contribution individuelle.
- Changement de poids → nouvelle `model_version`. Anciens scores gardent leur `model_version` (immuabilité historique).
- Scoring déclenché en backend uniquement, résultat stocké dans `rfp_responses.score` + `score_breakdown`.

### Critères d'acceptation (GWT)

**Given** création d'un RFP → **Then** `visibility` défaut = `private`, statut = `draft`, `RfpCreated` publié.

**Given** `PATCH /v1/rfps/{id}/visibility` avec `{ visibility: "public" }` → **Then** `visibility` mis à jour, aucun autre champ modifié, log d'audit écrit.

**Given** 2 agences répondent à un RFP → **Then** scores distincts calculés, `score_breakdown` lisible avec 4 critères.

**Given** changement de poids scoring → **Then** anciens scores gardent leur `model_version`, nouveaux scores utilisent la nouvelle version.

**Given** `POST /v1/rfps/{id}/contact-logs` par un `consultant` → **Then** log créé, `RfpContactLogged` publié, log accessible via `GET` par `agency_user`.

**Given** `GET /v1/rfps/{id}/contact-logs` par un `consultant` → **Then** 403 (lecture réservée `tenant_admin` + `agency_user`).

**Given** `client_user` tentant `POST /v1/rfps` → **Then** 403.

### Definition of Done (M4)

- [ ] Tables `rfp_requests` (+ `visibility`), `rfp_invites`, `rfp_responses`, `rfp_allocations`, `rfp_contact_logs` migrées avec RLS
- [ ] Endpoints RFP CRUD, publish, invites, responses, allocate implémentés
- [ ] `PATCH /v1/rfps/{id}/visibility` implémenté (Q5-B)
- [ ] `POST/GET /v1/rfps/{id}/contact-logs` implémentés (Q6-B)
- [ ] Scoring comparateur V1 implémenté en backend (score + score_breakdown immuables)
- [ ] Events `RfpCreated`, `RfpPublished`, `RfpInviteCreated`, `RfpResponseSubmitted`, `RfpAllocated`, `RfpContactLogged` publiés via outbox
- [ ] RBAC par endpoint validé (tests unitaires par rôle)
- [ ] Rétention contact logs: 12 mois (politique de purge documentée)
- [ ] Tests: unit + integration + RBAC + multi-tenant + scoring

---

## Livrables obligatoires (Lot 4 global)

- [ ] DB / migrations (M2 + M3 + M4)
- [ ] Events outbox (tous events M2/M3/M4 ci-dessus)
- [ ] OpenAPI contrat respecté (endpoints V1 LOCKED + V1.2.2 patch)
- [ ] RBAC: tous rôles testés par endpoint
- [ ] Tests (unit, integration, RBAC, multi-tenant)
- [ ] Audit trail: toutes mutations loggées (created_by, updated_by, tenant_id)
- [ ] Batch quotidien: expiration docs client opérationnel

## Ready-to-code gate

- [ ] Gate ready-to-code validée (tous DoD ci-dessus cochés)

---

## Notes de traçabilité

- Contrats référencés: SOCLE V1 LOCKED + 2.9 DB (V1.1) + 2.9.16 (patch V1.2) + 2.10 Events (V1.1 + 2.10.4.11 addendum) + 2.11 OpenAPI LOCKED + 2.11.a V1.2.2 + 2.12.a V1.2.2.
- Décisions OWNER intégrées: Q4-C (client_portal), Q5-B (RFP visibility), Q6-B (contact-logs anti-désintermédiation).
- Aucune modification des documents LOCKED.

## Out of scope

- M5/M6 (ATS/Workers) → Lot 5.
- M8 (compliance engine rémunération) → Lot 7.
- M11/M12 (risk/certification/marketplace) → Lot 8.
- Marketplace publique étendue → V2.
- Allocation automatique RFP → V2.

## Mini-changelog

- 2026-02-18: création du squelette documentaire.
- 2026-02-18: ancrage explicite Lot 4 → modules M2/M3/M4, scoring comparateur M4.
- 2026-02-20: réécriture complète READY — ancres contractuelles, règles métier, GWT, DoD par module. Décisions Q4-C, Q5-B, Q6-B intégrées.
