# SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E

- Statut: READY
- Version: 1.2
- Date: 2026-02-20
- Portée: scénarios d'acceptation documentaires sur la chaîne critique rémunération → score → enforcement → billing + surfaces V1.2.2 (RFP contact-logs, SIPSI, Web Push, ATS, Worker Skills, Finance).
- Règles:
- Scénarios d'acceptation uniquement (pas de code, pas d'implémentation).
- Référencer explicitement RBAC et isolation multi-tenant.

## Références sources (justification d'existence)

- SOCLE point 10.E: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:562`
- Chaîne critique métier: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:329`
- Events M8 (snapshot, score, enforcement): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-fr 308688d6a596802bad05fb3834118422.md:348`
- Endpoints timesheets/invoices et règles 422: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md:503`
- Matrice RBAC: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md:73`
- Multi-tenant strict: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:58`
- Alias utilisés dans les scénarios: `DB`, `OPENAPI`, `RBAC`, `SECTION9` pointent vers les chemins source listés ci-dessus.

## Scénario E2E-01 — Rémunération: calcul snapshot immuable

- Given:
- Une `compliance_case` du tenant A existe et contient des `remuneration_inputs`.
- L'acteur est `agency_user` ou `tenant_admin` du tenant A.
- When:
- L'acteur appelle `POST /v1/compliance-cases/{compliance_case_id}/remuneration/snapshots:calculate`.
- Then:
- Un snapshot immuable est créé (`worker_remuneration_snapshot`, sans `updated_at`).
- L'event `RemunerationSnapshotCreated` est publié.
- Une réévaluation enforcement peut être publiée si les flags changent.

### RBAC attendu

- Autorisé: `tenant_admin`, `agency_user`.
- Refusé: `consultant`, `client_user`, `worker`.
- Référence: `RBAC:77`, `RBAC:78`.

### Isolation multi-tenant attendue

- Un acteur tenant B ne peut pas calculer un snapshot sur une `compliance_case` tenant A.
- Référence: `OPENAPI:14`, `DB:31`.

## Scénario E2E-02 — Score conformité après snapshot

- Given:
- Un `worker_remuneration_snapshot` existe pour une `compliance_case`.
- Le moteur conformité M8 est actif sur ce dossier.
- When:
- Le processus M8 calcule/met à jour `compliance_scores`.
- Then:
- Le score est persisté avec `scoring_model_version`.
- L'event `ComplianceScoreCalculated` est publié.

### RBAC attendu

- Le calcul score relève du backend/système (décision critique), pas de `client_user` ni `worker`.
- Référence: `RBAC:34`, `RBAC:181`.

### Isolation multi-tenant attendue

- Le score est stocké et recalculé dans le même `tenant_id` que la `compliance_case`.
- Référence: `DB:467`, `DB:468`.

## Scénario E2E-03 — Enforcement bloque validation timesheet

- Given:
- La mission porte `can_validate_timesheets = false` avec `blocking_reasons`.
- Une timesheet est en statut `submitted`.
- L'acteur est `agency_user` ou `tenant_admin` du même tenant.
- When:
- L'acteur appelle `POST /v1/timesheets/{timesheet_id}:validate`.
- Then:
- La validation est refusée en `422` avec `code=timesheet_validation_blocked` et `blocking_reasons`.
- Le gate enforcement est appliqué avant validation métier.

### RBAC attendu

- Autorisé à tenter l'action: `tenant_admin`, `agency_user`.
- Non autorisé: `consultant`, `worker`.
- Référence: `RBAC:102`, `OPENAPI:503`.

### Isolation multi-tenant attendue

- Une timesheet d'un autre tenant ne peut pas être validée.
- Référence: `OPENAPI:14`, `SECTION9:118`.

## Scénario E2E-04 — Enforcement bloque création/émission facture

- Given:
- `can_issue_invoice = false` pour la mission liée à la timesheet.
- L'acteur est `agency_user` ou `tenant_admin` du tenant de la mission.
- When:
- L'acteur appelle `POST /v1/invoices:from-timesheet` ou `POST /v1/invoices/{invoice_id}:issue`.
- Then:
- L'API renvoie `422 invoice_issuance_blocked` avec `blocking_reasons`.
- `InvoiceBlocked` est publié selon le contexte décrit dans OpenAPI.

### RBAC attendu

- Autorisé à tenter: `tenant_admin`, `agency_user`.
- Refusé: `consultant`, `client_user`, `worker`.
- Référence: `RBAC:111`, `RBAC:112`, `OPENAPI:607`.

### Isolation multi-tenant attendue

- La facturation reste strictement limitée aux ressources du tenant de l'acteur.
- Référence: `OPENAPI:13`, `DB:21`.

## Scénario E2E-05 — Chaîne positive jusqu'au billing status

