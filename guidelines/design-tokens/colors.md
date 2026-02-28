# Design Tokens - Colors (Landing Page)

> Scope : Landing page uniquement. Ne s'applique PAS au dashboard.

## Palette primaire (dégradé signature)

| Token                  | Hex        | Usage                                                    |
|------------------------|------------|----------------------------------------------------------|
| `color.primary.deep`   | `#1e3a8a`  | Bleu profond — navbar bg, hero gradient start, CTA text  |
| `color.primary.violet` | `#7c3aed`  | Violet — gradient milieu, badges, feature icons          |
| `color.primary.cyan`   | `#06b6d4`  | Cyan — gradient end, accents, dots indicateurs           |

## Accent / Glow

| Token                  | Hex        | Usage                                                    |
|------------------------|------------|----------------------------------------------------------|
| `color.accent.ice`     | `#a2f4fd`  | Cyan clair — texte accent, trust badges, labels stats, liens hover footer |
| `color.accent.glow-cyan` | `rgba(6,182,212,0.91)` | Glow logo & éléments glassmorphism               |
| `color.accent.glow-violet` | `rgba(124,58,237,0.51)` | Glow logo secondaire                         |

## Dégradés (gradients)

| Token                          | Value                                            | Usage                          |
|--------------------------------|--------------------------------------------------|--------------------------------|
| `gradient.hero`                | `from-[#1e3a8a] via-[#7c3aed] to-[#06b6d4]`     | Hero section bg                |
| `gradient.integrations`        | `from-[#1e3a8a] via-[#2d1b69] to-[#1e3a8a]`     | Section intégrations bg        |
| `gradient.testimonials`        | `from-[#06b6d4] via-[#7c3aed] to-[#1e3a8a]`     | Section témoignages bg         |
| `gradient.cta`                 | `from-[#1e3a8a] via-[#7c3aed] to-[#06b6d4]`     | CTA card bg                    |
| `gradient.text-highlight`      | `from-[#a2f4fd] to-[#06b6d4]`                    | Texte accent gradient (hero)   |
| `gradient.text-highlight-alt`  | `from-[#7c3aed] to-[#06b6d4]`                    | Texte accent gradient (features) |
| `gradient.avatar`              | `from-[#06b6d4] to-[#7c3aed]`                    | Avatar testimonial             |

## Feature card gradients (icônes)

| Token                        | Value                                    |
|------------------------------|------------------------------------------|
| `gradient.icon.violet-blue`  | `from-[#7c3aed] to-[#1e3a8a]`           |
| `gradient.icon.cyan-blue`    | `from-[#06b6d4] to-[#1e3a8a]`           |
| `gradient.icon.blue-cyan`    | `from-[#1e3a8a] to-[#06b6d4]`           |
| `gradient.icon.violet-cyan`  | `from-[#7c3aed] to-[#06b6d4]`           |
| `gradient.icon.blue-violet`  | `from-[#1e3a8a] to-[#7c3aed]`           |
| `gradient.icon.cyan-violet`  | `from-[#06b6d4] to-[#7c3aed]`           |

## Surfaces

| Token                          | Value                           | Usage                                        |
|--------------------------------|---------------------------------|----------------------------------------------|
| `color.surface.glass`         | `rgba(255,255,255,0.10)`        | Cartes glassmorphism sur fond sombre          |
| `color.surface.glass-strong`  | `rgba(255,255,255,0.15)`        | Cartes glassmorphism appuyées (floating card) |
| `color.surface.glass-logo`    | `rgba(255,255,255,0.25)`        | Background logo                               |
| `color.surface.white`         | `#ffffff`                       | Sections claires (features, CTA wrapper)      |
| `color.surface.dark`          | `#0f172a`                       | Footer bg                                      |
| `color.surface.navbar`        | `rgba(30,58,138,0.85)`          | Navbar (blur + semi-transparent)              |
| `color.surface.navbar-mobile` | `rgba(30,58,138,0.95)`          | Navbar mobile menu                             |

