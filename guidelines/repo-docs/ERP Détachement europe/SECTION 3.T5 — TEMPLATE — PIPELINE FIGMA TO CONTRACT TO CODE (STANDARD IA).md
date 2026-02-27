# SECTION 3.T5 — TEMPLATE — PIPELINE FIGMA TO CONTRACT TO CODE (STANDARD IA)

- Statut: DRAFT
- Portée: pipeline opérationnel pour transformer un écran Figma validé en livraison backend/frontend testée.
- Règles:
- Contract-first obligatoire.
- Une IA = un module = un périmètre strict.
- Backend décide, UI affiche, no-code orchestre.
- Aucune modification des contrats LOCKED sans patch documentaire explicite.

## Purpose

- Standardiser l'enchaînement Design -> Contrats -> Code -> Tests -> Validation humaine.
- Réduire les dérives entre écrans Figma, API, events, RBAC et DB.

## Sources obligatoires

- `SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN)`
- `SECTION 2 — PROMPTS IA BACKEND (PAR MODULE) (DEV)`
- `SECTION 4 — AI CONTRIBUTION RULES (OFFICIEL)`
- `SECTION 5 — DEFINITION OF DONE GLOBAL`
- `SECTION 8 — PLAN D'EXÉCUTION`
- `SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS)`
- Contrats LOCKED: `2.9 DB`, `2.10 Events`, `2.11 OpenAPI`, `2.12 RBAC`

## Pré-requis avant démarrage

- [ ] PHASE 1 design engagée selon l'ordre imposé de `SECTION 8`.
- [ ] Design system créé et utilisé par tous les écrans.
- [ ] États `NORMAL / WARNING / BLOCKED` visibles sur chaque écran critique.
- [ ] Aucune logique métier encodée dans Figma.
- [ ] Lot cible explicitement choisi (`Lot 1` à `Lot 8`) et lot précédent validé.

## Pipeline exécutable (G0 -> G6)

| Gate | Entrées minimales | Sorties minimales | Critère GO |
| --- | --- | --- | --- |
| G0 — Design freeze écran | URL Figma, écran nommé, états complets | ticket écran prêt | owner valide que l'écran est figé |
| G1 — Mapping écran -> contrats | écran + rôles + flux | mapping DB/API/Events/RBAC + tests cibles | aucun champ UI non mappé |
| G2 — Contrats module | mapping G1 + docs LOCKED | patch docs (si besoin), impact cross-doc aligné | OpenAPI/Events/DB/RBAC synchrones |
| G3 — Task pack code | contrats validés | tâches implémentation + ordre + DoD module | périmètre module verrouillé |
| G4 — Implémentation | task pack + substrat backend | code + migrations + tests | tests unit/intégration/RBAC/multi-tenant passent |
| G5 — Validation E2E lot | modules du lot | preuves E2E + audit logs + exports requis | checklist lot + DoD globale validées |
| G6 — Approval humain | résultats QA + preuves | statut `Approved` Notion + merge | validation explicite owner |

## Artefact obligatoire par écran Figma (Template)

| Champ | Valeur à renseigner |
| --- | --- |
| `screen_id` | `<lot>-<module>-<slug>` |
| `figma_url` | `<url frame/node>` |
| `persona` | `tenant_admin / agency_user / consultant / client_user / worker` |
| `states` | `NORMAL/WARNING/BLOCKED` |
| `api_reads` | `GET ...` |
| `api_writes` | `POST/PATCH ...` |
| `events_emitted` | `NomEvent (2.10)` |
| `rbac_rules` | `rôle -> action` |
| `db_entities` | `tables/colonnes` |
| `given_when_then_refs` | `tests acceptation` |
| `lot_module_scope` | `M1/M2/...` |
| `owner` | `IA / humain` |

## Ticket type “Design -> Contract”

- `Titre`: `[LOT X][Mx] Screen to Contract - <screen_id>`
- `Entrées`: URL Figma, états, persona, flux action.
- `Checklist`:
- [ ] Champs UI reliés à des champs API documentés.
- [ ] Aucune logique d'affichage backend.
- [ ] Aucune décision métier côté no-code.
- [ ] Erreurs API standard (`400/401/403/404/409/422/429/500`) prévues.
- [ ] Cas `blocking_reasons` défini pour les actions critiques.
- `Sortie attendue`: mini-contrat validé + tâches dev prêtes.

