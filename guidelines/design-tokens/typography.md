# Design Tokens - Typography (Landing Page)

> Scope : Landing page uniquement. Ne s'applique PAS au dashboard.

## Font Family

| Token                  | Value            | Usage           |
|------------------------|------------------|-----------------|
| `font.family.primary`  | System default (Tailwind sans) | Tout le site |

> Note : Aucune police custom importée. La landing utilise la stack système Tailwind par défaut.

## Échelle typographique

### Titres (Headings)

| Token         | Tailwind                          | fontWeight | lineHeight | Usage                            |
|---------------|-----------------------------------|------------|------------|----------------------------------|
| `type.hero`   | `text-3xl sm:text-4xl lg:text-5xl`| 800        | 1.15       | H1 hero principal                |
| `type.h2`     | `text-3xl sm:text-4xl lg:text-5xl`| 700        | 1.2        | Section features heading         |
| `type.h2-sm`  | `text-3xl sm:text-4xl`            | 700        | inherit    | Sections intégrations, témoignages, CTA |
| `type.h3`     | `text-xl`                         | 700        | inherit    | Feature card title               |
| `type.h4`     | `text-sm`                         | 600        | inherit    | Footer category heading          |

### Corps (Body)

| Token              | Tailwind                   | fontWeight | lineHeight | Usage                         |
|--------------------|----------------------------|------------|------------|-------------------------------|
| `type.body.lg`     | `text-base sm:text-lg`     | 400        | 1.7        | Hero subtitle, CTA desc       |
| `type.body.md`     | `text-base sm:text-lg`     | 400        | 1.7        | Features section subtitle     |
| `type.body.sm`     | `text-sm`                  | 400        | 1.7        | Feature card description      |
| `type.body.quote`  | `text-base sm:text-lg`     | 400        | 1.8        | Blockquote testimonial        |

### Labels / Petits textes

| Token               | Tailwind    | fontWeight | Usage                                    |
|---------------------|-------------|------------|------------------------------------------|
| `type.label.section`| `text-sm`   | 500        | Label section (ex: "Intégrations")       |
| `type.label.badge`  | `text-xs`   | 500        | Badges hero, feature badges, tags        |
| `type.label.stat`   | `text-xs sm:text-sm` | 400 | Label stats hero                         |
| `type.label.trust`  | `text-xs`   | 400        | Trust badges, footer badges              |
| `type.label.link`   | `text-sm`   | 400        | Navbar links, footer links               |
| `type.label.legal`  | `text-sm`   | 400        | Footer copyright                         |

### Valeurs numériques / Métriques

| Token              | Tailwind                   | fontWeight | Usage                     |
|--------------------|----------------------------|------------|---------------------------|
| `type.stat.hero`   | `text-lg sm:text-xl`       | 700        | Stat value hero cards     |
| `type.stat.large`  | `text-2xl`                 | 700        | Floating card metric      |
| `type.stat.inline` | inline dans `text-sm`      | 700        | Stats inline features     |

### Boutons

| Token              | Tailwind    | fontWeight | Usage                       |
|--------------------|-------------|------------|-----------------------------|
| `type.button.primary`  | `text-sm` | 600       | Bouton CTA primaire (blanc) |
| `type.button.secondary`| `text-sm` | 500       | Bouton CTA secondaire (outline) |
| `type.button.nav`      | `text-sm` | 400       | Liens navbar                |

### Branding

| Token              | Tailwind    | fontWeight | Usage                     |
|--------------------|-------------|------------|---------------------------|
| `type.brand.name`  | `text-lg`   | 700        | "YoJob" à côté du logo    |

## Font Weights utilisés

| Token                | Value | Tailwind approx    | Usage                               |
|----------------------|-------|--------------------|--------------------------------------|
| `font.weight.regular`  | 400 | `font-normal`      | Corps, labels, liens                 |
| `font.weight.medium`   | 500 | `font-medium`      | Badges, labels section, btn outline  |
| `font.weight.semibold` | 600 | `font-semibold`    | Btn primaire, h4 footer, highlights  |
| `font.weight.bold`     | 700 | `font-bold`        | H2, H3, stats, brand name           |
| `font.weight.extrabold`| 800 | `font-extrabold`   | H1 hero uniquement                   |

## Line Heights

| Token                   | Value | Usage                                |
|-------------------------|-------|--------------------------------------|
| `font.lineheight.tight` | 1.15  | H1 hero                             |
| `font.lineheight.snug`  | 1.2   | H2 sections                         |
| `font.lineheight.relaxed`| 1.7  | Corps de texte, descriptions         |
| `font.lineheight.loose` | 1.8   | Blockquote testimonial               |

## Effets texte

| Token                   | Value                                          | Usage                    |
|-------------------------|-------------------------------------------------|--------------------------|
| `text.gradient.hero`    | `bg-gradient-to-r from-[#a2f4fd] to-[#06b6d4] bg-clip-text text-transparent` | Mot "Europe" hero |
| `text.gradient.features`| `bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent` | "85% de temps" features |
| `text.tracking`         | `tracking-tight`                               | H1 hero uniquement       |

## Governance

- Les `fontWeight` sont appliqués via `style={{ fontWeight: N }}` et non via classes Tailwind, pour garantir la valeur exacte.
- Tous les `lineHeight` custom sont appliqués via `style={{ lineHeight: N }}`.
- Le dashboard définira ses propres règles typographiques si nécessaire.
- Ne pas introduire de nouvelles tailles ou poids sans mettre à jour ce fichier.
