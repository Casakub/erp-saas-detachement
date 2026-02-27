# FIGMA MAKE DOC IMPORT PACK

- Statut: DRAFT
- Portée: protocole d’import manuel des docs GitHub vers Figma Make.
- Objectif: réduire la dérive en mode sans sync bidirectionnelle.

## 1) Principe

- Import manuel oui, import massif non.
- Toujours travailler avec un lot actif.
- Charger un pack documentaire minimal et traçable.

## 2) Structure Figma obligatoire

Créer une page dédiée:

- `00_DOCS_READONLY`

Créer ces sections dans la page:

1. `00_DOCS_GLOBAL_RULES`
2. `01_DOCS_LOT_ACTIVE`
3. `02_DOCS_MAPPING_SCREEN_TO_MODULE`
4. `03_DOCS_DECISIONS_V1_V2`

Règle:
- Cette page est lecture seule (pas de design final dedans).

## 3) Pack global (toujours importé)

Importer ces fichiers à chaque session:

1. `ERP Détachement europe/SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN) 308688d6a59680a59142d73793327a6a.md`
2. `ERP Détachement europe/SECTION 3.T5 — TEMPLATE — PIPELINE FIGMA TO CONTRACT TO CODE (STANDARD IA).md`
3. `ERP Détachement europe/SECTION 7 — ORCHESTRATION NO-CODE (AUTORISÉE) 308688d6a59680f2bff6f404c1ac8b90.md`
4. `ERP Détachement europe/SECTION 8 — PLAN D’EXÉCUTION (ordre conseillé) 308688d6a596809584e4eef380abe47c.md`
5. `ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 30a688d6a596803a8541ef09201359f2.md`
6. `ERP Détachement europe/SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1) 30b688d6a59680e78855eae07f3c9771.md`

## 4) Pack par lot (import ciblé)

En plus du pack global, importer uniquement les docs du lot actif.

| Lot | Docs minimum |
| --- | --- |
| Lot 1 | Checklist 6.1 + surfaces M1/M9 de SECTION 2 |
| Lot 2 | Checklist 6.2 + 6.2.A + surfaces M7/M8/M9 de SECTION 2 |
| Lot 3 | Checklist 6.3 + surfaces M7.T/M7bis de SECTION 2 |
| Lot 4 | Checklist 6.5 + patches M3A/M3B/M3C + surfaces M2/M3/M4 |
| Lot 5 | Checklist 6.6 + surfaces M5/M6 |
| Lot 6 | Checklist 6.4 + surfaces M10 |
| Lot 7 | Checklist 6.7 + surfaces M8 extension |
| Lot 7 bis | Checklist 6.9 + `PATCH_DB_2.9.16-G` + `PATCH_EVENTS_2.10.4.11` + `PATCH_OPENAPI_V1.3_SURFACES_MANQUANTES` |
| Lot 8 | Checklist 6.8 + surfaces M11/M12 |

## 4.bis) Pack Landing / Growth (hors lot coeur)

Quand la session Figma Make cible le site public marketing:

Importer:
1. `ERP Détachement europe/SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN) 308688d6a59680a59142d73793327a6a.md` (bloc 1.2 Landing)
2. `FIGMA_MAKE_CONCEPTION_GUIDE.md`
3. `ERP Détachement europe/SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1) 30b688d6a59680e78855eae07f3c9771.md`

Objectif:
- Produire landing moderne + CMS-ready + traduction assistée + SEO-first sans dériver du périmètre V1.

## 5) Séquence d’utilisation

1. Choisir le lot actif.
2. Charger le pack global.
3. Charger le pack lot actif.
4. Exécuter le prompt `0.9` (SECTION 1).
5. Exécuter le prompt `0.11` avant chaque page.
6. Générer les écrans et états du lot uniquement.

## 6) Checklist d’alignement avant génération

- [ ] Lot actif identifié.
- [ ] Exclusions V2 explicites rappelées.
- [ ] Contraintes V1 actives rappelées (online-only mobile, allocation assistée, backend décide).
- [ ] Écrans cibles mappés à des modules explicites.
- [ ] États `NORMAL/WARNING/BLOCKED` prévus.

## 7) Handoff à exporter vers GitHub (manuel)

Pour chaque écran généré, exporter un bloc de handoff:

1. `screen_id`
2. `lot`
3. `module`
4. `persona`
5. `states`
6. `api_reads` (si connu)
7. `api_writes` (si connu)
8. `events_expected` (si connu)
9. `notes_v1_constraints`

## 8) Anti-patterns

- Importer tous les docs du repo sans filtrage.
- Mélanger plusieurs lots dans la même session Figma Make.
- Produire des écrans impliquant une décision automatique V1 non autorisée.
- Concevoir des flows offline V1.

## 9) Mini-changelog

- 2026-02-23: création du pack d’import manuel docs Figma Make.
