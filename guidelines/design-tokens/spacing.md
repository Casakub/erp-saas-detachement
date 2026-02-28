# Design Tokens - Spacing (Landing Page)

> Scope : Landing page uniquement. Ne s'applique PAS au dashboard.

## Échelle de spacing utilisée

| Token      | Tailwind     | px    | Usage principal                                      |
|------------|-------------|-------|------------------------------------------------------|
| `space.1`  | `gap-1`     | 4px   | Gap étoiles rating, dots indicateurs                  |
| `space.1.5`| `gap-1.5`   | 6px   | Gap icône + texte trust badges                        |
| `space.2`  | `gap-2`     | 8px   | Gap inline badges, tags, dots navigation              |
| `space.2.5`| `gap-2.5`   | 10px  | Gap logo + texte navbar, liens footer                 |
| `space.3`  | `gap-3`     | 12px  | Gap stats grid, CTA buttons, integration cards        |
| `space.4`  | `gap-4`     | 16px  | Gap trust badges, footer badges, section label mb     |
| `space.6`  | `gap-6`     | 24px  | Gap badges section header, feature card mb, mb titre  |
| `space.8`  | `gap-8`     | 32px  | Gap contenu hero (flex col), grid footer cols         |

## Padding sections

| Token                  | Tailwind          | Usage                                    |
|------------------------|-------------------|------------------------------------------|
| `section.py.default`  | `py-20` (80px)    | Section intégrations                      |
| `section.py.large`    | `py-24` (96px)    | Sections features, testimonials, CTA      |
| `section.hero.pt`     | `pt-32` (128px)   | Hero top (navbar clearance)               |
| `section.hero.pb`     | `pb-20` (80px)    | Hero bottom                               |

## Padding composants

| Token                    | Tailwind           | Usage                                  |
|--------------------------|---------------------|----------------------------------------|
| `card.padding.sm`        | `p-4` (16px)       | Stat cards, floating card, integration |
| `card.padding.md`        | `p-8` (32px)       | Feature cards, testimonial card        |
| `card.padding.lg`        | `p-12` (48px)      | Testimonial card (sm+), CTA inner      |
| `card.padding.xl`        | `p-16` / `p-20`    | CTA inner (sm+ / lg+)                 |
| `button.px`              | `px-5` / `px-6`    | Buttons standard                       |
| `button.px.lg`           | `px-8`             | Buttons CTA large                      |
| `button.py`              | `py-2` / `py-2.5`  | Buttons standard                       |
| `button.py.lg`           | `py-3` / `py-3.5`  | Buttons CTA large                      |

## Container

| Token                  | Value              | Usage                               |
|------------------------|--------------------|--------------------------------------|
| `container.max`        | `max-w-7xl`        | Container principal (1280px)         |
| `container.text`       | `max-w-3xl`        | Section headers features             |
| `container.text-sm`    | `max-w-2xl`        | CTA texte, blockquote                |
| `container.text-xs`    | `max-w-xl`         | Hero subtitle, intégrations subtitle |
| `container.card`       | `max-w-md`         | Hero right card                      |
| `container.integrations`| `max-w-4xl`       | Grid intégrations, testimonials      |
| `container.px`         | `px-4 sm:px-6 lg:px-8` | Padding horizontal responsive   |

## Border Radius

| Token            | Tailwind       | px    | Usage                                    |
|------------------|---------------|-------|------------------------------------------|
| `radius.sm`      | `rounded`      | 4px   | Petits éléments (dots intégration)        |
| `radius.md`      | `rounded-lg`   | 8px   | Boutons icon, bg intégration              |
| `radius.lg`      | `rounded-xl`   | 12px  | Cartes intégration, floating card, tags   |
| `radius.xl`      | `rounded-2xl`  | 16px  | Feature cards, stat cards                 |
| `radius.2xl`     | `rounded-3xl`  | 24px  | Hero map card, testimonial card, CTA      |
| `radius.full`    | `rounded-full` | 9999  | Badges, boutons CTA, avatars, dots       |

## Shadows

| Token              | Tailwind / Value                              | Usage                           |
|--------------------|-----------------------------------------------|---------------------------------|
| `shadow.sm`        | `shadow-lg shadow-black/10`                   | Bouton navbar                   |
| `shadow.md`        | `shadow-lg shadow-[rgba(0,184,219,0.3)]`      | Badge hero                      |
| `shadow.lg`        | `shadow-xl shadow-black/25`                   | Bouton CTA primaire             |
| `shadow.xl`        | `shadow-2xl shadow-black/25`                  | Hero map card                   |
| `shadow.feature`   | `shadow-xl shadow-[#7c3aed]/5`               | Feature card hover              |
| `shadow.logo-glow` | `0px 0px Npx rgba(6,182,212,0.91), ...`       | Logo glow effect (scalable)     |
| `shadow.logo-inner`| `0px 0px Npx rgba(255,255,255,0.8)`           | Logo inner glow                 |

## Blur (backdrop & decorative)

| Token              | Value            | Usage                            |
|--------------------|------------------|----------------------------------|
| `blur.navbar`      | `backdrop-blur-xl` | Navbar glassmorphism            |
| `blur.card`        | `backdrop-blur-sm` | Cartes glass sur fond gradient  |
| `blur.card-strong` | `backdrop-blur-md` | Floating card, testimonial card |
| `blur.blob.sm`     | `blur-[60px]`    | Petits blobs décoratifs          |
| `blur.blob.md`     | `blur-[80px]`    | Blobs moyens                     |
| `blur.blob.lg`     | `blur-[100px]`   | Grands blobs hero                |
| `blur.blob.xl`     | `blur-[120px]`   | Très grands blobs sections       |

## Grids

| Token                    | Tailwind                              | Usage                    |
|--------------------------|---------------------------------------|--------------------------|
| `grid.hero`              | `lg:grid-cols-2 gap-12 lg:gap-16`    | Hero layout              |
| `grid.stats`             | `grid-cols-3 gap-3`                  | Stats hero               |
| `grid.features`          | `md:grid-cols-2 lg:grid-cols-3 gap-6`| Feature cards            |
| `grid.integrations`      | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4` | Intégrations |
| `grid.footer`            | `grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12` | Footer         |

## Governance

- Toujours utiliser des valeurs Tailwind standard (multiples de 4px).
- Les seules valeurs custom autorisées sont pour les blurs décoratifs (`blur-[Npx]`).
- Le dashboard définira ses propres espacements si nécessaire.
