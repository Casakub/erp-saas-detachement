# 6.2.A — CHECKLIST DE VALIDATION INTER-MODULES (LOT 2) (1)

**Statut** : OBLIGATOIRE
**Objectif** : garantir que M7, M8 et M9 fonctionnent ensemble sans fuite de responsabilité.

---

## A. Contrats & frontières (BLOQUANT)

- [ ]  Aucun module ne modifie une table hors de son périmètre autorisé
- [ ]  M7 ne contient **aucune** logique conformité
- [ ]  M9 ne contient **aucune** logique métier
- [ ]  M8 est **le seul** module à décider :
    - enforcement flags
    - blocking_reasons
- [ ]  Aucun calcul métier critique dans le no-code

---

## B. Base de données (BLOQUANT)

### Missions (M7)

- [ ]  `missions` créées sans champ conformité calculé
- [ ]  Aucun champ “is_compliant” dans `missions`
- [ ]  `missions.status` ne change jamais sans passer par enforcement

### Compliance (M8)

- [ ]  1 mission = 1 compliance_case (unicité vérifiée)
- [ ]  `compliance_requirements` liés uniquement à `compliance_case_id`
- [ ]  `mission_enforcement_flags` est la **seule** source de vérité des blocages

### Vault (M9)

- [ ]  `files` ne contient aucune référence métier directe
- [ ]  Toutes les relations passent par `file_links`
- [ ]  `file_access_logs` est IMMUTABLE

---

## C. Events (BLOQUANT)

### Publication

- [ ]  `MissionCreated` publié **uniquement** par M7
- [ ]  `ComplianceCaseCreated` publié **uniquement** par M8
- [ ]  `MissionEnforcementEvaluated` publié **uniquement** par M8
- [ ]  `FileUploaded` publié **uniquement** par M9

### Consommation

- [ ]  M7 consomme enforcement **en lecture seule**
- [ ]  Aucun module ne recalcule enforcement hors M8
- [ ]  Tous les events respectent l’envelope 2.10.2.2

---

## D. OpenAPI & RBAC (BLOQUANT)

- [ ]  Tous les endpoints implémentés existent dans 2.11
- [ ]  Aucun endpoint “inventé”
- [ ]  RBAC 2.12 respecté sur chaque endpoint
- [ ]  `enforcement:evaluate` accessible uniquement à `tenant_admin | system`

---

## E. Parcours fonctionnels (OBLIGATOIRE)

### Happy path

- [ ]  Création mission → compliance_case auto créée
- [ ]  Requirements initialisés
- [ ]  A1 créé puis passé à `issued`
- [ ]  Enforcement = OK
- [ ]  Mission activable

### Blocked path

- [ ]  A1 manquant → enforcement bloque activation
- [ ]  PATCH mission status → 422 + blocking_reasons lisibles

---

## F. Audit & Traçabilité (BLOQUANT)

- [ ]  Toute mutation métier = 1 audit_log
- [ ]  Aucune suppression hard de :
    - compliance_case
    - requirements
    - files
- [ ]  Tous les événements critiques sont horodatés

---

## G. Tests (BLOQUANT)

- [ ]  Tests unitaires par module
- [ ]  Tests d’intégration inter-modules
- [ ]  Test cross-tenant (403/404)
- [ ]  Test RBAC négatif (accès interdit)

---

## H. Verdict final

Le Lot 2 est validé **uniquement si tous les points ci-dessus sont cochés**

Sinon : ❌ **MERGE REFUSÉ**

---

FIN — CHECKLIST INTER-MODULES