## Ticket type “Contract -> Code”

- `Titre`: `[LOT X][Mx] Contract to Code - <module_scope>`
- `Entrées`: OpenAPI + Events + DB + RBAC validés.
- `Checklist`:
- [ ] Migrations versionnées et nommées selon `SECTION 9`.
- [ ] Publisher outbox sur endpoints mutants.
- [ ] Audit logs sur actions critiques.
- [ ] Tests unitaires.
- [ ] Tests intégration endpoint.
- [ ] Tests RBAC positifs/négatifs.
- [ ] Tests multi-tenant anti-fuite.
- `Sortie attendue`: PR module + résultats tests + note d'impact.

## Runbook recommandé — Tous les lots (1 -> 8)

Règle de séquence:
1. `Lot N` ne démarre que si `Lot N-1` est validé (`Approved`).
2. Chaque lot suit les gates `G0 -> G6` sans saut.
3. Les exclusions V1/V2 sont pilotées par `SECTION 10.F` (aucune anticipation V2 en code V1).

## Lot 1 — Foundation (M1 + M9 base)

Ordre:
1. M1 Auth/Tenant/RBAC/Audit/Outbox.
2. M9 Vault base sécurité.

Écrans Figma minimum à figer avant code:
1. Auth & onboarding agence.
2. Navigation shell desktop.
3. Paramètres rôles et permissions.
4. Coffre-fort vues liste/détail/upload.

Contrats minimum à verrouiller:
1. Claims JWT requis et ordre middleware.
2. Matrice RBAC active par route.
3. Outbox runtime (`pending/sent/failed`, retries, dead-letter logique).
4. Audit log taxonomie action.

Gate de sortie:
1. Isolation tenant testée.
2. RBAC testé par rôle.
3. Outbox opérationnelle.
4. Audit immutable vérifié.
5. Vault chiffré + hashing + access logs vérifiés.

Référence checklist:
1. `SECTION 6.1 — CHECKLIST LOT 1 IA (FOUNDATION)`.

## Lot 2 — Core métier (M7 + M8 + M9 extension)

Ordre:
1. M7 Missions.
2. M8 Compliance Case base + enforcement flags.
3. M9 extension liaison mission/worker documents.

Écrans Figma minimum à figer avant code:
1. Missions liste + création + fiche mission.
2. Mission > Conformité (score, raisons, blocages).
3. Conformité globale (dash + tables risques).
4. Clients/worker documents liés mission.

Contrats minimum à verrouiller:
1. Création automatique `compliance_case` à la création mission.
2. Gates `can_activate_mission`, `can_validate_timesheets`, `can_issue_invoice`.
3. Events M7/M8 publiés via outbox.
4. Erreurs `422 business_rule_failed` + `blocking_reasons`.

Gate de sortie:
1. Mission -> compliance_case auto fonctionnel.
2. Enforcement flags évalués et traçables.
3. Blocage activation mission effectif.
4. Tests RBAC + multi-tenant + audit passants.

Référence checklist:
1. `SECTION 6.2 — CHECKLIST LOT 2 IA`.
2. `SECTION 6.2.A — CHECKLIST INTER-MODULES`.

## Lot 3 — Timesheets & Mobile worker (M7.T + M7bis)

Pré-requis:
1. M7 Missions opérationnel.
2. M9 Vault opérationnel pour documents worker.

Ordre:
1. M7.T Timesheets.
2. M7bis Worker App API.

Écrans Figma minimum à figer avant code:
1. Timesheets desktop agence (liste + détail + validation/rejet).
2. Mobile saisie hebdomadaire + soumission.
3. Mobile check-in/check-out.
4. Mobile notifications + upload documents.

Contrats minimum à verrouiller:
1. Double validation timesheet (client/agence) et statuts.
2. Event `WorkerCheckEventRecorded` + events timesheets.
3. Endpoints mobile payload réduits et online-only V1 (offline interdit en V1).
4. Blocage soumission/validation via enforcement backend.

Gate de sortie:
1. Saisie mobile -> validation desktop -> statut billing cohérent.
2. Check-in/check-out horodaté serveur.
3. Aucune logique métier critique côté mobile.
4. Tests intégration, RBAC, multi-tenant passants.

