# AGENTS.md — Refactor Doc-Tech (ERP Détachement Europe)

## 0) Portée
- Utilise ce fichier pour cadrer toute contribution documentaire sur ce repo.
- Respecte strictement les documents contractuels existants.
- N’invente aucun comportement produit.
- Applique le mode contract-first: contrat d’abord, rédaction ensuite.

## 1) Sources de vérité (ordre de priorité)
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-fr 308688d6a596802bad05fb3834118422.md`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md`
- `ERP Détachement europe/SECTION 5 — “DEFINITION OF DONE” GLOBAL (DoD) 308688d6a596807789b6f97e7433f4fd.md`
- `ERP Détachement europe/SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE) 308688d6a59680f2bff6f404c1ac8b90.md`
- `ERP Détachement europe/SECTION 8 — PLAN D’EXÉCUTION (ordre conseillé) 308688d6a596809584e4eef380abe47c.md`
- `ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 309688d6a59680f9b1a2c3d4e5f60789.md`
- `ERP Détachement europe/SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV) 308688d6a59680ebb64fe4ddb4223b41.md`

## 2) Structure du cahier des charges Notion exporté

### 2.1 Hub racine
- Point d’entrée: `ERP Détachement europe 308688d6a59680d8950feccf07ea2018.md`.
- Conserve les principes non négociables: multi-tenant strict, contract-first, no-code non décisionnel, auditabilité.

### 2.2 Sections fonctionnelles
- Section 1: prompts design (Figma Make).
- Section 2: prompts backend par module.
- Section 3: template pilotage IA.
- Section 4: AI contribution rules officielles.
- Section 5: Definition of Done globale.
- Section 6: checklists produit et lots.
- Section 7: orchestration no-code autorisée.
- Section 8: plan d’exécution (phases 0 à 9).
- Section 9: implementation substrate (stack & conventions) pour exécution backend.

### 2.3 Socle technique gelé (documents contractuels 2.x)
- 2.9: schéma DB V1.1 + patch.
- 2.10: events métier V1.1 (LOCKED).
- 2.11: OpenAPI V1 parcours 1 → 3 → 2.
- 2.12: RBAC matrix V1.

### 2.4 Clarification “section 9”
- Une SECTION 9 autonome existe dans ce repo: `SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS)`.
- Cette SECTION 9 couvre le substrat d’exécution backend (stack, conventions, harness, runbooks).
- La PHASE 9 de la SECTION 8 reste distincte et couvre uniquement no-code & automatisation.
- N’assimile jamais SECTION 9 (substrat) et PHASE 9 (orchestration no-code).

## 3) Règles de contribution documentaire
- Travaille module par module: 1 module = 1 périmètre.
- Refuse toute transversalité non validée.
- Mets à jour uniquement ce qui est impacté par la modification.
- Conserve le vocabulaire produit existant (missions, compliance case, enforcement flags, etc.).
- Préserve les rôles officiels: `tenant_admin`, `agency_user`, `consultant`, `client_user`, `worker`, `system`.
- Préserve les contraintes V1: mobile PWA online only, no-code orchestration only, décisions critiques backend only.

## 4) Conventions Markdown (obligatoires)
- Utilise un style simple: titres + listes + tableaux.
- Écris de manière impérative et opérationnelle.
- Interdis les code fences imbriqués.
- Si un code fence est nécessaire, utilise exclusivement `json` comme langage.
- N’utilise jamais `jsx`, `tsx`, `js`, `ts`, `markdown` dans les fences.
- Évite les fences pour du pseudo-code: préfère des listes de règles.
- Lors d’une modification d’un fichier existant, remplace les fences non conformes dans la zone touchée.
- Ne modifie pas le sens métier pendant une normalisation de format.
- Conserve les identifiants et chemins des fichiers export Notion.

## 5) Conventions OpenAPI V1 (obligatoires)

### 5.1 Contrat global
- Utilise le base path `/v1`.
- Applique l’auth Bearer JWT.
- Déduis le tenant depuis le token et garde tous les endpoints métiers tenant-scoped.
- Rappelle l’isolation DB/RLS côté données.

### 5.2 Erreurs standard
- `400` -> `validation_error`.
- `401` -> `unauthenticated`.
- `403` -> `forbidden`.
- `404` -> `not_found`.
- `409` -> `conflict`.
- `422` -> `business_rule_failed`.
- `429` -> `rate_limited`.
- `500` -> `internal_error`.

### 5.3 Pagination, idempotence, mutation
- Pagination standard: `?limit=50&cursor=...`.
- Créations sensibles: header `Idempotency-Key` obligatoire.
- Tout endpoint mutant publie un event via `events_outbox`.
- Toute réponse de blocage métier en `422` doit exposer des `blocking_reasons` lisibles.

