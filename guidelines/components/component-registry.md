# Components - Registry Contract (V1)

## Purpose

- Eviter la recreation de composants deja existants.
- Garder un inventaire unique, exploitable par Figma Make et les IA externes.
- Tracer les decisions de reuse avec un niveau module/lot.

## Source Coverage

- `guidelines/Guidelines.md` (registre obligatoire)
- `guidelines/components/reuse-gate.md`
- `guidelines/components/component-library.md`
- `guidelines/repo-docs/ERP Détachement europe/SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN) 308688d6a59680a59142d73793327a6a.md`

## Registry Schema (mandatory columns)

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Controlled Values

### `type`

- `nouveau`
- `reutilise`
- `variante`

### `responsive`

- `desktop_mobile`
- `desktop_only`
- `mobile_only`

### `status`

- `planned`
- `in_design`
- `ready`
- `deprecated`

### `a11y`

- `pending`
- `checked`

## Naming Convention

- Pattern recommande: `DOMAIN/ComponentName[/Variant]`
- Exemples:
- `UI/Button/Primary`
- `NAV/Breadcrumbs`
- `M7T/TimesheetWeeklyTable`
- `M83/EqualTreatmentResultCard`

## Update Rules (non negotiable)

1. Toute creation/modification de composant met a jour ce registre.
2. Toute variante doit pointer un composant parent existant via `reuse_decision`.
3. Aucune entree dupliquee (`component_id` unique).
4. Toute entree doit avoir un `lot_module` explicite.
5. Toute entree critique doit couvrir les etats utiles (`warning` et `blocked` si applicable).

## Baseline Registry (V1)

### Core Foundation

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI/Button/Primary | Button Primary | nouveau | Global | global-actions | default,hover,focus,disabled,loading | desktop_mobile | checked | baseline component | ready |
| UI/Button/Secondary | Button Secondary | variante | Global | global-actions | default,hover,focus,disabled | desktop_mobile | checked | variante de UI/Button/Primary | ready |
| UI/Button/Danger | Button Danger | variante | Global | destructive-actions | default,hover,focus,disabled | desktop_mobile | checked | variante de UI/Button/Primary | ready |
| UI/Button/Icon | Button Icon | variante | Global | icon-actions | default,hover,focus,disabled | desktop_mobile | checked | variante de UI/Button/Primary | ready |
| UI/Input/Text | Input Text | nouveau | Global | forms | default,focus,disabled,error | desktop_mobile | checked | baseline component | ready |
| UI/Input/Number | Input Number | variante | Global | forms | default,focus,disabled,error | desktop_mobile | checked | variante de UI/Input/Text | ready |
| UI/Input/Email | Input Email | variante | Global | auth,forms | default,focus,disabled,error | desktop_mobile | checked | variante de UI/Input/Text | ready |
| UI/Input/Password | Input Password | variante | Global | auth | default,focus,disabled,error | desktop_mobile | checked | variante de UI/Input/Text | ready |
| UI/Select/Single | Select Single | nouveau | Global | forms,filters | default,focus,disabled,error | desktop_mobile | checked | baseline component | ready |
| UI/Select/Multi | Select Multi | variante | Global | filters | default,focus,disabled,error | desktop_mobile | checked | variante de UI/Select/Single | ready |
| UI/Textarea | Textarea | nouveau | Global | forms | default,focus,disabled,error | desktop_mobile | checked | baseline component | ready |
| UI/Checkbox | Checkbox | nouveau | Global | forms | default,focus,disabled | desktop_mobile | checked | baseline component | ready |
| UI/Radio | Radio | nouveau | Global | forms | default,focus,disabled | desktop_mobile | checked | baseline component | ready |
| UI/Switch | Switch | nouveau | Global | settings | default,focus,disabled | desktop_mobile | checked | baseline component | ready |
| UI/DatePicker | Date Picker | nouveau | Global | mission,timesheets,filters | default,focus,disabled,error | desktop_mobile | checked | baseline component | ready |
| UI/Badge | Generic Badge | nouveau | Global | list-cells,cards | default,warning,error,success | desktop_mobile | checked | baseline component | ready |
| UI/Alert | Alert Banner | nouveau | Global | forms,system-messages | info,warning,error,success,blocked | desktop_mobile | checked | baseline component | ready |
| UI/Card | Generic Card | nouveau | Global | dashboards,lists | default,warning,blocked | desktop_mobile | checked | baseline component | ready |
| UI/Table | Generic Table | nouveau | Global | desktop-lists | default,loading,empty,error | desktop_only | checked | baseline component | ready |
| UI/Modal | Generic Modal | nouveau | Global | confirmations | default,blocked | desktop_mobile | checked | baseline component | ready |
| UI/Tabs | Tabs | nouveau | Global | detail-pages | default,focus,disabled | desktop_mobile | checked | baseline component | ready |
| UI/Pagination | Pagination | nouveau | Global | list-pages | default,hover,focus,disabled | desktop_only | checked | baseline component | ready |
| UI/State/Empty | Empty State | nouveau | Global | lists,dashboards | empty | desktop_mobile | checked | baseline component | ready |
| UI/State/Loading | Loading State | nouveau | Global | lists,forms | loading | desktop_mobile | checked | baseline component | ready |
| UI/State/Error | Error State | nouveau | Global | lists,forms | error | desktop_mobile | checked | baseline component | ready |

