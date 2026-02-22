# SECTION 10.D — SECURITY BASELINE (HASHING, LOGS, ENCRYPTION, RETENTION, KEY ROTATION, INCIDENT, PII)

- Statut: READY (2026-02-22) — était DRAFT depuis 2026-02-18
- Portée: consolider ET préciser les paramètres de sécurité opérationnels du produit.
- Règles:
  - Ce document **complète** les documents contractuels (2.9/2.10/2.11/2.12/SECTION9) pour les paramètres de sécurité qu'ils laissent non spécifiés.
  - Il **ne les modifie pas** et ne crée pas de nouvelles exigences fonctionnelles.
  - En cas de conflit avec un document LOCKED, le LOCKED prime. 10.D ne prend autorité que sur les sujets non couverts par les LOCKED.
- Note de correction (2026-02-22) : Contradiction interne résolue — les sections Encryption/Retention/Key rotation indiquaient "non spécifié dans 2.9/2.10/2.11/2.12/9" alors que la section "Politique Sécurité Baseline" en bas de document les spécifie explicitement. La formulation a été corrigée pour être cohérente : 10.D complète ces paramètres, il ne les laisse pas non spécifiés.

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
- Les algorithmes, modes et paramètres cryptographiques sont précisés par 10.D ci-dessous (section "Politique Sécurité Baseline") en complément des LOCKED.

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
- Les durées de conservation globales sont précisées par 10.D ci-dessous (section "Politique Sécurité Baseline") en complément des LOCKED.

## Key rotation

- Le thème "key rotation" est exigé comme rubrique de baseline par le besoin SECTION 10.D (`SOCLE:561`).
- La politique opérationnelle de rotation des clés (fréquence, portée, procédure) est précisée par 10.D ci-dessous (section "Politique Sécurité Baseline") en complément des LOCKED.

## Incident handling

- Grille d'erreurs API standardisée (400/401/403/404/409/422/429/500) pour gestion des incidents applicatifs (`OPENAPI:16`).
- Alertes exigées sur échecs répétés outbox et violations multi-tenant/RBAC (`SECTION9:234`, `SECTION9:235`).
- Les mutations critiques doivent rester auditables et corrélées (`SECTION9:265`).

## PII handling

- Métadonnées audit: format JSON plat, PII-safe, pas de données personnelles sensibles en clair (`SECTION9:212`, `SECTION9:213`).
- Référencer par identifiants (`*_id`) plutôt que payloads complets (`SECTION9:214`, `SECTION9:215`).
- Les rôles lecture limitée (`client_user`, `worker`) réduisent l'exposition des données (`RBAC:33`).

## Politique Sécurité Baseline (10.D)

Chiffrement : AES-256-GCM pour fichiers au repos. TLS 1.2+ en transit (obligation).

Retention des données :

audit_logs : conservation minimum 5 ans (exigence inspection)
file_access_logs : conservation minimum 5 ans
worker_remuneration_snapshot : conservation minimum 5 ans + durée mission
Fichiers documents (preuves) : conservation minimum 5 ans après fin de mission
Leads/CRM données prospection : 3 ans maximum (RGPD)
Utilisateurs inactifs : anonymisation après 3 ans
Key rotation :

JWT signing key : rotation tous les 90 jours maximum
Storage encryption keys : rotation annuelle
Webhook signing secret : rotation sur demande + à chaque suspicion de fuite
Incident handling :

Niveau 1 (violation RBAC détectée) : alert automatique (outbox SecurityIncidentDetected), notification admin
Niveau 2 (fuite cross-tenant) : coupure accès tenant concerné + notification CNIL si données personnelles (72h)
Niveau 3 (compromission signing key) : rotation immédiate + révocation sessions actives

## Non-goals / Out of scope

- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.
- Introduire de nouvelles exigences fonctionnelles métier non présentes dans les sources.
- Remplacer les équipes sécurité pour la rédaction d'un PSSI complet.

> Note : Ce document définit intentionnellement des paramètres opérationnels (AES-256-GCM, rotation 90j, retention 5 ans...) qui complètent les LOCKED. C'est son rôle de "Security Baseline". Ce n'est pas contradictoire avec ses sources — il les enrichit là où elles restent muettes.

## Mini-changelog

- 2026-02-18: baseline consolidée depuis les sources contractuelles.
- 2026-02-22: passage DRAFT → READY. Correction de la contradiction interne (3 passages corrigeant "non spécifié" en "précisé par 10.D ci-dessous"). Section Non-goals reformulée pour être cohérente avec le contenu réel du document. Aucun changement de contenu substantiel.
