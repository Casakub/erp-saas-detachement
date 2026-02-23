# FIGMA MAKE CONCEPTION GUIDE

- Statut: DRAFT
- Portée: guide racine de cadrage pour la conception Figma Make.
- But: garantir une conception cohérente avec le cahier des charges contract-first.

## 1) Usage obligatoire

- Ce guide est la référence de conception à appliquer avant toute page Figma.
- Références primaires:
- `ERP Détachement europe/SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN) 308688d6a59680a59142d73793327a6a.md`
- `ERP Détachement europe/SECTION 8 — PLAN D’EXÉCUTION (ordre conseillé) 308688d6a596809584e4eef380abe47c.md`
- `ERP Détachement europe/SECTION 9 — IMPLEMENTATION SUBSTRATE (STACK & CONVENTIONS) 30a688d6a596803a8541ef09201359f2.md`
- `ERP Détachement europe/SECTION 10.F — MVP V1 V2 MATRIX (ASSISTE VS AUTO + EXCLUSIONS V1) 30b688d6a59680e78855eae07f3c9771.md`
- `FIGMA_MAKE_DOC_IMPORT_PACK.md`
- Le backend reste seule source de vérité métier.

## 2) Principes non négociables

- Figma Make produit du design, pas des décisions métier.
- Les écrans visualisent les états backend (`NORMAL`, `WARNING`, `BLOCKED`).
- Toute logique critique reste backend (enforcement, conformité, finance).
- No-code limité à l’orchestration (notifications, PDF, relances, exports).
- V1:
- mobile PWA online-only,
- allocation marketplace assistée (pas d’allocation automatique),
- séparation stricte backend/UI/no-code.

## 3) Architecture cible (contexte de conception)

| Domaine | Cible V1 |
| --- | --- |
| Front Office Agence/Admin | Application web desktop (1440) |
| Front Office Worker | PWA mobile (390), online-only |
| Backend API | Node.js TypeScript, runtime Node 20 |
| Base de données | Supabase Postgres (multi-tenant, RLS) |
| Storage | Supabase Storage |
| Intégration | Events outbox + orchestration no-code autorisée |

Note:
- Ce tableau sert au cadrage design et handoff.
- Il ne remplace pas les contrats techniques LOCKED.

## 4) Dossiers de l’application (cible de handoff)

Arborescence cible de référence:

| Dossier | Rôle |
| --- | --- |
| `frontend/web/` | écrans desktop agence/admin |
| `frontend/worker-pwa/` | écrans mobile worker |
| `frontend/shared-ui/` | composants partagés, tokens, patterns |
| `backend/` | API, modules métier, outbox, audit |
| `backend/modules/` | modules `M1..M13` + `M7bis` |
| `backend/shared/` | auth, rbac, audit, outbox |
| `backend/migrations/` | migrations SQL versionnées |
| `supabase/` | configuration locale DB/CLI |

Règle:
- Toute décision de structure exécutable finale reste validée côté backend/substrat.

## 5) Structure Figma à créer (obligatoire)

Pages/dossiers Figma recommandés:

1. `00_Cover_And_Rules`
2. `01_Design_System`
3. `02_Lot1_Foundation`
4. `03_Lot2_Core_Missions_Compliance`
5. `04_Lot3_Timesheets_Worker_PWA`
6. `05_Lot4_CRM_Clients_RFP`
7. `06_Lot5_ATS_Workers`
8. `07_Lot6_Finance`
9. `08_Lot7_Compliance_Engine`
10. `09_Lot7bis_Equal_Treatment`
11. `10_Lot8_Marketplace_Risk_Certification`
12. `11_Admin_Platform`
13. `12_Handoff_Specs`

Dans chaque page:
- variantes desktop/mobile si applicable,
- états `NORMAL/WARNING/BLOCKED`,
- composants réutilisables et variantes nommées.

## 6) Type de code attendu au handoff

- Cible de handoff:
- composants UI modulaires,
- conventions nommage stables,
- structure prête pour TypeScript.
- Si Figma Make propose du code:
- privilégier composants réutilisables, pas de logique métier embarquée,
- ne jamais embarquer secrets, SQL, clés API, ni appels directs DB.

## 7) Mapping design vers modules

Mapping minimal à maintenir:

| Espace | Modules principaux |
| --- | --- |
| Foundation | M1, M9 |
| Missions/Compliance | M7, M8, M9 |
| Timesheets/Mobile | M7.T, M7bis |
| CRM/Clients/RFP | M2, M3, M4 |
| ATS/Workers | M5, M6 |
| Finance | M10 |
| Compliance extension | M8 (Lot 7) + M8.3 (Lot 7 bis) |
| Marketplace/Risk | M11, M12 |
| i18n & communications | M13 |

## 8) Checklist de sortie Figma Make

- [ ] Design system livré.
- [ ] Arborescence pages lots complète.
- [ ] États `NORMAL/WARNING/BLOCKED` présents sur écrans critiques.
- [ ] Contraintes V1 respectées (allocation assistée, mobile online-only).
- [ ] Aucun flux V2 activé en V1.
- [ ] Handoff lisible par module et par lot.

## 9) Anti-patterns

- Ajouter de la logique légale/calcul dans la maquette.
- Concevoir des écrans qui supposent auto-allocation V1.
- Concevoir des flows offline V1.
- Exposer des données techniques non UI (hash, clés, secrets).

## 10) Mini-changelog

- 2026-02-23: création du guide racine de conception Figma Make.
- 2026-02-23: ajout référence au pack d’import manuel `FIGMA_MAKE_DOC_IMPORT_PACK.md`.
