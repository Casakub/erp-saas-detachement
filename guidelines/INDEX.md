# INDEX.md - Figma Make Navigation (Markdown Only)

## Objectif

- Centraliser une navigation claire pour Figma Make.
- Utiliser uniquement des fichiers `.md`.
- Eviter les chemins ambigus et la lecture massive inutile.

## Regle PDF

- Les fichiers `.pdf` ne sont pas utilisables dans Figma Make.
- Ils sont exclus de cet index de lecture.
- Si besoin d'historique prototype, utiliser les equivalents `.md` disponibles.

## Chemins

- Tous les chemins ci-dessous sont relatifs au dossier `guidelines/`.
- Exemple: `repo-docs/SECTION_1_PROMPTS_FIGMA_MAKE_PAR_PAGE_DESIGN.md`.

## Lecture Minimale (obligatoire)

1. `FIGMA_MAKE_QUICKSTART.md`
2. `Guidelines.md`
3. `overview-lot-active.md`
4. `components/reuse-gate.md`
5. `components/component-registry.md`

## Lecture Par Mode

| Mode | Fichiers |
| --- | --- |
| `minimal` | `FIGMA_MAKE_QUICKSTART.md`, `Guidelines.md`, `overview-lot-active.md`, `components/reuse-gate.md`, `components/component-registry.md` |
| `extended` | `overview-screen-module-map.md`, `overview-handoff.md`, `components/component-library.md`, `design-tokens/colors.md`, `design-tokens/typography.md`, `design-tokens/spacing.md` |
| `deep` | fichiers cibles dans `repo-docs/` seulement si ambiguite contractuelle |

## Sources Contractuelles LOCKED (priorite absolue)

Dossier: `repo-docs/SOCLE_TECHNIQUE_GEL__V1_LOCKED_/`

1. `2.09_Schema_DB_V1.1_V1_Patch.md`
2. `2.10_EVENTS_METIER_V1_Event-driven_Outbox_IA-fr.md`
3. `2.11_OPENAPI_V1_PARCOURS_MVP.md`
4. `2.11.A_OPENAPI_EXECUTION_SCHEMAS_ANNEXE.md`
5. `2.12_RBAC_PERMISSIONS_MATRIX_V1.md`

Complement utile:

- `repo-docs/SOCLE_TECHNIQUE_GELE_V1_LOCKED.md`
- `repo-docs/ERRATA_Clarifications_contractuelles_V1.1.md`

## Sections Produit Et Gouvernance

1. `repo-docs/SECTION_1_PROMPTS_FIGMA_MAKE_PAR_PAGE_DESIGN.md`
2. `repo-docs/SECTION_2_PROMPTS_IA_BACKEND_PAR_MODULE_DEV.md`
3. `repo-docs/SECTION_3_TEMPLATE_NOTION_CLICKUP_PILOTAGE_IA.md`
4. `repo-docs/SECTION_4_AI_CONTRIBUTION_RULES_OFFICIEL.md`
5. `repo-docs/SECTION_5_DEFINITION_OF_DONE_GLOBAL_DoD.md`
6. `repo-docs/SECTION_6_Checklist_Produit_V1_Globale.md`
7. `repo-docs/SECTION_7_ORCHESTRATION_NO-CODE_AUTORISEE.md`
8. `repo-docs/SECTION_8_PLAN_EXECUTION_ordre_conseille.md`
9. `repo-docs/SECTION_9_IMPLEMENTATION_SUBSTRATE_STACK_CONVENTIONS.md`
10. `repo-docs/SECTION_10_META_STRUCTURE_PRODUIT_GOUVERNANCE_INDEX.md`
11. `repo-docs/SECTION_10.A_PILIERS_FONCTIONNELS_6_PILIERS_M1_M13.md`
12. `repo-docs/SECTION_10.B_ROLES_ET_PERMISSIONS_INDEX.md`
13. `repo-docs/SECTION_10.C_DATA_ET_LEGAL_SOURCES_REGISTER_IDCC_COUNTRY_RULES.md`
14. `repo-docs/SECTION_10.D_SECURITY_BASELINE_HASHING_LOGS_ENCRYPTION_RETENTION_KEY_ROTATION_INCIDENT_PII.md`
15. `repo-docs/SECTION_10.E_ACCEPTANCE_TESTS_GIVEN_WHEN_THEN_CHAINE_CRITIQUE_E2E.md`
16. `repo-docs/SECTION_10.F_MVP_V1_V2_MATRIX_ASSISTE_VS_AUTO_EXCLUSIONS_V1.md`