### Navigation And Shell

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NAV/Sidebar | Sidebar Navigation | nouveau | Global | desktop-shell | default,collapsed | desktop_only | checked | baseline component | ready |
| NAV/Header | Header Topbar | nouveau | Global | desktop-shell | default | desktop_only | checked | baseline component | ready |
| NAV/Breadcrumbs | Breadcrumbs | nouveau | Global | desktop-shell,landing | default | desktop_mobile | checked | baseline component | ready |
| NAV/GlobalSearch | Global Search Input | nouveau | Global | desktop-shell | default,focus,loading | desktop_only | checked | baseline component | ready |
| NAV/NotificationsMenu | Notifications Menu | nouveau | Global | desktop-shell,mobile | default,empty | desktop_mobile | checked | baseline component | ready |
| NAV/UserMenu | User Menu | nouveau | Global | desktop-shell | default | desktop_only | checked | baseline component | ready |

### Data, Compliance, Audit

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DATA/StatusBadge | Status Badge | nouveau | Global | critical-screens | normal,warning,blocked | desktop_mobile | checked | baseline component | ready |
| DATA/ComplianceDonut | Compliance Donut | nouveau | Lot2/M8 | mission-compliance | normal,warning,blocked | desktop_only | checked | baseline component | ready |
| DATA/ComplianceBreakdown | Compliance Breakdown | nouveau | Lot2/M8 | mission-compliance | normal,warning,blocked | desktop_only | checked | baseline component | ready |
| DATA/EnforcementBlockCard | Enforcement Block Card | nouveau | Lot2/M8 | mission-compliance,timesheets | blocked,warning | desktop_mobile | checked | baseline component | ready |
| DATA/AuditLogTable | Audit Log Table | nouveau | Lot2/M9 | audit,admin-platform | default,empty,error | desktop_only | checked | variante de UI/Table | ready |
| DATA/Timeline | Timeline | nouveau | Lot2/M9 | history,snapshots | default | desktop_mobile | checked | baseline component | ready |
| DATA/KPIWidget | KPI Widget | nouveau | Global | dashboards,reports | default,warning,blocked | desktop_mobile | checked | baseline component | ready |