Référence checklist:
1. `SECTION 6.3 — CHECKLIST LOT 3 IA (TIMESHEETS & MOBILE)`.

## Lot 4 — CRM, Clients/Vigilance, RFP (M2 + M3 + M4)

Ordre:
1. M3 Clients + vigilance.
2. M2 CRM leads/pipeline.
3. M4 RFP interne/public.

Écrans Figma minimum à figer avant code:
1. CRM pipeline + fiche lead.
2. Clients liste + fiche + vigilance.
3. Company Card enrichissement (M3).
4. RFP création/comparateur/allocation.

Contrats minimum à verrouiller:
1. Mapping DB/API/UI de chaque écran.
2. Events strictement issus de 2.10 (ou patch validé).
3. Règles RBAC M2/M3/M4 explicites.
4. Batch expirations et logs contact anti-désintermédiation (12 mois, insert-only).
5. RFP unifiée `private|public` et portail client optionnel alignés CDC.

Gate de sortie:
1. Lead -> Client fonctionnel.
2. Vigilance expirations + alertes fonctionnelles.
3. RFP private/public fonctionnelle.
4. Contact logs 12 mois insert-only.
5. Tests RBAC + multi-tenant passants.

Référence checklist:
1. `SECTION 6.5 — CHECKLIST LOT 4 IA`.

## Lot 5 — ATS & Workers (M5 + M6)

Ordre:
1. M6 Workers/dossiers (base).
2. M5 ATS (jobs, candidatures, scoring assisté).

Écrans Figma minimum à figer avant code:
1. ATS job offers + candidatures + fiche candidat.
2. Worker dossier desktop (documents, expirations, missions).
3. États scoring IA explicables (non décisionnels).

Contrats minimum à verrouiller:
1. Pipeline ATS de publication à conversion worker.
2. Limites IA assistée (pas de décision automatique).
3. Events M5/M6 conformes au catalogue.
4. Audit trail de conversion et changements de statut.
5. `worker_skills` V1 + `ai_score` immuable après scoring.

Gate de sortie:
1. Job -> candidature -> conversion worker fonctionnel.
2. Scoring IA explicable et non bloquant sans validation humaine.
3. Dossier worker complet et audité.
4. Consultant interdit sur shortlist (403) validé.
5. Tests RBAC + multi-tenant passants.

Référence checklist:
1. `SECTION 6.6 — CHECKLIST LOT 5 IA`.

## Lot 6 — Finance/Billing (M10)

Ordre:
1. Devis.
2. Factures.
3. Paiements.
4. Commissions.

Écrans Figma minimum à figer avant code:
1. Finance devis/factures/commissions.
2. États facture `blocked/overdue/paid`.
3. Actions relance et exports comptables.

Contrats minimum à verrouiller:
1. Gates M10 respectant enforcement M8 (`can_issue_invoice`).
2. Events `InvoiceIssued`, `InvoiceBlocked`, `PaymentRecorded`.
3. Facturation from-timesheet active en V1 (`POST /v1/invoices:from-timesheet`).
4. Idempotence sur créations sensibles.
5. Lien strict mission -> timesheet -> facturation.

Gate de sortie:
1. Facturation impossible si mission non conforme.
2. Cycle devis -> facture -> paiement traçable.
3. Exports comptables V1 opérationnels.
4. Tests intégration finance + RBAC passants.

Référence checklist:
1. `SECTION 6.4 — CHECKLIST LOT 6 IA`.

## Lot 7 — Compliance engine extension rémunération (M8 extension)

Ordre:
1. Salary/remuneration engine.
2. Snapshots immuables.
3. Calcul score + enforcement avancé.

Écrans Figma minimum à figer avant code:
1. Mission conformité détaillée (calcul + explications).
2. Conformité globale avec vues durées/A1/docs.
3. États warning/blocked explicites.

Contrats minimum à verrouiller:
1. Algorithme 5 étapes (grille -> admissible -> comparaison -> snapshot -> enforcement).
2. Règles rémunération versionnées + seed IDCC V1 (BTP, Métallurgie, Transport).
3. Snapshot immuable avant décisions.
4. Alertes durée cumulée 300j/365j.
5. Raisons lisibles et auditables de chaque blocage.
6. Interdiction toute logique légale no-code.

