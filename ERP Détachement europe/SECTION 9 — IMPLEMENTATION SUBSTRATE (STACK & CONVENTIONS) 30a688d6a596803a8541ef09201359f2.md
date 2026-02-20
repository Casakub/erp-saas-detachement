# SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS)

Statut: DRAFT (LOCK REQUIRED)
Portée: substrat d’exécution backend (stack, conventions, outillage, runbooks)
Règle: aucun changement de périmètre métier; les contrats 2.9/2.10/2.11/2.12 restent source de vérité

## 9.0 Statut contractuel d’exécution

- Applique cette section pour transformer les contrats documentaires en exécution backend testable.
- Conserve la hiérarchie documentaire: 2.9 DB, 2.10 Events, 2.11 OpenAPI, 2.12 RBAC priment sur ce document.
- Interdis toute extension fonctionnelle métier dans cette section.
- Distingue explicitement cette SECTION 9 (substrat d’exécution) de la PHASE 9 de la SECTION 8 (no-code).
- Exige un verrouillage explicite des points ouverts avant démarrage de code.

## 9.1 Profil stack backend retenu (LOCKED)

Décision globale verrouillée: `API Node.js TypeScript`.

Profil exécution backend retenu (décision unique):

| Domaine | Décision verrouillée |
| --- | --- |
| Backend API | API Node.js TypeScript |
| Runtime | Node.js 20 LTS |
| Framework API | Routeur HTTP Node.js TypeScript (sans framework additionnel) |
| Base de données | Supabase Postgres |
| Mode accès DB | RLS obligatoire + tenant-scoping strict via `tenant_id` |
| Storage provider | Supabase Storage |
| Jobs/Batches | Dispatcher backend dédié (déclenché par cron sécurisé) |

Règles de verrouillage:

- Une seule piste d’implémentation est autorisée: API Node.js TypeScript.
- Supabase Edge Functions n’est pas retenu pour l’exécution backend V1.1.
- Toute route métier applique JWT + tenant-scoping + RLS sans exception.
- Toute logique critique reste backend (enforcement, gates, décisions métier).

## 9.2 Structure repo & conventions module

Constat actuel: aucun backend exécutable n’existe dans le repo.

Racine backend verrouillée: `backend/`.

Arborescence backend verrouillée:

| Élément | Règle | Statut |
| --- | --- | --- |
| `backend/` | Racine unique du backend | Verrouillé |
| `backend/modules/` | 1 module = 1 dossier `M<number>-<domaine>` | Verrouillé |
| `backend/modules/Mx-<domaine>/api/` | Handlers/routers alignés OpenAPI 2.11 | Verrouillé |
| `backend/modules/Mx-<domaine>/service/` | Règles métier module-scopées | Verrouillé |
| `backend/modules/Mx-<domaine>/data/` | Accès DB + mapping schéma 2.9 | Verrouillé |
| `backend/modules/Mx-<domaine>/events/` | Publication/consommation events 2.10 | Verrouillé |
| `backend/modules/Mx-<domaine>/tests/` | Tests unitaires module | Verrouillé |
| `backend/shared/` | Composants transverses (auth, outbox, audit, rbac) | Verrouillé |
| `backend/migrations/` | Migrations versionnées | Verrouillé |
| `backend/runbooks/` | Procédures d’exploitation | Verrouillé |
| `backend/tests/` | Harness intégration/RBAC/multi-tenant cross-modules | Verrouillé |

Conventions obligatoires:

- Respecte strictement `1 module = 1 dossier`.
- Interdis les imports directs entre modules (hors contrats API/events).
- Limite le code transverse à `backend/shared/`.
- Exige que chaque module publie explicitement ses frontières API/events.

## 9.3 Migrations: outil, format, commandes (LOCKED)

Outil de migration verrouillé:

- Supabase CLI (migrations SQL versionnées), stockées dans `backend/migrations/`.