### Forms, Upload, i18n

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FORM/Section | Form Section | nouveau | Global | all-forms | default | desktop_mobile | checked | baseline component | ready |
| FORM/ValidationMessage | Validation Message | nouveau | Global | all-forms | error,warning | desktop_mobile | checked | baseline component | ready |
| FORM/ConfirmModal | Confirmation Modal | variante | Global | sensitive-actions | default,blocked | desktop_mobile | checked | variante de UI/Modal | ready |
| FORM/FileUpload/Dropzone | File Upload Dropzone | nouveau | Lot5/M6 | docs-upload | default,hover,disabled | desktop_mobile | checked | baseline component | ready |
| FORM/FileUpload/Picker | File Picker | variante | Lot5/M6 | docs-upload | default,disabled | desktop_mobile | checked | variante de FORM/FileUpload/Dropzone | ready |
| FORM/FileUpload/Preview | File Preview Card | nouveau | Lot5/M6 | docs-upload | default,error | desktop_mobile | checked | baseline component | ready |
| FORM/FileUpload/Progress | Upload Progress | nouveau | Lot5/M6 | docs-upload | loading | desktop_mobile | checked | baseline component | ready |
| FORM/FileUpload/ResultState | Upload Result State | nouveau | Lot5/M6 | docs-upload | success,error,retry | desktop_mobile | checked | baseline component | ready |
| FORM/LocaleField | Multi-language Field | nouveau | Lot1/M13 | landing-cms,settings | default,error | desktop_mobile | checked | baseline component | ready |

### Landing, CMS, SEO

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LANDING/Hero | Marketing Hero | nouveau | Lot1/M13 | landing-home | default | desktop_mobile | checked | baseline component | ready |
| LANDING/ProofBlock | Proof Block | nouveau | Lot1/M13 | landing-home | default | desktop_mobile | checked | baseline component | ready |
| LANDING/FeatureBlock | Feature Block | nouveau | Lot1/M13 | landing-home | default | desktop_mobile | checked | baseline component | ready |
| LANDING/FAQ | FAQ Block | nouveau | Lot1/M13 | landing-home | default | desktop_mobile | checked | baseline component | ready |
| LANDING/CTAGroup | CTA Group | nouveau | Lot1/M13 | landing-home | default,hover,disabled | desktop_mobile | checked | baseline component | ready |
| LANDING/InternalLink | Internal Link Component | nouveau | Lot1/M13 | landing-home,landing-pages | default,hover,focus | desktop_mobile | checked | baseline component | ready |
| CMS/PageListTable | CMS Page List Table | nouveau | Lot1/M13 | cms-pages | default,empty,error | desktop_only | checked | variante de UI/Table | ready |
| CMS/BlockEditorSection | CMS Block Editor Section | nouveau | Lot1/M13 | cms-editor | default | desktop_only | checked | baseline component | ready |
| CMS/SeoMetadataForm | SEO Metadata Form | nouveau | Lot1/M13 | cms-seo | default,error | desktop_only | checked | variante de FORM/Section | ready |
| CMS/TranslationStatusCard | Translation Status Card | nouveau | Lot1/M13 | cms-translation | not_started,machine_draft,in_review,approved,published | desktop_mobile | checked | variante de UI/Card | ready |
| CMS/TranslationDiffView | Translation Diff View | nouveau | Lot1/M13 | cms-translation | default | desktop_only | checked | baseline component | ready |

### Module-Specific Components

