# Components - Library Contract (V1)

## Purpose

- Definir la bibliotheque de composants UI reusable pour Figma Make.
- Couvrir les besoins explicites de `SECTION 1` sans introduire de logique metier.
- Eviter les doublons visuels et stabiliser le handoff vers implementation code.

## Source Coverage

- Source principale: `ERP Détachement europe/SECTION 1 — PROMPTS FIGMA MAKE (PAR PAGE) (DESIGN) 308688d6a59680a59142d73793327a6a.md`
- Cadrage structure: `FIGMA_MAKE_CONCEPTION_GUIDE.md`
- Regles de reuse: `guidelines/components/reuse-gate.md`
- Registre obligatoire: `guidelines/components/component-registry.md`

## Core Foundation Components (mandatory)

- Buttons: primary, secondary, ghost, danger, icon-only.
- Inputs: text, number, email, phone, password.
- Selects: single, multi-select.
- Textarea.
- Checkbox, radio, switch (visual only if no contracted API).
- Date and datetime pickers.
- Badges.
- Alerts and banners.
- Cards.
- Tables.
- Modals.
- Tabs.
- Pagination.
- Empty states.
- Loading states.
- Error states.

## Navigation And Shell Components

- Sidebar navigation.
- Header topbar.
- Breadcrumbs.
- Global search input.
- Notifications menu/list.
- User menu and account menu.

## Data And Compliance Components

- Status badges for `NORMAL`, `WARNING`, `BLOCKED`.
- Compliance score components:
- donut chart
- breakdown by category
- Snapshot trace card (read-only display).
- Enforcement block card with readable reasons.
- Audit log table (filters + export action UI).
- Timeline component (history and immutable snapshots).
- KPI widgets (risk, alerts, expirations, overdue).

## Forms And Input Flows

- Structured form sections.
- Field help text and validation message blocks.
- Confirmation modals for sensitive UI actions.
- File upload components:
- upload dropzone
- file picker (photo/file)
- preview card
- upload progress spinner
- success/error/retry states
- Multilingual field blocks (source/target views).

## Landing, CMS, SEO Components

- Marketing hero block.
- Proof and use-case blocks.
- Features blocks.
- FAQ block.
- CTA blocks and CTA groups.
- Internal links and marketing breadcrumbs.
- CMS page list table.
- CMS block editor sections (hero/proof/features/faq/cta/legal).
- SEO metadata form sections (`meta`, `og`, `canonical`, `robots`, sitemap inclusion).
- Translation workflow cards:
- status badge (`not_started`, `machine_draft`, `in_review`, `approved`, `published`)
- source vs translation diff view
- validate-before-publish pattern

## Module-Specific Component Sets

### M1 Foundation / Tasks

- Task list table.
- Task create/edit form.
- Task status badge.
- Task status change confirmation modal.

### M2-M4 CRM / Clients / RFP

- Pipeline lane and lead card.
- Lead/client detail cards.
- Vigilance document status badges (`valid`, `expiring`, `expired`, `missing`).
- RFP list table.
- Agency response cards (price/compliance/experience/delay indicators).
- Side-by-side comparator table.

### M5-M6 ATS / Workers

- Job posting form.
- Candidate list table with sortable score column.
- Candidate profile card and actions panel.
- Worker dossier cards and document expiration list.

### M7 / M7.T Missions and Timesheets

- Mission list table and mission detail tabs.
- Timesheet weekly table (daily entries).
- Timesheet status badges (`draft`, `submitted`, `client_validated`, `agency_validated`, `validated`, `rejected`).
- Double validation blocks (client and agency).
- Rejection modal with reason.
- Billing status indicator (`not_billed`, `billed`).

### M7bis Worker Mobile PWA

- Mission mobile cards.
- Check-in/check-out action cards.
- Mobile notifications list.
- Weekly hours entry component.
- Mobile upload flow components.

### M8 Compliance Engine + M8.3 Equal Treatment

- Compliance case header.
- Equal treatment check form sections.
- Check result cards (`conforme`, `non_conforme`, `donnees_insuffisantes`).
- Warning badge `NO_REMUNERATION_SNAPSHOT`.
- Traceability panel (actor/date/snapshot id/audit link).

### M9 Vault

- File list and filters.
- Access history table.
- Version history/timeline blocks.

### M10 Finance

- Quote/invoice status badges.
- Payment status and overdue indicators.
- Commission widgets.
- Invoice blocked banner with reason.

### M11-M12 Marketplace / Risk / Certification

- Marketplace agency catalog cards.
- Certification badges.
- Ranking indicators (display only).
- Marketplace access status blocks.

### M13 Settings / Permissions / Reports / Help

- Permission group table.
- Permission matrix visual sections.
- Feature toggle rows (visual only if out of contracted scope).
- User settings tabs (profile, notifications, security, preferences).
- System reports widgets and events log list.
- Help center search and FAQ blocks.
- Support ticket form and ticket status cards.

## State Variants (mandatory by default)

- `default`
- `hover`
- `focus`
- `disabled`
- `loading`
- `success`
- `warning`
- `error`
- `blocked` (for critical actions and compliance gates)

## Responsive Requirements

- Every critical component requires desktop and mobile variants.
- Desktop reference: 1440.
- Mobile reference: 390.
- Worker mobile UX: one screen, one action, no complex tables.

## Accessibility Minimum

- Readable contrast.
- Visible focus states.
- Touch targets aligned with mobile constraints (>= 44px for primary actions).
- Clear, non-technical error and blocked messages.

## Governance Rules

- Never embed backend business logic in components.
- Never decide legal/compliance outcomes in UI.
- Never create a duplicate component without reuse justification.
- Every new or changed component must be recorded in `component-registry.md`.

## Definition Of Complete For This File

- Covers generic design system components and module-specific UI sets from Section 1.
- Covers required states and responsive/accessibility constraints.
- Remains UI-only and contract-first aligned.
