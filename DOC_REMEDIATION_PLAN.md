# DOC_REMEDIATION_PLAN — PR0-bis.1

## Objectif

Remédier aux erreurs `doc_check` sur les fences markdown, sans modifier les documents LOCKED.

## Source du diagnostic

Commande:

```bash
bash scripts/run_doc_check.sh > /tmp/doccheck_pr0bis.log 2>&1
```

Règles en échec:

- `fences interdites détectées` (` ```markdown ` interdit)
- `fences ambiguës/cassées détectées` (fence ouverte sans langage)

## Scope de remediation autorisé

- `SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)` (patches + release pack + owner docs)
- `SECTION 6 — Checklist Produit V1 (Globale)`

Exclusion stricte:

- `SOCLE TECHNIQUE GELÉ — V1 (LOCKED)`

## Plan d'action standard

- Règle R1: remplacer ` ```markdown ` par un fence autorisé (` ```text `, ` ```json `, ` ```sql `, ` ```bash ` selon le contenu).
- Règle R2: ajouter explicitement un langage sur chaque ouverture de fence vide (` ``` ` -> ` ```text ` par défaut si non code).
- Règle R3: conserver le contenu fonctionnel identique (aucune modification métier), uniquement normalisation syntaxique des fences.

## Fichiers fautifs et actions

| Fichier | Lignes signalées | Règle violée | Action |
|---|---|---|---|
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/CDC_COMPLETIONS_FROM_AUDIT.md` | 141, 156, 262, 296, 310, 394, 408, 426 | R1 + R2 | Remplacer ` ```markdown ` + typer toutes fences vides |
| `ERP Détachement europe/SECTION 6 — Checklist Produit V1 (Globale)/6 7 — CHECKLIST — LOT 7 IA (COMPLIANCE ENGINE REMUNERATION) 30b688d6a59680cca2c4f65092f93b55.md` | 46 | R2 | Ajouter langage sur la fence |
| `ERP Détachement europe/SECTION 6 — Checklist Produit V1 (Globale)/6 9 — CHECKLIST — LOT 7 BIS IA (EGALITE DE TRAITEMENT).md` | 70 | R2 | Ajouter langage sur la fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_DB_2.9.16-G_equal_treatment_compliance_exports.md` | 327, 358 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/OWNER_SIGNOFF_V1.2.md` | 36, 95, 125, 185, 209, 269 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/RELEASE_PACK_V1.2_INDEX.md` | 23 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_RBAC_2.12.b_PLATFORM_ADMIN.md` | 38 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_ATS_SCORING_Q7_V1_RULES_BASED.md` | 56, 64, 127, 198, 214 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_DB_2.9.16-E_rfp_visibility_contact_logs.md` | 203, 216 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_DB_2.9.16-C_worker_push_subscriptions.md` | 16, 156 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_EVENTS_2.10.4.11.md` | 365 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md` | 134 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_DB_2.9.16-F_sipsi_declarations.md` | 16, 34, 254 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES.md` | 35 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/RELEASE_PACK_V1.2_OPEN_ITEMS.md` | 79 | R2 | Ajouter langage sur fence |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/MERGE_LOCK_PLAN_V1.2.md` | 126, 158 | R2 | Ajouter langage sur fences |
| `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)/DECISIONS_OWNER_V1.2.md` | 55 | R2 | Ajouter langage sur fence |

## Critère de clôture remediation

- `bash scripts/run_doc_check.sh` retourne `0`.
- Les workflows CI rebasculent doc-check en bloquant (suppression `continue-on-error: true`).