- Given:
- Snapshot conforme et enforcement autorisant la facturation (`can_issue_invoice = true`).
- Timesheet validée dans le même tenant.
- L'acteur est `agency_user` ou `tenant_admin`.
- When:
- Une facture est créée depuis la timesheet puis le statut de facturation timesheet est mis à jour selon le mode V1 C1.
- Then:
- `InvoiceIssued` ou `InvoiceDraftCreated` est traité selon mode C, puis `TimesheetBillingStatusChanged` est publié.
- La traçabilité endpoint -> events est vérifiable dans le mapping OpenAPI.

### RBAC attendu

- Les actions de billing sont réservées à `tenant_admin` et `agency_user`.
- Référence: `RBAC:109`, `OPENAPI:1201`.

### Isolation multi-tenant attendue

- Les transitions de billing status ne doivent jamais modifier une timesheet d'un autre tenant.
- Référence: `OPENAPI:715`, `SECTION9:251`.

## Scénario E2E-06 — RFP Contact Log (anti-désintermédiation Q6-B)

- Given:
  - Une `rfp_request` existe en statut `open` ou `evaluating` dans le tenant A.
  - L'acteur est `agency_user` ou `tenant_admin` du tenant A.
- When:
  - L'acteur appelle `POST /v1/rfps/{rfp_id}/contact-logs` avec `{ contact_type, client_id, context_note }`.
- Then:
  - Le contact log est créé dans `rfp_contact_logs` avec `occurred_at = now()` si non fourni.
  - L'event `RfpContactLogged` est publié via outbox.
  - Le log est conservé 12 mois minimum (retention policy — pas de delete avant 12 mois).

### RBAC attendu

- Autorisé: `tenant_admin`, `agency_user`.
- Refusé: `consultant`, `client_user`, `worker`.
- Référence: `2.12.a V1.2.2`, `6.5 Checklist Lot 4`.

### Isolation multi-tenant attendue

- Un acteur tenant B ne peut pas créer un contact log sur une `rfp_request` tenant A.
- Référence: `DB:2.9.16-E`, `2.11.a V1.2.2`.

---

## Scénario E2E-07 — ATS : Shortlist candidat (gating rôle)

- Given:
  - Une `application` est en statut `reviewed` sur une `job_offer` publiée dans le tenant A.
  - L'acteur est `agency_user` ou `tenant_admin` du tenant A.
- When:
  - L'acteur appelle `POST /v1/applications/{application_id}:shortlist`.
- Then:
  - Le statut de l'application passe à `shortlisted`.
  - L'event `CandidateScored` n'est pas re-publié (score immuable).
  - Le no-code reçoit notification via outbox (si abonné).
- When (cas refusé):
  - L'acteur est `consultant` → réponse `403 Forbidden`.

### RBAC attendu

- Autorisé: `tenant_admin`, `agency_user`.
- Refusé strict: `consultant`, `client_user`, `worker`.
- Référence: `2.12.a V1.2.2`, `6.6 Checklist Lot 5`.

### Isolation multi-tenant attendue

- Une application d'un autre tenant retourne `403/404`.
- Référence: `2.9 LOCKED`, `SECTION 9 LOCKED v1.1`.

---

## Scénario E2E-08 — Worker Skills : ajout et lecture (Q9-A)

- Given:
  - Un `worker` existe dans le tenant A avec `user_id` associé.
  - L'acteur est `agency_user` du tenant A.
- When:
  - L'acteur appelle `POST /v1/workers/{worker_id}/skills` avec `{ skill_code, skill_label, level: "expert" }`.
- Then:
  - Le skill est créé dans `worker_skills` avec `level = expert`.
  - L'event `WorkerSkillAdded` est publié via outbox.
- When (lecture par le worker):
  - L'acteur est le `worker` lui-même → `GET /v1/workers/{worker_id}/skills` retourne 200 avec la liste.
- When (écriture par le worker):
  - L'acteur est le `worker` → `POST /v1/workers/{worker_id}/skills` → `403 Forbidden`.

### RBAC attendu

- Écriture: `tenant_admin`, `agency_user` uniquement.
- Lecture: `tenant_admin`, `agency_user`, `consultant` (scoped), `worker` (own only).
- Référence: `2.12.a V1.2.2`, `2.9.16-D`, `6.6 Checklist Lot 5`.

### Isolation multi-tenant attendue

- Un worker d'un autre tenant retourne `403/404`.
- Référence: `DB:2.9 LOCKED`.

---

## Scénario E2E-09 — Web Push VAPID : abonnement et réception notification (Q3-A)

- Given:
  - Un `worker` est authentifié dans le tenant A avec un navigateur supportant Web Push API.
  - L'acteur est le `worker` lui-même.