| component_id | canonical_name | type | lot_module | screen_refs | states | responsive | a11y | reuse_decision | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M1/TaskTable | Task Table | nouveau | Lot1/M1 | task-list | default,empty,error | desktop_only | checked | variante de UI/Table | ready |
| M1/TaskForm | Task Form | nouveau | Lot1/M1 | task-create | default,error | desktop_mobile | checked | variante de FORM/Section | ready |
| M1/TaskStatusBadge | Task Status Badge | variante | Lot1/M1 | task-list,task-detail | normal,warning,blocked | desktop_mobile | checked | variante de DATA/StatusBadge | ready |
| M1/TaskStatusChangeModal | Task Status Change Modal | variante | Lot1/M1 | task-detail | default,blocked | desktop_mobile | checked | variante de FORM/ConfirmModal | ready |
| M2/LeadPipelineLane | Lead Pipeline Lane | nouveau | Lot4/M2 | crm-pipeline | default | desktop_only | checked | baseline component | ready |
| M3/ClientVigilanceStatusBadge | Client Vigilance Status | variante | Lot4/M3 | client-vigilance | valid,expiring,expired,missing | desktop_mobile | checked | variante de UI/Badge | ready |
| M4/RfpComparatorTable | RFP Comparator Table | nouveau | Lot4/M4 | rfp-comparator | default,empty | desktop_only | checked | variante de UI/Table | ready |
| M5/CandidateScoreTable | Candidate Score Table | nouveau | Lot5/M5 | ats-candidates | default,empty,error | desktop_only | checked | variante de UI/Table | ready |
| M6/WorkerDossierCard | Worker Dossier Card | nouveau | Lot5/M6 | worker-detail | default,warning | desktop_mobile | checked | variante de UI/Card | ready |
| M7/MissionDetailTabs | Mission Detail Tabs | variante | Lot2/M7 | mission-detail | default | desktop_mobile | checked | variante de UI/Tabs | ready |
| M7T/TimesheetWeeklyTable | Timesheet Weekly Table | nouveau | Lot3/M7.T | timesheet-detail | default,error | desktop_only | checked | variante de UI/Table | ready |
| M7T/TimesheetDoubleValidationBlock | Timesheet Double Validation Block | nouveau | Lot3/M7.T | timesheet-detail | pending,validated,rejected,blocked | desktop_only | checked | baseline component | ready |
| M7bis/MobileMissionCard | Mobile Mission Card | nouveau | Lot3/M7bis | mobile-dashboard | active,warning,blocked | mobile_only | checked | variante de UI/Card | ready |
| M8/ComplianceCaseHeader | Compliance Case Header | nouveau | Lot7/M8 | compliance-case | normal,warning,blocked | desktop_mobile | checked | baseline component | ready |
| M83/EqualTreatmentResultCard | Equal Treatment Result Card | nouveau | Lot7bis/M8.3 | equal-treatment | conforme,non_conforme,donnees_insuffisantes,warning | desktop_mobile | checked | variante de UI/Card | ready |
| M9/VaultAccessHistoryTable | Vault Access History Table | nouveau | Lot1/M9 | vault-history | default,empty,error | desktop_only | checked | variante de UI/Table | ready |
| M10/InvoiceStatusBadge | Invoice Status Badge | variante | Lot6/M10 | finance-invoices | draft,issued,paid,overdue,blocked | desktop_mobile | checked | variante de UI/Badge | ready |
| M11/MarketplaceAgencyCard | Marketplace Agency Card | nouveau | Lot8/M11 | marketplace-catalog | default | desktop_mobile | checked | variante de UI/Card | ready |
| M12/CertificationBadge | Certification Badge | variante | Lot8/M12 | marketplace-catalog,risk | certified,pending,revoked | desktop_mobile | checked | variante de UI/Badge | ready |
| M13/PermissionMatrixSection | Permission Matrix Section | nouveau | Lot1/M13 | permissions-detail | normal,warning,blocked | desktop_only | checked | baseline component | ready |
| M13/SystemReportWidget | System Report Widget | variante | Lot1/M13 | reports-dashboard | normal,warning,blocked | desktop_mobile | checked | variante de DATA/KPIWidget | ready |
| M13/SupportTicketForm | Support Ticket Form | nouveau | Lot1/M13 | support-center | default,error,success | desktop_mobile | checked | variante de FORM/Section | ready |

## Quality Gates Before Marking `ready`

- Reuse decision documented and coherent.
- Required states covered for the target use case.
- Responsive target completed (`desktop_mobile`, `desktop_only`, or `mobile_only`).
- Accessibility check completed.
- Entry linked to lot/module and target screens.

## Operational Rule

- Ce fichier est la reference unique pour savoir si un composant doit etre reutilise, variante ou cree.
- En cas de doute, appliquer `reuse-gate.md` puis mettre a jour ce registre avant toute nouvelle generation.
