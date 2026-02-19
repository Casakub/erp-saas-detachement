# SECTION 10.C — DATA & LEGAL SOURCES REGISTER (IDCC + COUNTRY RULES)

- Statut: DRAFT
- Portée: enregistrer les sources légales et data déjà matérialisées dans les contrats et schémas.
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

## Non-goals / Out of scope

- Définir de nouvelles obligations légales.
- Définir des valeurs de minima, coefficients ou calculs.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou SECTION 9.

## Mini-changelog

- 2026-02-18: registre complété depuis les sources contractuelles existantes (sans ajout de règles).