## Bordures

| Token                     | Value                    | Usage                         |
|---------------------------|--------------------------|-------------------------------|
| `color.border.glass`      | `rgba(255,255,255,0.10)` | Bordure par défaut sur sombre |
| `color.border.glass-md`   | `rgba(255,255,255,0.20)` | Bordure cartes glassmorphism  |
| `color.border.glass-strong` | `rgba(255,255,255,0.25)` | Bordure carte floating      |
| `color.border.glass-logo` | `rgba(255,255,255,0.40)` | Bordure logo glow             |
| `color.border.light`      | Tailwind `gray-100`      | Bordure cartes features       |

## Texte

| Token                      | Value              | Usage                                     |
|----------------------------|--------------------|-------------------------------------------|
| `color.text.on-dark`       | `#ffffff`          | Titres & texte principal sur fond sombre   |
| `color.text.on-dark-muted` | `rgba(255,255,255,0.80)` | Texte secondaire sur fond sombre    |
| `color.text.on-dark-subtle`| `rgba(255,255,255,0.60)` | Texte tertiaire sur fond sombre     |
| `color.text.on-dark-faint` | `rgba(255,255,255,0.70)` | Trust badges                        |
| `color.text.on-light`      | Tailwind `gray-900`| Titres sur fond clair                      |
| `color.text.on-light-muted`| Tailwind `gray-500`| Texte secondaire sur fond clair            |
| `color.text.on-light-body` | Tailwind `gray-700`| Texte corps sur fond clair (highlights)    |
| `color.text.on-light-sub`  | Tailwind `gray-400`| Footer liens, descriptions                 |
| `color.text.cta-primary`   | `#1e3a8a`          | Texte bouton primaire (blanc bg)           |

## Effets décoratifs (blurs)

| Token                       | Value                       | Usage                         |
|-----------------------------|-----------------------------|-------------------------------|
| `color.blur.cyan`           | `#00d3f3` (opacity 15-20%)  | Blob décoratif cyan           |
| `color.blur.violet`         | `#ad46ff` (opacity 20%)     | Blob décoratif violet         |
| `color.blur.blue`           | `#51a2ff` (opacity 20%)     | Blob décoratif bleu           |
| `color.blur.purple`         | `#c27aff` (opacity 10%)     | Blob décoratif purple clair   |

## États (feedback)

| Token                      | Hex        | Usage                  |
|----------------------------|------------|------------------------|
| `color.state.star`         | `#FDC700`  | Étoiles rating         |
| `color.state.metric`       | `#f0b100`  | Dot indicateur métric  |

## Badges feature cards

| Token                         | Pattern                                        |
|-------------------------------|-------------------------------------------------|
| `color.badge.violet`         | `bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20` |
| `color.badge.cyan`           | `bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20` |
| `color.badge.blue`           | `bg-[#1e3a8a]/10 text-[#1e3a8a] border-[#1e3a8a]/20` |
| `color.tag.default`          | `from-[#7c3aed]/5 to-[#06b6d4]/5 border-[#7c3aed]/10 text-[#7c3aed]` |

## Intégrations (couleurs tierces)

| Service      | Hex        |
|-------------|------------|
| YouSign     | `#155DFC`  |
| DocuSign    | `#FB2C36`  |
| Silae       | `#00A63E`  |
| Google Drive| `#4285F4`  |
| SharePoint  | `#2B7FFF`  |
| Slack       | `#E01E5A`  |

## Governance

- Les hex primaires (`#1e3a8a`, `#7c3aed`, `#06b6d4`, `#a2f4fd`) sont les SEULS autorisés comme couleurs de marque.
- Les couleurs tierces (intégrations) ne doivent pas être utilisées hors de leur contexte.
- Le dashboard utilisera sa propre palette (à définir séparément).