Format de version verrouillé:

- Format timestamp UTC: `YYYYMMDDHHMMSS`.
- Chaque migration est un fichier SQL versionné généré par Supabase CLI.

Règles de nommage verrouillées:

- Format logique: `<timestamp>__lot<lot>_m<module>_<change_slug>.sql`.
- `change_slug` en `snake_case`, orienté action technique (exemple: `add_invoice_blocked_at`).
- Encodage module pour nom de fichier:
- `M7.T` -> `m7t`
- `M7bis` -> `m7bis`
- autres modules: `m<number>`

Commandes canoniques:

| Besoin | Commande canonique | Statut |
| --- | --- | --- |
| Créer une migration | `supabase migration new lot<lot>_m<module>_<change_slug>` | Verrouillé |
| Appliquer migrations en local | `supabase db reset` | Verrouillé |
| Vérifier la dérive schéma | `supabase db diff` | Verrouillé |
| Rollback contrôlé | `supabase migration new rollback_<target_slug>` puis `supabase db reset` | Verrouillé |
| Vérification CI migrations | `supabase db reset && supabase db diff` (doit sortir sans dérive) | Verrouillé |

Liaison explicite migrations ↔ lots:

- Lot 1: migrations limitées au socle foundation (M1, M8, objets transverses prévus en 2.9 patch).
- Lot 3: migrations limitées aux périmètres M7.T et M7bis.
- Lot 6: migrations limitées au périmètre M10 (finance/billing/payments/commissions).
- Toute migration doit porter son lot/module dans le nom et dans la description PR.

Règles minimales:

- Lier chaque migration à un lot/module.
- Interdire toute modification DB sans migration versionnée.
- Exiger une preuve de compatibilité OpenAPI/Events/RBAC pour toute migration impactante.
- Politique rollback: forward-only (pas de suppression manuelle d’historique), correction via migration compensatrice.

## 9.4 Auth/JWT, tenant-scoping, RBAC, RLS

Contrat existant à respecter:

- Auth Bearer JWT.
- `tenant_id` déduit du token.
- Endpoints métiers tenant-scoped.
- Isolation données via RLS/équivalent.

Claims JWT attendus (LOCKED):

| Claim | Rôle | Statut |
| --- | --- | --- |
| `sub` | Identité acteur (user id) | Verrouillé |
| `tenant_id` | Scope tenant obligatoire | Verrouillé |
| `role_type` | Rôle RBAC contractuel 2.12 | Verrouillé |
| `exp` | Expiration token | Verrouillé |
| `jti` | Traçabilité/idempotence session | Verrouillé |

Valeurs `role_type` autorisées (strict RBAC 2.12):

- `tenant_admin`
- `agency_user`
- `consultant`
- `client_user`
- `worker`
- `system`

Règles de validation JWT:

- Le token est rejeté si un claim requis (`sub`, `tenant_id`, `role_type`, `exp`, `jti`) manque.
- Le token est rejeté si `role_type` est hors liste RBAC 2.12.
- Le token est rejeté si `exp` est expiré.

Ordre middleware requis:

1. Générer/propager `correlation_id` de requête.
2. Valider le Bearer JWT (signature, issuer, audience, expiration).
3. Extraire et valider les claims requis (`sub`, `tenant_id`, `role_type`, `jti`).
4. Fixer le contexte tenant (`tenant_id`) pour toute la requête.
5. Appliquer RBAC explicite (2.12) selon route + méthode.
6. Appliquer contrôle d’accès ressource tenant-scoped (dont limites `client_user`/`worker`).
7. Appliquer règles métier bloquantes (`422 business_rule_failed` + `blocking_reasons` si applicable).
8. Journaliser audit des mutations (incluant `correlation_id`, `tenant_id`, `sub`, `role_type`, `jti`).

## 9.5 Outbox runtime (publisher/dispatcher/consumer)

