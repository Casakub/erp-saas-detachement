# Landing - CMS Architecture (Public Pages, SEO, i18n)

## Goal

- Garder le style visuel actuel de la landing.
- Rendre le systeme scalable pour ajouter des pages publiques sans dette UX.
- Definir un cadre CMS interne clair, SEO-ready et multilingue.

## Non-Negotiable Rules

- Conserver la direction visuelle actuelle (palette, rythme, ton premium B2B).
- Ne pas introduire de logique metier backend dans Figma Make.
- Reutiliser les composants du registre avant toute creation.
- Produire desktop et mobile pour toute page publique critique.

## Public Information Architecture

| page_id | slug | template | purpose | module |
| --- | --- | --- | --- | --- |
| `home` | `/` | `landing_home` | conversion principale | `M13` |
| `features` | `/features` | `marketing_feature_page` | details produit | `M13` |
| `pricing` | `/pricing` | `marketing_pricing_page` | plans et CTA | `M13` |
| `integrations` | `/integrations` | `marketing_integrations_page` | confiance techno | `M13` |
| `resources` | `/resources` | `marketing_resource_hub` | contenus SEO | `M13` |
| `case-studies` | `/case-studies` | `marketing_case_studies` | preuve sociale | `M13` |
| `about` | `/about` | `marketing_about_page` | credibilite | `M13` |
| `contact` | `/contact` | `marketing_contact_page` | capture leads | `M13` |
| `legal-cgu` | `/legal/cgu` | `legal_page` | legal | `M13` |
| `legal-privacy` | `/legal/confidentialite` | `legal_page` | legal | `M13` |
| `legal-cookies` | `/legal/cookies` | `legal_page` | legal | `M13` |

## Template Model

Chaque template public doit exposer des slots standards:

| slot_id | required | notes |
| --- | --- | --- |
| `hero` | yes | promesse + CTA |
| `proof` | yes | chiffres, badges, preuves |
| `feature_grid` | optional | cards fonctionnalites |
| `integration_strip` | optional | logos/outils |
| `testimonial` | optional | preuve sociale |
| `faq` | optional | SEO + conversion |
| `cta_final` | yes | action principale |
| `footer` | yes | navigation secondaire + legal |

## CMS Internal Screens (Design Scope)

| screen_id | purpose |
| --- | --- |
| `cms_page_list` | lister pages, statut, langue, date update |
| `cms_page_editor` | editer blocs d une page |
| `cms_block_editor` | configurer contenu des slots |
| `cms_seo_panel` | gerer meta/og/canonical/robots |
| `cms_translation_panel` | gerer source et variantes langue |
| `cms_preview` | preview desktop/mobile avant publication |
| `cms_publish_dialog` | validation finale de publication |

## Content Model (UI Contract)

### Page Level

- `page_id`
- `slug`
- `template`
- `status` (`draft`, `in_review`, `approved`, `published`, `archived`)
- `locale_default`
- `updated_at`

### SEO Level

- `meta_title`
- `meta_description`
- `og_title`
- `og_description`
- `og_image`
- `canonical_url`
- `robots_index`
- `robots_follow`
- `sitemap_inclusion`

### i18n Level

- `locale` (`fr`, `en`, `pl`, `ro`)
- `translation_status` (`not_started`, `machine_draft`, `in_review`, `approved`, `published`)
- `source_version`
- `translator_notes`

## Publishing Workflow

1. `draft`
2. `in_review`
3. `approved`
4. `published`
5. `archived`

Rule:
- publication seulement apres validation humaine.

## SEO Contract (Design)

- H1 unique par page.
- Hierarchie H2/H3 lisible.
- Zone FAQ structurante.
- Emplacement donnees structurees (placeholder schema.org).
- Liens internes explicites entre pages publiques.
- Canonical et robots visibles dans UI CMS.
- Controle sitemap visible dans UI CMS.

## i18n Contract (Design)

- Langues cibles V1: `fr`, `en`, `pl`, `ro`.
- Layout resilient aux variations longueur texte.
- Fallback visuel sur langue par defaut si traduction absente.
- Etat traduction visible dans la liste de pages et dans l editeur.

## Style Preservation Guardrail

- Ne pas changer la direction visuelle globale (gradient, contraste, tone of voice, style composants).
- Optimiser coherence, densite, a11y et responsive sans casser l identite actuelle.

## Handoff Required

- `page_id`
- `slug`
- `template`
- `slots_used`
- `components_reused`
- `components_created_or_variants`
- `seo_fields_surface`
- `i18n_fields_surface`
- `states_covered`
- `constraints_notes`

## Done Criteria

- Architecture pages publiques definie.
- Templates et slots formalises.
- Surfaces CMS interne formalisees.
- Champs SEO/i18n formalises.
- Handoff standard complet.
