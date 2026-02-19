# SECTION 10.D — SECURITY BASELINE (HASHING, LOGS, ENCRYPTION, RETENTION, KEY ROTATION, INCIDENT, PII)

- Statut: DRAFT
- Portée: consolider les principes sécurité déjà explicités dans les documents contractuels.
- Règles:
- Baseline documentaire uniquement.
- Aucun contrôle nouveau, aucune politique technique ajoutée.

## Références sources (justification d'existence)

- SOCLE point 10.D: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:561`
- Schéma DB (audit, files, logs): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md:97`
- OpenAPI conventions tenant-scoped/errors: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 11 — OPENAPI V1 (PARCOURS MVP) — 1 → 3 → 2 308688d6a596801dad76e1c4a1a96c02.md:12`
- RBAC principes de sécurité: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 12 — RBAC & PERMISSIONS (MATRIX) — V1 308688d6a596802d8e81c1623900db41.md:30`
- Section 9 (substrate sécurité): `ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 309688d6a59680f9b1a2c3d4e5f60789.md:27`
- Alias utilisés dans les sections: `SOCLE`, `DB`, `OPENAPI`, `RBAC`, `SECTION9` pointent respectivement vers les 5 chemins ci-dessus.

## Data protection

- Isolation multi-tenant obligatoire: `tenant_id` sur toutes les tables + RLS (`DB:29`, `DB:31`).
- Endpoints métiers tenant-scoped via JWT (`OPENAPI:13`, `OPENAPI:14`).
- Aucune fuite cross-tenant admise (`SOCLE:61`, `SECTION9:35`).

## Encryption

- Coffre de fichiers en stockage sécurisé avec indicateur `encrypted` par fichier (`DB:617`).
- Le SOCLE indique le stockage sécurisé et le chiffrement côté Vault (`SOCLE:236`).
- Les algorithmes, modes et paramètres cryptographiques ne sont pas définis dans 2.9/2.10/2.11/2.12/9.

## Hashing

- Hashing documentaire requis côté Vault (`SOCLE:237`).
- Champ `sha256_hash` défini dans `files` (`DB:616`).
- Le hash sert à la traçabilité probatoire avec versioning documentaire (`SOCLE:237`).

## Access logs

- `audit_logs` est immuable (`DB:97`).
- `file_access_logs` est immuable (`DB:629`).
- Toute tentative hors RBAC implique `403 + audit_log` (`RBAC:185`).
- Corrélation obligatoire via `X-Correlation-Id` dans logs/audit/outbox (`SECTION9:205`, `SECTION9:210`).

## Retention

- Les règles légales et référentiels doivent être versionnés par `effective_from/effective_to` (`DB:32`).
- `country_rulesets`, `salary_grids`, `mandatory_pay_items` portent explicitement ces dates (`DB:399`, `DB:504`, `DB:519`).
- Aucune durée de conservation chiffrée globale n'est spécifiée dans 2.9/2.10/2.11/2.12/9.

## Key rotation

- Le thème "key rotation" est exigé comme rubrique de baseline par le besoin SECTION 10.D (`SOCLE:561`).
- Aucune politique opérationnelle de rotation des clés (fréquence, portée, procédure) n'est spécifiée dans 2.9/2.10/2.11/2.12/9.

## Incident handling

- Grille d'erreurs API standardisée (400/401/403/404/409/422/429/500) pour gestion des incidents applicatifs (`OPENAPI:16`).
- Alertes exigées sur échecs répétés outbox et violations multi-tenant/RBAC (`SECTION9:234`, `SECTION9:235`).
- Les mutations critiques doivent rester auditables et corrélées (`SECTION9:265`).

## PII handling

- Métadonnées audit: format JSON plat, PII-safe, pas de données personnelles sensibles en clair (`SECTION9:212`, `SECTION9:213`).
- Référencer par identifiants (`*_id`) plutôt que payloads complets (`SECTION9:214`, `SECTION9:215`).
- Les rôles lecture limitée (`client_user`, `worker`) réduisent l'exposition des données (`RBAC:33`).

## Non-goals / Out of scope

- Définir des paramètres de chiffrement, des clés, des TTL ou des procédures d'astreinte.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.
- Introduire de nouvelles exigences de sécurité non présentes dans les sources.

## Mini-changelog

- 2026-02-18: baseline consolidée depuis les sources contractuelles, avec mention explicite des points non spécifiés.