Objectif: exécuter le contrat outbox 2.10 sans logique métier dans l’orchestration.

Composants:

- Publisher: écrit l’event dans `events_outbox` dans la même transaction que la mutation.
- Dispatcher: lit `pending`, tente l’envoi, met à jour `sent/failed`, `retries`, `last_error`, `sent_at`.
- Consumer: traite idempotent via `event_id`, sans recalcul métier critique.

Conventions d’exécution:

| Sujet | Exigence | Statut |
| --- | --- | --- |
| Retry policy | `max_retries=8` (au-delà: dead-letter logique) | Verrouillé |
| Backoff | exponentiel borné: `30s, 60s, 120s, 240s, 480s, 900s, 1800s, 3600s` | Verrouillé |
| Dispatcher cadence | exécution toutes les `60s` (cron sécurisé backend) | Verrouillé |
| Concurrence | sélection SQL avec `FOR UPDATE SKIP LOCKED`, `ORDER BY created_at ASC`, `LIMIT 100` | Verrouillé |
| Dead-letter | `status='failed' AND retries>=8` + marquage `last_error` préfixé `[DEAD_LETTER]` | Verrouillé |
| Replay | manuel contrôlé, audit obligatoire, jamais déclenché par no-code | Verrouillé |

Règles runtime verrouillées:

- Le dispatcher ne traite que `pending` et `failed` éligibles (hors dead-letter).
- Condition d’éligibilité d’un `failed`: `retries < 8` et délai de backoff écoulé (base `updated_at`).
- Transition d’état autorisée uniquement:
- `pending -> sent`
- `pending -> failed`
- `failed -> sent`
- `failed -> failed` (avec `retries` incrémenté)
- Le no-code consomme les events publiés mais n’écrit jamais dans `events_outbox`.
- Le consumer reste idempotent par `event_id` et n’exécute aucun calcul métier.

## 9.6 Audit logs & observability

Objectif: rendre chaque mutation critique traçable, corrélable, inspectable.

Taxonomie d’actions (format à verrouiller):

- Format cible: `<module>.<entity>.<action>`.
- Exemples de famille: `mission.create`, `mission.status_change`, `timesheet.submit`, `invoice.issue`, `a1.status_update`.
- Format exact verrouillé: `m<module>.<entity>.<verb>`.
- Exemples obligatoires:
- `m7t.timesheet.submit`
- `m7t.timesheet.validate`
- `m10.invoice.issue`
- `m10.payment.record`
- `m8.enforcement.evaluate`
- Convention `correlation_id` verrouillée:
- Header entrant: `X-Correlation-Id`
- Si absent: génération backend d’un UUIDv4
- Propagation obligatoire dans:
- logs applicatifs
- `audit_logs.metadata.correlation_id`
- `events_outbox.metadata.correlation_id` (si présent)
- Règles metadata audit verrouillées:
- JSON plat (pas de structure imbriquée profonde)
- PII-safe (aucune donnée personnelle sensible en clair)
- Jamais de payload complet
- Références par identifiants uniquement (`*_id`)

Champs d’audit minimum:

