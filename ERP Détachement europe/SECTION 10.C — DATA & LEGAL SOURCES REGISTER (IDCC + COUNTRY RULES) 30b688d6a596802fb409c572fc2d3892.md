# SECTION 10.C — DATA & LEGAL SOURCES REGISTER (IDCC + COUNTRY RULES)

- Statut: READY
- Version: 1.2
- Date: 2026-02-20
- Portée: registre des sources légales et data matérialisées dans les contrats + registre concret des données IDCC V1 (décision Q2-B) à livrer en tant que fixtures/import initial.
- Règles:
- Registre documentaire uniquement.
- Aucune règle juridique nouvelle, aucun calcul, aucune implémentation.

## Références sources (justification d'existence)

- SOCLE point 10.C: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:560`
- Données légales requises (IDCC, versions, dates): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:376`
- Schéma DB versionné (country_rulesets, salary_grids): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md:394`
- Alias utilisés dans les tableaux: `SOCLE` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md`, `DB` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md`

## Registre des sources

| source_name | country | legal_scope | version | effective_from | effective_to | owner | update_cadence | reference_doc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `country_rulesets` | FR, PT, RO, PL | Règles pays/corridor (exigences, champs, alertes) | Champ `version` (string) | Champ `effective_from` | Champ `effective_to` (nullable) | Tenant (pilotage conformité M8) | Cadence non fixée contractuellement, mise à jour à chaque nouvelle version de ruleset | `DB:394` |
| `idcc_conventions` | FR | Référentiel conventions collectives (BTP, Métallurgie, Transport en V1) | Version portée par référentiel associé (`salary_grids`) | N/A (table de référence) | N/A | Tenant (pilotage conformité M8) | Cadence non fixée contractuellement | `DB:486`, `SOCLE:370` |
| `salary_grids` | FR | Minima conventionnels par IDCC/classification | Version temporelle via `effective_from/effective_to` | Champ `effective_from` | Champ `effective_to` (nullable) | Tenant (pilotage conformité M8) | Cadence liée aux mises à jour conventionnelles, non chiffrée dans les contrats | `DB:496` |
| `mandatory_pay_items` | FR | Primes/indemnités obligatoires versionnées | Version temporelle via `effective_from/effective_to` | Champ `effective_from` | Champ `effective_to` (nullable) | Tenant (pilotage conformité M8) | Cadence non fixée contractuellement | `DB:509` |
| `compliance_requirements` | FR (host) avec origines PT/RO/PL selon dossier | Exigences de conformité (A1, SIPSI, représentant host) | Pas de champ `version` dédié, dépend des sources légales amont | `due_date` au niveau exigence | N/A | Tenant (pilotage conformité M8) | Revue continue au fil du cycle compliance case | `DB:404`, `DB:408` |
| `a1_requests` | PT, RO, PL, FR | Suivi A1 assisté (statuts, pièces, dates) | Version non spécifiée dans les contrats | `requested_at` | `expires_at` (si renseigné) | Tenant (pilotage conformité M8) | Cadence pilotée par statut/relances, non chiffrée contractuellement | `DB:415`, `SOCLE:391` |

## Liens structurants

- Schéma DB contractuel: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED)/2 9 - Schéma DB V1 1 (V1 + Patch) 308688d6a5968011b4f1f037d9e623f3.md`
- Module conformité M8 (cadre fonctionnel): `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:213`

---

## Registre IDCC V1 — Données à livrer (décision Q2-B OWNER)

Ce registre formalise les 3 conventions collectives à charger en V1 via `POST /v1/admin/salary-grids` (admin panel ou fixtures de seed). Référence: `6.7 Checklist Lot 7 READY`.

### IDCC BTP-1702 — Bâtiment et Travaux Publics

| Champ | Valeur |
| --- | --- |
| `idcc_code` | `BTP-1702` |
| `sector_label` | Bâtiment et Travaux Publics |
| `country_host` | FR |
| `source_legal` | Convention Collective Nationale du Bâtiment (IDCC 1702) |
| `effective_from` | 2025-01-01 |
| `effective_to` | null (en vigueur) |
| `period_type` | hourly |
| `model_version` | `btp-1702-2025-v1` |

Classifications V1 (exemples de minima horaires bruts — à valider sur grille officielle avant import) :

| `classification_code` | `classification_label` | `legal_minimum_amount` (EUR/h) |
| --- | --- | --- |
| `N1P1` | Ouvrier Niveau 1 Position 1 | 12.50 |
| `N1P2` | Ouvrier Niveau 1 Position 2 | 13.10 |
| `N2P1` | Ouvrier Niveau 2 Position 1 | 13.80 |
| `N2P2` | Ouvrier Niveau 2 Position 2 | 14.60 |
| `N3P1` | Ouvrier Niveau 3 Position 1 | 15.40 |
| `N3P2` | Ouvrier Niveau 3 Position 2 | 16.30 |
| `N4P1` | Chef d'équipe Niveau 4 | 17.50 |
| `ETAM-A` | ETAM Technicien Coefficient 275 | 19.00 |
| `ETAM-B` | ETAM Technicien Coefficient 310 | 21.50 |

