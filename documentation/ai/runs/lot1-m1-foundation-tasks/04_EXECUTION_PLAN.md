# Plan d'execution — Lot 1 / M1 Foundation (Tasks)

## Etapes

1. Preflight scope
- Verifier lot/module/scope contre 2.9/2.10/2.11/2.12.
- Verifier absence de conflit documentaire.

2. Data layer
- Creer ou ajuster migration SQL dans `backend/migrations/` si ecart schema `tasks`.
- Respecter format de nommage `YYYYMMDDHHMMSS__lot1_m1_<slug>.sql`.

3. Implementation module
- Implementer handlers API tasks dans `backend/modules/M1-<domaine>/api/`.
- Implementer logique service dans `backend/modules/M1-<domaine>/service/`.
- Implementer acces data dans `backend/modules/M1-<domaine>/data/`.
- Implementer publication events dans `backend/modules/M1-<domaine>/events/`.

4. Securite et conformite
- Appliquer middleware JWT et RBAC explicite.
- Appliquer tenant-scoping strict.
- Journaliser audit sur mutations.

5. Tests
- Unit: validations et transitions.
- Integration: create/status/list.
- RBAC: `2xx` roles autorises, `403` roles interdits.
- Multi-tenant: tenant A ne lit pas tenant B.
- Outbox: event present sur mutation.
- Audit: entree creee sur mutation.

6. Validation
- Executer:
- `bash scripts/run_doc_check.sh`
- `bash scripts/substrate_check.sh`
- `bash scripts/notion_section10_check.sh`
- `bash scripts/notion_lots_modules_check.sh`
- Produire `Patch Pack`.

## File change budget applique

- Autorise:
- `backend/modules/**`
- `backend/shared/**`
- `backend/migrations/**`
- `backend/tests/**`
- Interdit sans arbitrage:
- scripts/workflows/structure racine/docs LOCKED hors impact strict