- `tenant_id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `ip_address`
- `user_agent`
- `metadata`
- `created_at`
- `correlation_id` (ajout conventionnel requis)

Observabilité minimale à documenter:

- Logs applicatifs structurés corrélés par `correlation_id`.
- Erreurs critiques traçables par module.
- Alertes sur échecs répétés dispatcher outbox.
- Alertes sur violations multi-tenant/RBAC.

## 9.7 Harness tests (unit/intégration/RBAC/multi-tenant)

Runner de tests verrouillé:

- Node.js test runner natif (`node:test`) sur artefacts compilés TypeScript.

Structure cible:

- Tests unitaires par module:
- `backend/modules/Mx-<domaine>/tests/unit/*.test.ts`
- Tests d’intégration endpoint par endpoint contractuel:
- `backend/tests/integration/*.test.ts`
- Tests RBAC négatifs et positifs selon 2.12:
- `backend/tests/rbac/*.test.ts`
- Tests multi-tenant avec tenant A vs tenant B (cross-tenant interdit):
- `backend/tests/multi-tenant/*.test.ts`
- Tests outbox (publication, retry, idempotence):
- `backend/tests/outbox/*.test.ts`
- Tests audit (mutation => entrée immuable):
- `backend/tests/audit/*.test.ts`

Critères de couverture minimaux (obligatoires):

- Unit: services/data/events de chaque module livré.
- Intégration: tous les endpoints mutants du lot.
- RBAC: scénarios `403` et `2xx` pour les rôles 2.12 concernés.
- Multi-tenant: preuve explicite qu’un acteur tenant A ne lit/écrit jamais tenant B.
- Outbox: `pending -> sent`, `pending/failed -> failed` avec retries, idempotence consumer.
- Audit: chaque mutation critique génère une entrée immuable corrélée (`correlation_id`).

Pré-requis harness:

| Besoin | Exigence | Statut |
| --- | --- | --- |
| Fixtures multi-tenant | Jeu fixe `tenant_a` / `tenant_b` avec rôles 2.12 + entités minimales par lot | Verrouillé |
| Reset DB test | Reset déterministe via `supabase db reset` avant chaque suite CI | Verrouillé |
| Seeds minimaux | `tenants`, `users`, `user_roles`, `missions`, `timesheets`, `compliance_cases`, `events_outbox`, `audit_logs` | Verrouillé |
| Commande test CI | `supabase db reset && npm --prefix backend run test:ci` | Verrouillé |

Détail fixtures A/B verrouillé:

- `tenant_a` et `tenant_b` distincts, chacun avec `tenant_admin`, `agency_user`, `consultant`, `client_user`, `worker`.
- Données métier minimales du lot créées pour les deux tenants avec ids distincts.
- Un jeu d’objets partagé interdit: toute FK de test reste dans le tenant source.
- `system` est utilisé uniquement pour scénarios techniques (enforcement/job), jamais comme acteur métier.

Contrat d’exécution de `test:ci` (obligatoire):

- Compile TypeScript backend.
- Lance l’ensemble des suites `unit`, `integration`, `rbac`, `multi-tenant`, `outbox`, `audit`.
- Échec immédiat si une suite échoue ou si une fuite cross-tenant est détectée.

## 9.8 Environnements & variables (.env.example canonique)

Matrice environnements:

- `dev`: exécution locale + données de test.
- `staging`: validation pré-prod.
- `prod`: exécution opérationnelle.

Fichier canonique:

- Emplacement: `<backend-root>/.env.example`.
- Valeurs réelles: jamais commitées.

Variables verrouillées (noms exacts):

| Domaine | Variables attendues | Statut |
| --- | --- | --- |
| Runtime | `NODE_ENV`, `PORT`, `LOG_LEVEL` | Verrouillé |
| Database | `DATABASE_URL`, `DB_SCHEMA`, `DB_RLS_ENFORCED` | Verrouillé |
| Auth | `AUTH_JWKS_URL`, `AUTH_JWT_ISSUER`, `AUTH_JWT_AUDIENCE`, `AUTH_JWT_CLOCK_SKEW_SECONDS` | Verrouillé |
| Storage | `STORAGE_BUCKET`, `STORAGE_SIGNED_URL_TTL_SECONDS` | Verrouillé |
| Outbox | `OUTBOX_DISPATCH_INTERVAL_SECONDS`, `OUTBOX_BATCH_LIMIT`, `OUTBOX_MAX_RETRIES` | Verrouillé |
| Observabilité | `CORRELATION_ID_HEADER`, `LOG_FORMAT` | Verrouillé |
| Intégrations no-code | `NOCODE_WEBHOOK_SIGNING_SECRET` | Verrouillé |

Spécification auth verrouillée:

- `AUTH_JWKS_URL`: endpoint JWKS de validation de signature JWT.
- `AUTH_JWT_ISSUER`: valeur `iss` attendue.
- `AUTH_JWT_AUDIENCE`: valeur `aud` attendue.
- `AUTH_JWT_CLOCK_SKEW_SECONDS`: tolérance max d’horloge pour validation temporelle.

Contraintes de valeurs non secrètes (LOCKED):

- `DB_RLS_ENFORCED` doit rester `true` dans `dev`, `staging`, `prod`.
- `CORRELATION_ID_HEADER` doit être `X-Correlation-Id` (aligné 9.6).
- `LOG_FORMAT` doit être `json`.
- `OUTBOX_DISPATCH_INTERVAL_SECONDS`, `OUTBOX_BATCH_LIMIT`, `OUTBOX_MAX_RETRIES` doivent rester alignés sur 9.5.

### `.env.example — SCHEMA CANONIQUE`

- `NODE_ENV=<dev|staging|prod>`
- `PORT=<backend_port>`
- `LOG_LEVEL=<debug|info|warn|error>`
- `DATABASE_URL=<postgres_connection_url>`
- `DB_SCHEMA=<db_schema_name>`
- `DB_RLS_ENFORCED=<true|false>`
- `AUTH_JWKS_URL=<jwks_url>`
- `AUTH_JWT_ISSUER=<jwt_issuer>`
- `AUTH_JWT_AUDIENCE=<jwt_audience>`
- `AUTH_JWT_CLOCK_SKEW_SECONDS=<clock_skew_seconds>`
- `STORAGE_BUCKET=<storage_bucket_name>`
- `STORAGE_SIGNED_URL_TTL_SECONDS=<signed_url_ttl_seconds>`
- `OUTBOX_DISPATCH_INTERVAL_SECONDS=<dispatch_interval_seconds>`
- `OUTBOX_BATCH_LIMIT=<batch_limit>`
- `OUTBOX_MAX_RETRIES=<max_retries>`
- `CORRELATION_ID_HEADER=<correlation_header_name>`
- `LOG_FORMAT=<json|text>`
- `NOCODE_WEBHOOK_SIGNING_SECRET=<nocode_webhook_signing_secret>`

## 9.9 CI backend & quality gates

Constat actuel: CI active uniquement pour contrôle documentaire.

Scripts backend attendus (obligatoires):

- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`

Pipeline backend verrouillé (exécutable):

| Gate | Commande canonique | Critère minimal | Statut |
| --- | --- | --- | --- |
| Install deps | `npm --prefix backend ci` | dépendances installées sans erreur | Verrouillé |
| Lint/format | `npm --prefix backend run lint` | zéro erreur bloquante | Verrouillé |
| Typecheck | `npm --prefix backend run typecheck` | zéro erreur bloquante | Verrouillé |
| DB reset | `supabase db reset` | reset DB déterministe réussi | Verrouillé |
| Tests | `npm --prefix backend run test:ci` | suites unit/intégration/RBAC/multi-tenant/outbox/audit au vert | Verrouillé |
| Migrations drift check | `supabase db diff` | aucune dérive schéma non versionnée | Verrouillé |
| doc_check | `./scripts/doc_check.sh` | conformité documentaire au vert | Verrouillé |

Règle d’acceptation:

- Interdire merge backend si un gate critique échoue.
- Exécution en fail-fast: arrêt immédiat dès le premier gate en échec.

## 9.10 Runbooks (bootstrap local, rollback migration, replay outbox)

Runbooks verrouillés:

- `backend/runbooks/bootstrap_local.md`
- `backend/runbooks/rollback_migrations.md`
- Replay outbox: verrouillé dans cette section (bloc ci-dessous inchangé).

Runbook bootstrap local (verrouillé):

- Pré-requis machine:
- `node --version` (Node.js 20 requis)
- `npm --version`
- `supabase --version`
- Initialisation environnement:
- `test -f backend/.env || cp backend/.env.example backend/.env`
- Réinitialisation DB locale:
- `supabase db reset`
- Installation dépendances backend:
- `npm --prefix backend install`
- Démarrage backend:
- `npm --prefix backend run dev` ou `npm --prefix backend run start`
- Healthcheck minimal:
- `curl -fsS "http://127.0.0.1:${PORT:-3000}/health"`

Runbook rollback migration (verrouillé):

- Politique: forward-only obligatoire (aucun rollback destructif d’historique).
- Créer une migration compensatrice:
- `supabase migration new rollback_<target_slug>`
- Appliquer la migration compensatrice en local:
- `supabase db reset`
- Vérifier absence de dérive:
- `supabase db diff`
- Vérifier non-régression backend:
- `npm --prefix backend run test:ci`
- Traçabilité décisionnelle obligatoire (ticket + migration compensatrice liée).

Runbook replay outbox (exécutable, verrouillé):

Pré-conditions:

- Acteur autorisé: `tenant_admin` ou `system`.
- Ticket d’intervention obligatoire: `INC-xxxx`.
- Périmètre borné: un tenant et une liste explicite d’`event_id`.

Étapes:

1. Extraire les candidats dead-letter du tenant:
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "COPY (SELECT id, tenant_id, event_type, entity_type, entity_id, status, retries, last_error, created_at, updated_at FROM events_outbox WHERE tenant_id = '<tenant_uuid>' AND status = 'failed' AND retries >= 8 ORDER BY created_at ASC) TO STDOUT WITH CSV HEADER" > outbox_deadletter_INC-xxxx.csv`
2. Valider manuellement la liste des `event_id` à rejouer (pas de sélection large).
3. Reprogrammer les events sélectionnés pour un rejeu unique:
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "UPDATE events_outbox SET status='pending', retries=0, last_error=NULL, sent_at=NULL, updated_at=now() WHERE tenant_id='<tenant_uuid>' AND id IN ('<event_uuid_1>','<event_uuid_2>') AND status='failed' AND retries>=8;"`
4. Vérifier immédiatement l’état post-replay:
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT id, status, retries, last_error, sent_at FROM events_outbox WHERE tenant_id='<tenant_uuid>' AND id IN ('<event_uuid_1>','<event_uuid_2>') ORDER BY id;"`
5. Contrôler le résultat après passage du dispatcher:
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT status, count(*) FROM events_outbox WHERE tenant_id='<tenant_uuid>' AND id IN ('<event_uuid_1>','<event_uuid_2>') GROUP BY status;"`
6. Si un event échoue encore après rejeu:
- Le marquer explicitement dead-letter et stopper les tentatives automatiques.
- `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "UPDATE events_outbox SET last_error='[DEAD_LETTER][REPLAY_FAILED] ' || coalesce(last_error,''), updated_at=now() WHERE tenant_id='<tenant_uuid>' AND id IN ('<event_uuid_1>','<event_uuid_2>') AND status='failed';"`

Règles d’exploitation:

- Interdiction de replay global sans filtre tenant + ids.
- Interdiction de modifier le payload lors d’un replay.
- Toute opération de replay doit générer une entrée d’audit et une trace dans le journal d’intervention runbook.

## 9.11 Ready-to-code gates par lot

### Lot 1 — Foundation (M1 + audit + outbox + tenant settings)

- [ ] Profil stack verrouillé (9.1).
- [ ] Racine backend et structure modules créées (9.2).
- [ ] Outil migrations verrouillé + première migration exécutable (9.3).
- [ ] Contrat auth/JWT et ordre middleware verrouillés (9.4).
- [ ] Dispatcher outbox défini et testable (9.5).
- [ ] Harness tests de base actif (9.7).
- [ ] Variables environnement minimales documentées (9.8).

### Lot 3 — Timesheets & Mobile (M7.T + M7bis)

- [ ] Garde-fous RBAC/multi-tenant validés sur endpoints timesheets/mobile.
- [ ] Convention événements alignée strictement 2.10 (aucun event non catalogué).
- [ ] Tests d’intégration des transitions timesheet validés.
- [ ] Vérification `422 + blocking_reasons` sur gates enforcement.
- [ ] Traçabilité audit complète sur mutations critiques.

### Lot 6 — Finance Billing (M10)

- [ ] Prérequis M8 enforcement disponibles en lecture fiable.
- [ ] Gating `can_issue_invoice` testé en blocage et happy path.
- [ ] Tests idempotence des créations sensibles documentés.
- [ ] Events M10 publiés via outbox sur toutes mutations.
- [ ] Contrôles multi-tenant/RBAC validés sur endpoints finance.

## 9.12 Anti-dérive doc ↔ exécution (checks automatiques futurs)

Objectif: prévenir toute divergence entre contrats documentaires et implémentation backend.

Périmètre de checks automatiques verrouillé (sans modifier `doc_check.sh`):

- Vérifier qu’il n’existe aucun marqueur de verrouillage non résolu dans SECTION 9.
- Vérifier la présence des dossiers: `backend/`, `backend/modules/`, `backend/migrations/`, `backend/runbooks/`.
- Vérifier la présence des scripts npm backend requis: `lint`, `typecheck`, `test:ci`.
- Vérifier la cohérence events implémentables -> catalogue 2.10:
- sources implémentables: SECTION 2, SECTION 6 (checklists lots), annexe 2.11.A.
- source canonique: 2.10 EVENTS.
- Vérifier le contrat d’exécution du script: `exit 0` si conforme, `exit 1` sinon.

Artefacts verrouillés:

- Script dédié de vérification substrat: `scripts/substrate_check.sh`.
- Mapping doc -> implémentation utilisé par le script:
- `ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 30a688d6a596803a8541ef09201359f2.md`
- `ERP Détachement europe/SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV) 308688d6a59680ebb64fe4ddb4223b41.md`
- `ERP Détachement europe/SECTION 6 — Checklist Produit V1 (Globale)/ 308688d6a59680ebb64fe4ddb4223b41`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2.11.A — OPENAPI EXECUTION SCHEMAS (ANNEXE) 30b688d6a59680889d57de90b0df5efb.md`
- `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2.10 EVENTS MÉTIER V1 (Event-driven, Outbox, IA-fr 30a688d6a5968047ad41e7305d7d9b39.md`
- Intégration CI substrate check: `.github/workflows/substrate-check.yml`.

---

## Changelog doc

- 2026-02-17: Création SECTION 9 (substrat exécution), sans changement métier.
- 2026-02-18: LOCK stack + repo structure (no métier change).
- 2026-02-18: LOCK migrations (outil, versioning, commandes, lot linkage), sans changement métier.
- 2026-02-18: LOCK auth/JWT tenant-scoped (claims, middleware, env auth), sans changement métier.
- 2026-02-18: LOCK outbox runtime + runbook replay contrôlé, sans changement métier.
- 2026-02-18: LOCK test harness (runner, fixtures A/B, reset DB, CI command), sans changement métier.
- 2026-02-18: LOCK audit taxonomy + correlation_id (no métier change).
- 2026-02-18: LOCK env vars canoniques (section 9.8, hors secrets), sans changement métier.
- 2026-02-18: LOCK CI backend gates (section 9.9) + ajout workflow backend-ci minimal, sans changement métier.
- 2026-02-18: LOCK runbooks 9.10 (bootstrap local + rollback migrations), sans changement métier.
- 2026-02-18: LOCK anti-dérive 9.12 + script substrate_check + intégration validation AGENTS/CI, sans changement métier.
