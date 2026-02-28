# Landing - Current State Audit (from Screenshots)

## Contexte

- Cette page decrit l etat actuel observe dans les captures de la landing.
- Elle sert de baseline avant toute regeneration par Figma Make.

## Sections identifiees

1. Header fixe avec navigation: `Fonctionnalites`, `Tarifs`, `Integrations`, `Ressources`, `Connexion`, CTA `Essai gratuit`.
2. Hero gradient avec:
- promesse principale,
- bloc stats,
- CTA principal + secondaire,
- visual card produit.
3. Bloc value proposition + cards features (grille).
4. Bloc integrations (logos/cards outils).
5. Bloc temoignage (carousel).
6. Bloc CTA final.
7. Footer multi-colonnes (Produit, Entreprise, Ressources, Legal).

## Points solides observes

- Direction visuelle coherente (bleu/violet/cyan) sur l ensemble de la page.
- Bonne hierarchie visuelle hero -> preuves -> integrations -> preuve sociale -> CTA final.
- Composants reutilisables deja presents (cards, badges, CTA, navbar, footer).
- Lisibilite globale correcte sur desktop.

## Ecarts potentiels a corriger

- Cohesion des espacements verticaux entre sections a standardiser.
- Uniformisation des variants de badges et chips (couleur, radius, padding).
- Uniformisation des cartes feature (alignements icone/titre/texte/tags).
- Definir explicitement les etats de CTA (hover/focus/disabled/loading).
- Definir et documenter les etats responsive mobile/tablet (non visibles dans les captures desktop).
- Verifier contraste a11y sur textes secondaires dans les zones gradient.
- Formaliser le carrousel temoignage (etats active/inactive/focus des controles).
- Harmoniser le footer (rythme colonnes, poids typographiques, liens).

## Contrainte de gouvernance (rappel)

- La landing peut etre generee en code UI.
- Aucune logique metier decisionnelle backend ne doit etre introduite dans Figma.
- Les integrations/SEO/CMS restent modeles comme surfaces UI et champs, pas logique executable.

## Baseline d execution

- Statut de baseline: `ready_for_refactor_run`.
- Priorite: coherence composants + etats + responsive + handoff propre.
