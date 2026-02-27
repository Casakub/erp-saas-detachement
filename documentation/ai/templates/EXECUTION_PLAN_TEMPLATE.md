# Plan d'exécution

## Étapes

1. Préflight périmètre
- Vérifier lot/module/scope.
- Vérifier absence de conflit documentaire.

2. Mise à jour data layer
- Ajouter/adapter migration dans `backend/migrations/`.
- Vérifier conventions de nommage.

3. Implémentation module
- Code API dans `backend/modules/Mx-<domaine>/api/`.
- Code service dans `backend/modules/Mx-<domaine>/service/`.
- Code data dans `backend/modules/Mx-<domaine>/data/`.
- Publication events dans `backend/modules/Mx-<domaine>/events/`.

4. Sécurité et conformité
- RBAC explicite.
- Tenant-scoping/RLS.
- Audit logs mutations.

5. Tests
- Unit.
- Integration.
- RBAC.
- Multi-tenant.
- Outbox.
- Audit.

6. Validation finale
- Exécuter checks scripts.
- Produire Patch Pack.

## Fichiers impactés prévus

- `backend/modules/...`
- `backend/shared/...` si nécessaire
- `backend/migrations/...`
- `backend/tests/...`
- docs contractuelles impactées si et seulement si synchronisation requise
