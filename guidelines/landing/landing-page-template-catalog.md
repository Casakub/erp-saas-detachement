# Landing - Page Template Catalog

## Purpose

- Definir des templates reutilisables pour creer rapidement des pages publiques.

## Templates

| template_id | use_case | required_slots | optional_slots |
| --- | --- | --- | --- |
| `landing_home` | page d accueil | `hero`, `proof`, `cta_final`, `footer` | `feature_grid`, `integration_strip`, `testimonial`, `faq` |
| `marketing_feature_page` | detail fonctionnalite | `hero`, `feature_grid`, `cta_final`, `footer` | `proof`, `faq` |
| `marketing_pricing_page` | plans/pricing | `hero`, `proof`, `cta_final`, `footer` | `faq`, `testimonial` |
| `marketing_integrations_page` | partenaires outils | `hero`, `integration_strip`, `cta_final`, `footer` | `proof`, `faq` |
| `marketing_resource_hub` | contenus SEO | `hero`, `proof`, `footer` | `cta_final` |
| `marketing_case_studies` | preuves clients | `hero`, `testimonial`, `cta_final`, `footer` | `proof`, `faq` |
| `legal_page` | pages legales | `hero`, `footer` | `proof` |

## Slot-Level Constraints

- `hero`: inclure CTA primaire.
- `proof`: 1 a 3 preuves max au-dessus de la ligne de flottaison.
- `feature_grid`: cards homogenes en hauteur.
- `testimonial`: controles carousel accessibles.
- `faq`: titres courts et reponses scannables.
- `cta_final`: contraste fort et action unique prioritaire.

## Variants Required

- Desktop + mobile pour chaque template.
- Etats CTA: `default`, `hover`, `focus`, `disabled`.
- Etats formulaire (si present): `default`, `error`, `success`.
