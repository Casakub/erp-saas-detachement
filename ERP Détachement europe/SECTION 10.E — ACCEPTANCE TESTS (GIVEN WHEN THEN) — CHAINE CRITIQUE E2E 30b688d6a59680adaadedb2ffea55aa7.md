# SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E

- Statut: READY
- Version: 1.3
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
  - L'acteur appelle `POST /v1/rfps/{rfp_id}/contact-logs` avec `{ contact_type, counterpart_tenant_id, notes }`.
- Then:
  - Le contact log est créé dans `rfp_contact_logs` avec `occurred_at = now()` si non fourni.
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
  - Le devis est créé en statut `draft`.
- When:
  - L'acteur appelle `POST /v1/quotes/{quote_id}:send`.
- Then:
  - Le devis passe en statut `sent`, `QuoteSent` est publié via outbox.
- When:
  - L'acteur appelle `PATCH /v1/commissions/{commission_id}/status` avec `{ status: "approved" }`.
- Then:
  - La commission est approuvée (pas d'event canonique dédié en 2.10/2.10.4.11).
- When:
  - L'acteur appelle `POST /v1/accounting-exports` puis `GET /v1/accounting-exports/{export_id}` pour suivre l'export.
- Then:
  - L'export comptable est généré/retourné selon le format configuré.
  - `client_user` et `worker` reçoivent `403 Forbidden` sur tous ces endpoints.

### RBAC attendu

- `POST /v1/quotes`, `POST /v1/quotes/{id}:send`, `PATCH /v1/commissions/{id}/status` : `tenant_admin`, `agency_user`.
- `POST /v1/accounting-exports`, `GET /v1/accounting-exports/{id}` : `tenant_admin`, `agency_user`.
- Refusé: `consultant`, `client_user`, `worker`.
- Référence: `2.12.a V1.2.2`, `6.4 Checklist Lot 6 v1.3`.

### Isolation multi-tenant attendue

- Devis, commissions et exports comptables sont strictement scoped au tenant de l'acteur.
- Référence: `2.9 LOCKED`, `SECTION 9 LOCKED v1.1`.

---


## Scénario E2E-12 — Moteur rémunération : IDCC, éligibilité, durées cumulées (Lot 7)

- Given:
  - Une `compliance_case` existe pour une mission BTP dans le tenant A.
  - Les `remuneration_inputs` contiennent : `base_salary=14 EUR/h`, `idcc_code="BTP-1702"`, `classification_code="N2P2"`, `expense_logement=250 EUR/sem` (`is_reimbursable=true`).
  - La grille `salary_grids` BTP-1702 / N2P2 est chargée avec `legal_minimum_amount=13 EUR/h` (period_type=hourly).
  - L'acteur est `agency_user` du tenant A.
- When:
  - L'acteur appelle `POST /v1/compliance-cases/{id}/remuneration/inputs`.
  - Puis l'acteur appelle `POST /v1/compliance-cases/{id}/remuneration/snapshots:calculate`.
- Then:
  - **Étape 1** : la grille BTP-1702/N2P2 est trouvée pour la date de début de mission.
  - **Étape 2** : `excluded_expenses_amount = 250 EUR` (logement, is_reimbursable=true → exclu du calcul admissible). `eligible_remuneration_amount = 14 EUR/h`.
  - **Étape 3** : `14 >= 13` → `is_compliant = true`.
  - **Étape 4** : snapshot immuable créé (`worker_remuneration_snapshot`) sans champ `updated_at`. `engine_version = "pay-1.0"`. `calculation_details` contient le breakdown complet (prime exclue + raison).
  - **Étape 5** : `MissionEnforcementEvaluated` publié. Enforcement flags réévalués.
  - `RemunerationSnapshotCreated` publié via outbox.

### Cas limite — IDCC non référencé

- Given:
  - `idcc_code` absent de `salary_grids` pour la période.
- When:
  - Même séquence: `POST /v1/compliance-cases/{id}/remuneration/inputs` puis `POST /v1/compliance-cases/{id}/remuneration/snapshots:calculate`.
- Then:
  - Snapshot créé avec `is_compliant = null`, `warning_code = "REF_MISSING"`.
  - Mission non bloquée en V1 (`v1_mode.assisted_only = true`).
  - `RemunerationSnapshotCreated` publié (non-bloquant).

### Cas limite — Durées cumulées (batch quotidien)

- Given:
  - Batch quotidien M8 en cours. Une mission active dans le tenant A a `cumulative_duration_days = 305`.
  - Seuils configurés dans `country_rulesets` : `warning_days = 300`, `critical_days = 365`.
- When:
  - Le batch recalcule les durées.
- Then:
  - `cumulative_duration_days = 305` ≥ 300 et < 365 → `ComplianceDurationAlert` publié avec `alert_level = "warning"`, `threshold_days = 300`.
  - Si `cumulative_duration_days = 370` ≥ 365 → `ComplianceDurationAlert` publié avec `alert_level = "critical"`, enforcement flags mis à jour selon `country_rulesets`.

### RBAC attendu

- Autorisé (`POST remuneration/inputs` et `POST remuneration/snapshots:calculate`) : `tenant_admin`, `agency_user`.
- Refusé : `consultant`, `client_user`, `worker`.
- Lecture `GET /v1/admin/salary-grids` : `tenant_admin`, `agency_user` (lecture seule pour `agency_user`).
- Écriture `POST /v1/admin/salary-grids` : `tenant_admin`, `system` uniquement.
- Référence : `2.12.a V1.2.2 Q2-B`, `6.7 Checklist Lot 7`.

### Isolation multi-tenant attendue

- Un acteur tenant B ne peut pas déclencher un calcul rémunération sur une `compliance_case` tenant A.
- Les `salary_grids` partagées (platform-level) sont en lecture seule pour les tenants (écriture `system` uniquement).
- Référence : `2.9 LOCKED`, `SECTION 9 LOCKED v1.1`.

---

## Scénario E2E-13 — Export dossier inspection-ready (async flow)

- Given:
  - Une `compliance_case` existe en statut `active` dans le tenant A avec au moins un `worker_remuneration_snapshot`.
  - L'acteur est `agency_user` ou `tenant_admin` du tenant A.
- When:
  - L'acteur appelle `POST /v1/compliance-cases/{compliance_case_id}:export-dossier` avec `{ format: "pdf" }`.
- Then:
  - La réponse est `202 Accepted` avec `{ export_id, status: "pending", poll_url }`.
  - Un enregistrement `compliance_exports` est créé avec `status = "pending"`.
  - L'event `ComplianceDossierExportRequested` est publié via `events_outbox`.

### Flow polling (statut intermédiaire)

- When:
  - L'acteur appelle `GET /v1/compliance-cases/{compliance_case_id}/exports/{export_id}` pendant le traitement.
- Then:
  - La réponse retourne `{ status: "processing" }` (ou `"pending"` si job non démarré).
  - `download_url` est absent (`null`).

### Flow completion (export prêt)

- When:
  - Le job async termine la génération PDF.
- Then:
  - `compliance_exports.status` passe à `"ready"`.
  - `compliance_exports.storage_path` et `download_url` (signed URL Supabase, expiration 1h) sont renseignés.
  - L'event `ComplianceDossierExportCompleted` est publié via `events_outbox`.
  - `GET /v1/compliance-cases/{compliance_case_id}/exports/{export_id}` retourne `{ status: "ready", download_url, download_expires_at }`.
  - Le fichier expire 7 jours après `completed_at` (champ `expires_at` GENERATED ALWAYS).

### Cas d'échec (job en erreur)

- When:
  - Le job async échoue (ex: compliance_case sans snapshot valide).
- Then:
  - `compliance_exports.status` passe à `"failed"`.
  - `GET …/exports/{export_id}` retourne `{ status: "failed", error_message }`.

### RBAC attendu

- Autorisé (`POST :export-dossier` + `GET exports/{id}`) : `tenant_admin`, `agency_user`.
- Refusé strict : `worker` → `403 Forbidden`, `client_user` → `403 Forbidden`, `consultant` → `403 Forbidden`.
- Référence : `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md §3`, `PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md`.

### Isolation multi-tenant attendue

- Un acteur tenant B ne peut pas déclencher ni consulter un export sur une `compliance_case` tenant A.
  - `POST :export-dossier` → `404` (RLS filtre le compliance_case_id cross-tenant).
  - `GET exports/{export_id}` → `404` (RLS filtre par `tenant_id`).
- Référence : `PATCH_DB_2.9.16-G §Table compliance_exports`, RLS policy `rls_cexp_tenant_staff`.

### Sources

- Flow async : `PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md §Table B compliance_exports`
- Endpoints : `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md §3 + §4 (polling)`
- Events : `PATCH_EVENTS_2.10.4.11.md §D (ComplianceDossierExportRequested, ComplianceDossierExportCompleted)`
- Livrable obligatoire : `SECTION 6 — Checklist Globale 6.0 ligne 113`

---

## Non-goals / Out of scope

- Définir des jeux de données de test techniques.
- Définir des algorithmes de score, de rémunération ou d'enforcement.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: scénarios GWT complétés sur la chaîne critique avec attentes RBAC et multi-tenant.
- 2026-02-20: v1.2 — ajout scénarios E2E-06 à E2E-11 couvrant les surfaces V1.2.2
- 2026-02-21: v1.3 — ajout scénario E2E-12 (Lot 7 — moteur rémunération IDCC + éligibilité + durées cumulées batch). Couverture tous les lots V1. (RFP contact-logs Q6-B, ATS shortlist, Worker Skills Q9-A, Web Push Q3-A, Marketplace gating Q5-B/M12, Finance quotes/commissions). Statut DRAFT → READY.
- 2026-02-22: v1.4 — ajout scénario E2E-13 (Lot 7 — export dossier inspection-ready, flow async POST→202→polling→ready→download_url). Sources : PATCH_DB_2.9.16-G, PATCH_OPENAPI_V1.3, PATCH_EVENTS_2.10.4.11 §D. Statut reste READY.