### 5.4 Gates critiques à préserver
- Activation mission bloquée par enforcement flags (M8).
- Validation timesheet bloquée si enforcement interdit.
- Émission facture bloquée si `can_issue_invoice = false`.
- Finance V1 suit le mode C/C1 défini dans 2.11.

### 5.5 Contrat endpoint -> RBAC
- Toute route a des rôles explicites.
- Aucune permission implicite.
- `client_user` et `worker` restent en lecture limitée sur périmètre autorisé.

## 6) Convention des Producers (events)

### 6.1 Format de nommage
- Utilise `M<number>` pour le module producteur principal.
- Utilise `M7.T` pour les events timesheets.
- Utilise `M7bis` pour les events Worker App mobile.
- Conserve `AI service / M5` pour les events ATS issus du parsing/scoring IA.
- N’invente pas de nouveau préfixe producteur hors socle validé.

### 6.2 Mapping canonique Producer -> Domaine
| Producer | Domaine |
| --- | --- |
| M1 | Core / Identity / Tenant settings |
| M2 | CRM leads |
| M3 | Clients + vigilance |
| M4 | RFP interne + allocation |
| M5 | ATS (jobs, applications) |
| M6 | Workers + documents |
| M7 | Missions |
| M7bis | Worker app mobile (check events) |
| M7.T | Timesheets |
| M8 | Compliance, A1, rémunération, enforcement |
| M9 | Vault files + access logs |
| M10 | Finance, billing, payments, commissions |
| M11 | Marketplace (pas de producer dédié listé en 2.10.4 V1) |
| M12 | Risk, certification, ranking, marketplace access |

### 6.3 Exemples contractuels à conserver
- `MissionCreated` -> producer `M7`.
- `TimesheetSubmitted`, `TimesheetValidated`, `TimesheetRejected` -> producer `M7.T`.
- `MissionEnforcementEvaluated`, `A1StatusUpdated`, `ComplianceRequirementStatusChanged` -> producer `M8`.
- `InvoiceIssued`, `InvoiceBlocked`, `PaymentRecorded`, `TimesheetBillingStatusChanged` -> producer `M10`.
- `FileUploaded`, `FileAccessed`, `FileSoftDeleted` -> producer `M9`.
- `AgencyRiskScoreCalculated`, `AgencyCertificationStatusChanged`, `MarketplaceAccessChanged`, `MarketplaceRankingUpdated` -> producer `M12`.

## 7) Règle de synchronisation inter-docs (anti-dérive)

### 7.1 Règle principale exigée
- Toute modif OpenAPI implique:
- update Events.
- update DB (si impact).
- update RBAC.
- update changelog.

### 7.2 Règles inverses à appliquer
- Toute modif Events implique update OpenAPI + update DB (si impact) + update RBAC + changelog.
- Toute modif DB implique migration + update OpenAPI + update Events + update RBAC + changelog.
- Toute modif RBAC implique update OpenAPI + changelog.

### 7.3 Contrôles de cohérence minimaux
- Vérifie endpoint mutant <-> event publié.
- Vérifie event `producer` cohérent avec le module.
- Vérifie champs DB supportant payloads/events nouveaux.
- Vérifie droits RBAC alignés sur endpoints touchés.
- Vérifie présence d’une entrée de changelog.

## 8) No-code (rappel de gouvernance)
- Autorise uniquement orchestration: emails, notifications, PDF, relances, exports, parsing assisté.
- Interdis calcul conformité, scoring décisionnel, enforcement, règles pays dans no-code.
- Exige déclenchement no-code par event backend ou requête backend authentifiée et traçable.
- En cas de doute: stop scénario no-code et délègue backend.

## 9) How to validate

### 9.1 Checklist de vérification avant merge
- Confirme que le périmètre module n’a pas été dépassé.
- Confirme que les changements OpenAPI/Events/DB/RBAC sont synchronisés.
- Confirme que les routes OpenAPI sont en `/v1`.
- Confirme que les routes mutantes publient un event outbox.
- Confirme que les erreurs standard incluent `422 business_rule_failed` sur gates critiques.
- Confirme que la multi-tenance est explicitée (`tenant_id`, tenant-scoped, RLS).
- Confirme que les rôles RBAC des endpoints modifiés sont explicites.
- Confirme que la convention producer est respectée (`M7.T`, `M10`, etc.).
- Confirme que le changelog a été mis à jour.
- Confirme que la documentation reste alignée avec la DoD section 5.