**Note implémentation**: les montants ci-dessus sont des valeurs indicatives pour le seed V1. L'import réel doit utiliser la grille officielle publiée par l'OPPBTP/FNBTP pour la période 2025.

---

### IDCC METAL-3109 — Métallurgie (CCN 2024)

| Champ | Valeur |
| --- | --- |
| `idcc_code` | `METAL-3109` |
| `sector_label` | Métallurgie |
| `country_host` | FR |
| `source_legal` | Convention Collective Nationale de la Métallurgie (IDCC 3109, CCN 2024) |
| `effective_from` | 2024-01-01 |
| `effective_to` | null (en vigueur) |
| `period_type` | monthly |
| `model_version` | `metal-3109-ccn2024-v1` |

Classifications V1 (exemples de minima mensuels bruts — CCN Métallurgie 2024) :

| `classification_code` | `classification_label` | `legal_minimum_amount` (EUR/mois) |
| --- | --- | --- |
| `TAM-215` | Technicien Coefficient 215 | 2 200 |
| `TAM-240` | Technicien Coefficient 240 | 2 380 |
| `TAM-270` | Technicien Agent de Maîtrise Coeff 270 | 2 600 |
| `TAM-305` | Agent de Maîtrise Coeff 305 | 2 900 |
| `CADRE-330` | Cadre Coefficient 330 | 3 200 |
| `CADRE-365` | Cadre Confirmé Coefficient 365 | 3 650 |

**Note implémentation**: la CCN Métallurgie 2024 remplace les anciennes conventions régionales. Les coefficients 215→365 sont le référentiel officiel. Valider les montants sur la publication UIMM avant import.

---

### IDCC TRANSPORT-16 — Transports Routiers

| Champ | Valeur |
| --- | --- |
| `idcc_code` | `TRANSPORT-16` |
| `sector_label` | Transports Routiers de Marchandises |
| `country_host` | FR |
| `source_legal` | Convention Collective Nationale des Transports Routiers (IDCC 16) — Annexe I Ouvriers |
| `effective_from` | 2025-01-01 |
| `effective_to` | null (en vigueur) |
| `period_type` | monthly |
| `model_version` | `transport-16-2025-v1` |

Classifications V1 (exemples de minima mensuels bruts — Annexe I CCN Transport) :

| `classification_code` | `classification_label` | `legal_minimum_amount` (EUR/mois) |
| --- | --- | --- |
| `TRANSP-I` | Conducteur Groupe I (courte distance) | 2 100 |
| `TRANSP-II` | Conducteur Groupe II (longue distance nationale) | 2 300 |
| `TRANSP-III` | Conducteur Groupe III (international) | 2 550 |
| `TRANSP-IV` | Conducteur Groupe IV (grand tourisme) | 2 800 |
| `TRANSP-V` | Chef de bord / Convoyeur Groupe V | 3 050 |

**Note implémentation**: les abattements et majorations (nuit, dimanche) sont des éléments de paie complémentaires, non inclus dans `legal_minimum_amount`. Valider avec Annexe I officielle avant import.

---

## Registre `country_rulesets` V1 — Données à livrer

Référence: décision Q7-C (durées cumulées), `6.7 Checklist Lot 7`.

| `country_host` | `warning_days` | `critical_days` | `duration_scope` | `source_legal` | `effective_from` |
| --- | --- | --- | --- | --- | --- |
| FR | 300 | 365 | per_mission_per_worker | Directive 96/71/CE + Loi Macron 2015 | 2025-01-01 |
| DE | 270 | 364 | per_mission_per_worker | AEntG (Arbeitnehmer-Entsendegesetz) | 2025-01-01 |
| BE | 270 | 364 | per_mission_per_worker | Loi du 5 mars 2002 | 2025-01-01 |

**Note**: seuls les `country_rulesets` FR sont obligatoires en V1 (seed initial). DE et BE sont optionnels V1, configurables post-déploiement par `tenant_admin`.

---

## Livrable attendu (Lot 7)

- [ ] Seed/fixtures `salary_grids` : 3 IDCC V1 chargés (BTP-1702, METAL-3109, TRANSPORT-16) avec classifications listées ci-dessus
- [ ] Seed/fixtures `country_rulesets` : FR (300d/365d) chargé par défaut
- [ ] Montants réels validés sur sources officielles avant merge (non-bloquant pour la gate de code, bloquant pour la gate de QA)
- [ ] Import via `POST /v1/admin/salary-grids` testé (RBAC: `tenant_admin` + `system`)

---

## Non-goals / Out of scope

- Définir de nouvelles obligations légales.
- Définir des montants définitifs (rôle des équipes métier/juridique avant QA).
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: registre complété depuis les sources contractuelles existantes (sans ajout de règles).
- 2026-02-20: v1.2 — ajout registre concret IDCC V1 (BTP-1702, METAL-3109, TRANSPORT-16) avec classifications, minima indicatifs, country_rulesets FR. Livrable Lot 7 formalisé. Statut DRAFT → READY.