- When:
  - L'acteur appelle `POST /v1/worker/push-subscription` avec payload VAPID valide `{ endpoint, p256dh, auth }`.
- Then:
  - L'abonnement est stocké dans `worker_push_subscriptions` (un enregistrement par worker).
  - Réponse `201 Created`.
- When (déclenchement event):
  - Un `TimesheetRejected` est publié pour une timesheet de ce worker.
- Then:
  - Le serveur envoie une notification push via VAPID à l'endpoint enregistré.
- When (désabonnement):
  - L'acteur appelle `DELETE /v1/worker/push-subscription` → `204 No Content`, abonnement supprimé.

### RBAC attendu

- `GET/POST/DELETE /v1/worker/push-subscription` : `worker` uniquement (own only).
- Aucun autre rôle ne peut accéder à ces endpoints.
- Référence: `2.12.a V1.2.2`, `6.3 Checklist Lot 3 v1.3`.

### Isolation multi-tenant attendue

- Un worker d'un tenant ne peut pas lire/modifier l'abonnement push d'un worker d'un autre tenant.
- Référence: `2.9.16-C`, `SECTION 9 LOCKED v1.1`.

---

## Scénario E2E-10 — Marketplace : gating certification et suspension automatique

- Given:
  - Une agence du tenant A a `risk_score = 75` (supérieur au seuil 70).
  - Le batch M12 quotidien vient de calculer ce score.
- When:
  - Le batch publie `AgencyRiskScoreCalculated`.
- Then:
  - `marketplace_access.status` passe à `suspended`.
  - `MarketplaceAccessChanged` est publié via outbox.
  - `AgencyCertificationStatusChanged` est publié si le niveau de certification change.
  - `GET /v1/marketplace/agencies` ne retourne plus cette agence (filtrée côté backend).
- When (tentative d'accès RFP par l'agence suspendue):
  - L'agence suspendue tente `POST /v1/rfps/{id}/responses` → `403 Forbidden` (gating marketplace).

### RBAC attendu

- Lecture catalogue: `tenant_admin`, `agency_user`, `client_user` (selon settings).
- `worker` : `403 Forbidden` sur tous les endpoints marketplace.
- Référence: `2.12 LOCKED`, `6.8 Checklist Lot 8 v1.1`.

### Isolation multi-tenant attendue

- Le calcul de risk score et la suspension ne peuvent affecter qu'une agence du tenant propriétaire.
- `GET /v1/marketplace/agencies` ne retourne jamais des agences cross-tenant.
- Référence: `2.9 LOCKED`, `SECTION 9 LOCKED v1.1`.

---

## Scénario E2E-11 — Finance : devis → commission → comptabilité (surfaces V1.2.2)

- Given:
  - Une mission est en statut `active` dans le tenant A avec `can_issue_invoice = true`.
  - L'acteur est `agency_user` ou `tenant_admin` du tenant A.
- When:
  - L'acteur appelle `POST /v1/quotes` pour créer un devis lié à la mission.
- Then:
  - Le devis est créé, `QuoteCreated` est publié via outbox.
- When:
  - L'acteur appelle `PATCH /v1/commissions/{commission_id}/status` avec `{ status: "approved" }`.
- Then:
  - La commission est approuvée, `CommissionApproved` est publié via outbox.
- When:
  - L'acteur appelle `GET /v1/accounting-exports` ou `POST /v1/accounting-exports` pour exporter.
- Then:
  - L'export comptable est généré/retourné selon le format configuré.
  - `client_user` et `worker` reçoivent `403 Forbidden` sur tous ces endpoints.

### RBAC attendu

- `POST /v1/quotes`, `PATCH /v1/commissions/{id}/status` : `tenant_admin`, `agency_user`.
- `GET /v1/accounting-exports` : `tenant_admin` uniquement.
- Refusé: `consultant`, `client_user`, `worker`.
- Référence: `2.12.a V1.2.2`, `6.4 Checklist Lot 6 v1.3`.

### Isolation multi-tenant attendue

- Devis, commissions et exports comptables sont strictement scoped au tenant de l'acteur.
- Référence: `2.9 LOCKED`, `SECTION 9 LOCKED v1.1`.

---

## Non-goals / Out of scope

- Définir des jeux de données de test techniques.
- Définir des algorithmes de score, de rémunération ou d'enforcement.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: scénarios GWT complétés sur la chaîne critique avec attentes RBAC et multi-tenant.
- 2026-02-20: v1.2 — ajout scénarios E2E-06 à E2E-11 couvrant les surfaces V1.2.2 (RFP contact-logs Q6-B, ATS shortlist, Worker Skills Q9-A, Web Push Q3-A, Marketplace gating Q5-B/M12, Finance quotes/commissions). Statut DRAFT → READY.