### 9.2 Commandes de lint recommandées
- Si `markdownlint` est disponible: `markdownlint "**/*.md"`.
- Lance le contrôle documentaire anti-régression: `bash scripts/run_doc_check.sh`.
- Lance le contrôle anti-dérive substrat: `bash scripts/substrate_check.sh`.
- Lance le contrôle de complétude SECTION 10: `bash scripts/notion_section10_check.sh`.
- Lance le contrôle d’ancrage Lots↔Modules SECTION 6: `bash scripts/notion_lots_modules_check.sh`.
- Installe le hook pre-commit: `chmod +x .githooks/pre-commit && git config core.hooksPath .githooks`.
- Vérifie l’activation du hook: `git config --get core.hooksPath` (attendu: `.githooks`).
- CI GitHub Actions: workflow `.github/workflows/doc-check.yml` (triggers: `pull_request` + `push` sur `main`).
- CI GitHub Actions substrat: workflow `.github/workflows/substrate-check.yml` (triggers: `pull_request` + `push` sur `main`).
- Déclenchement manuel CI (si `gh` installé): `gh workflow run doc-check.yml`.
- Interprétation: `exit code 0` = conformité OK (fences, OpenAPI↔RBAC, OpenAPI↔Events, endpoints mutants).
- Interprétation: `exit code 1` = au moins un blocage; corriger chaque point listé avant merge.
- Interprétation substrate check: `exit code 0` = substrat lock conforme; `exit code 1` = blocage structure/doc/CI/events à corriger.
- Interprétation section10 check: `exit code 0` = SECTION 10 complète et sans placeholders; `exit code 1` = fichier manquant, contenu insuffisant ou marqueur placeholder détecté.
- Interprétation lots/modules check: `exit code 0` = lots 1..8 présents + ancrages modules explicites conformes + couverture globale M1..M13/M7bis + aucun placeholder SECTION 6; `exit code 1` = au moins un écart.
- Vérifie les fences interdits sur fichiers modifiés: `files=$(git diff --name-only -- '*.md'); [ -z "$files" ] || rg -n '```(jsx|tsx|ts|js|markdown)' $files`.
- Vérifie les routes non `/v1` dans OpenAPI: `rg -n '^### .*/' "ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md" | rg -v '/v1'`.
- Vérifie présence des erreurs standard: `rg -n 'validation_error|unauthenticated|forbidden|not_found|conflict|business_rule_failed|rate_limited|internal_error' "ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md"`.
- Vérifie usage `Idempotency-Key`: `rg -n 'Idempotency-Key' "ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md"`.
- Vérifie usage `events_outbox`: `rg -n 'events_outbox' "ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)"`.

### 9.3 Fallback sans outil de lint dédié
- Utilise `rg` + checklist manuelle.
- Refuse la validation si un point critique n’est pas démontré (OpenAPI, Events, DB, RBAC, changelog).
- Traite toute incohérence comme bloquante tant que non arbitrée.

### 9.4 Notion sync (GitHub -> Notion)
- Objectif: synchroniser en one-way des pages markdown non contractuelles vers Notion.
- Source de mapping: `notion-sync-map.json` (clé=`repo/path.md`, valeur=`notion_page_id`).
- Workflow CI: `.github/workflows/notion-sync.yml` (trigger `push` sur `main` + `workflow_dispatch`).
- Script de sync: `node scripts/notion_sync.mjs`.
- Secret requis GitHub Actions: `NOTION_TOKEN`.
- Détection des changements: `git diff --name-only $BASE_SHA $HEAD_SHA`; fallback automatique sur tout le mapping si plage indisponible.
- Pour ajouter une nouvelle page syncée:
- 1) Ajouter l’entrée dans `notion-sync-map.json` avec un `page_id` Notion (extrait de l’URL).
- 2) Vérifier que le fichier `.md` n’est pas un document LOCKED contractuel.
- 3) Tester localement en dry-run: `NOTION_TOKEN=... node scripts/notion_sync.mjs --dry-run`.
- Limites connues: les tables markdown sont converties en paragraphe (fallback), sans échec de sync.

## 10) Politique de changement
- Privilégie des diffs petits et traçables.
- Date les mises à jour importantes dans les documents contractuels touchés.
- N’écrase pas des choix LOCKED sans validation explicite.
- Si une règle est ambiguë, stop et demande arbitrage avant édition.

## 11) Résumé opérationnel
- Contrat d’abord.
- Multi-tenant partout.
- Backend décide, no-code orchestre.
- OpenAPI, Events, DB, RBAC, changelog doivent rester synchrones.
- Sans preuve de conformité documentaire, ne valide pas.

## 12) Changelog doc
- 2026-02-18: Gouvernance alignée sur SECTION 9 (sources de vérité, structure, distinction avec PHASE 9), sans changement métier.
- 2026-02-18: Ajout validation anti-dérive substrat (`scripts/substrate_check.sh`) et référence CI workflow dédiée, sans changement métier.
