# SECTION 10.E — ACCEPTANCE TESTS (GIVEN WHEN THEN) — CHAINE CRITIQUE E2E

- Statut: DRAFT
- Portée: définir des scénarios d'acceptation documentaires sur la chaîne critique rémunération -> score -> enforcement -> billing.
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

## Non-goals / Out of scope

- Définir des jeux de données de test techniques.
- Définir des algorithmes de score, de rémunération ou d'enforcement.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: scénarios GWT complétés sur la chaîne critique avec attentes RBAC et multi-tenant.