## Templates IA (Section 3)

1. `repo-docs/SECTION_3.T1_TEMPLATE_PRD_MODULE_STANDARD_IA.md`
2. `repo-docs/SECTION_3.T2_TEMPLATE_DB_CHANGE_AND_MIGRATION_IMPACT_STANDARD_IA.md`
3. `repo-docs/SECTION_3.T3_TEMPLATE_SERVICE_AND_EVENTS_HANDLER_CONTRACT_STANDARD_IA.md`
4. `repo-docs/SECTION_3.T4_TEMPLATE_IMPACT_AND_CHANGELOG_STANDARD_IA.md`
5. `repo-docs/SECTION_3.T5_TEMPLATE_PIPELINE_FIGMA_TO_CONTRACT_TO_CODE_STANDARD_IA.md`

## Checklists Lots

1. `repo-docs/SECTION_6.1_CHECKLIST_LOT_1_IA_FOUNDATION_Core_Aut.md`
2. `repo-docs/SECTION_6.2_CHECKLIST_LOT_2_IA_CORE_METIER_Mission.md`
3. `repo-docs/SECTION_6.2.A_CHECKLIST_DE_VALIDATION_INTER-MODULES_LOT.md`
4. `repo-docs/SECTION_6.3_CHECKLIST_LOT_3_IA_TIMESHEETS_MOBILE.md`
5. `repo-docs/SECTION_6.4_CHECKLIST_LOT_6_IA_FINANCE_BILLING_M10_MODE_C1.md`
6. `repo-docs/SECTION_6.5_CHECKLIST_LOT_4_IA_CRM_CLIENTS_VIGILANCE_RFP.md`
7. `repo-docs/SECTION_6.6_CHECKLIST_LOT_5_IA_ATS_WORKERS.md`
8. `repo-docs/SECTION_6.7_CHECKLIST_LOT_7_IA_COMPLIANCE_ENGINE_REMUNERATION.md`
9. `repo-docs/SECTION_6.8_CHECKLIST_LOT_8_IA_RISK_CERTIFICATION_MARKETPLACE.md`
10. `repo-docs/SECTION_6.9_CHECKLIST_LOT_7_BIS_IA_EGALITE_DE_TRAITEMENT.md`

## Docs Support

- `repo-docs/ERP_detachement_europe.md`
- `repo-docs/FIGMA_MAKE_CONCEPTION_GUIDE.md`
- `repo-docs/FIGMA_MAKE_DOC_IMPORT_PACK.md`
- `repo-docs/documentation/README.md`
- `repo-docs/documentation/ai/PLAYBOOK.md`

## Procedure Anti-Derive

1. Lire `minimal`.
2. Confirmer `lot_id` et `module_id`.
3. Produire uniquement dans le scope actif.
4. Escalader vers `deep` seulement en cas de conflit ou ambiguite.
5. Mettre a jour `components/component-registry.md` apres generation.

## Note De Compatibilite

- Si un nom de fichier differe localement, utiliser la recherche Figma par prefixe (`SECTION_1`, `2.11`, `SECTION_10.E`, etc.).
- Cet index est optimise pour la lisibilite Figma Make, pas pour lister 100% des archives historiques.