Gate de sortie:
1. Chaîne rémunération -> snapshot -> score -> enforcement validée E2E.
2. Raisons inspecteur lisibles pour chaque décision.
3. Tests renforcés modules critiques passants.

Référence checklist:
1. `SECTION 6.7 — CHECKLIST LOT 7 IA`.

## Lot 7 bis — Égalité de traitement (M8.3 extension)

Positionnement:
1. Extension V1 assistée à exécuter après Lot 7.
2. Couvre Directive 2018/957/UE en mode check manuel + snapshot immuable.

Ordre:
1. Migration `equal_treatment_checks` (insert-only).
2. Endpoints `POST/GET /v1/compliance-cases/{id}/equal-treatment-check`.
3. Algorithme V1 règles-based (3 étapes) avec lecture `worker_remuneration_snapshot`.
4. Events outbox `EqualTreatmentCheckCreated` + `EqualTreatmentViolationDetected`.

Contrats minimum à verrouiller:
1. Aucun blocage enforcement automatique en V1 (alerte uniquement).
2. Cas `NO_REMUNERATION_SNAPSHOT` géré en warning non bloquant.
3. RBAC: `tenant_admin`/`agency_user` write, `worker` read own-only.

Gate de sortie:
1. Snapshot égalité de traitement immuable et auditable.
2. Violations détectées et tracées par event.
3. Tests unit/intégration/RBAC/multi-tenant passants.

Référence checklist:
1. `SECTION 6.9 — CHECKLIST LOT 7 BIS IA (ÉGALITÉ DE TRAITEMENT)`.

## Lot 8 — Marketplace + Risk/Certification (M11 + M12)

Ordre:
1. M12 Risk score + certification + gating accès.
2. M11 Marketplace catalogue + RFP + matching assisté.

Écrans Figma minimum à figer avant code:
1. Marketplace catalogue agences + ranking.
2. RFP client + matching + shortlist.
3. Vues certification/risk status et accès marketplace.

Contrats minimum à verrouiller:
1. Conditions d'accès marketplace basées sur certification/gating.
2. Ranking transparent et explicable.
3. Allocation automatique strictement non activée en V1.
4. Logs décisionnels complets.

Gate de sortie:
1. Accès marketplace conditionné et vérifiable.
2. Matching assisté opérationnel avec explications.
3. Risk/certification traçables et auditables.
4. Tests RBAC + multi-tenant + non-régression passants.

Référence checklist:
1. `SECTION 6.8 — CHECKLIST LOT 8 IA`.

## Phase 9 — Orchestration no-code (post-lots)

Règles obligatoires:
1. Le no-code orchestre uniquement (emails, PDF, notifications, relances, exports).
2. Aucune décision métier, aucun calcul conformité, aucun enforcement dans no-code.
3. Déclenchement uniquement par events backend ou requête backend authentifiée et traçable.
4. Toute action no-code doit être auditée (tenant, entité, timestamp, correlation).

Gate de sortie:
1. Scénarios no-code branchés sur events backend validés.
2. Logs no-code auditables.
3. Aucun contournement des règles backend détecté.

Référence:
1. `SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE)`.

## Contrôle de cohérence (avant merge)

- [ ] OpenAPI <-> RBAC alignés.
- [ ] OpenAPI mutants <-> Events outbox alignés.
- [ ] Events <-> producer module alignés.
- [ ] DB supporte les payloads exposés.
- [ ] Checklist lot + DoD globale complètes.
- [ ] Impact/changelog mis à jour.

## Commandes utiles (référence)

- `bash scripts/run_doc_check.sh`
- `bash scripts/substrate_check.sh`
- `bash scripts/notion_section10_check.sh`
- `bash scripts/notion_lots_modules_check.sh`
- `cd backend && npm run lint && npm run typecheck && npm run test:ci`

## Non-goals / Out of scope

- Implémenter de la logique métier dans Figma ou no-code.
- Introduire des endpoints/events/champs hors contrats validés.
- Mélanger plusieurs modules dans un même ticket IA.

## Mini-changelog

- 2026-02-23: création du template pipeline exécutable Figma -> Contrats -> Code (Lot 1 et Lot 4).
- 2026-02-23: extension du runbook à la couverture complète Lots 1 -> 8.
- 2026-02-23: alignement renforcé avec `SECTION 6/7/8/10.F` (Lot 7 bis, décisions V1, phase 9 no-code).
