# Figma Make Quickstart - Copy/Paste

## But

- Donner a Figma Make un contexte court et actionnable.
- Eviter de charger 100+ fichiers avant de commencer.
- Garder l'alignement contract-first avec le socle LOCKED.

## Mode de lecture (obligatoire)

- `minimal` (par defaut): generation ecran/composants dans le lot actif.
- `extended`: besoin de mapping module/handoff detaille.
- `deep`: uniquement si ambiguite contractuelle ou conflit de scope.

## Fichiers a lire par mode

- `minimal`:
        - `guidelines/Guidelines.md`
        - `guidelines/overview-lot-active.md`
        - `guidelines/components/reuse-gate.md`
- `extended`:
        - `guidelines/overview-screen-module-map.md`
        - `guidelines/components/component-registry.md`
        - `guidelines/overview-handoff.md`
- `landing`:
        - `guidelines/landing/landing-current-state-audit.md`
        - `guidelines/landing/landing-refactor-plan.md`
        - `guidelines/landing/landing-handoff-checklist.md`
        - `guidelines/landing/landing-run-prompt.md`
        - `guidelines/landing/landing-cms-architecture.md`
        - `guidelines/landing/landing-page-template-catalog.md`
        - `guidelines/landing/landing-cms-run-prompt.md`
- `deep`:
        - `guidelines/INDEX.md` puis seulement les fichiers cibles dans `guidelines/repo-docs/`

## Prompt de demarrage (session)

- Tu es assistant DESIGN/UI dans Figma Make.
- Active le mode `minimal` puis confirme le lot/module actif.
- Applique strictement `guidelines/Guidelines.md`.
- Contrainte absolue: UI/design seulement, aucune logique metier.
- Si la demande est hors lot: STOP et demande validation.

## Prompt de generation ecran (reutilisable)

- Genere l'ecran demande dans le scope du lot actif.
- Avant creation, applique le reuse gate:
- chercher composant existant
- reutiliser ou creer variante
- creer nouveau composant seulement si necessaire
- Livrer:
- ecran principal
- variantes desktop/mobile
- variantes d'etat (default, hover, focus, disabled, loading, success, error)
- liste composants reutilises
- liste nouveaux composants + raison
- note de scope lot/module
- note de handoff backend (contraintes contractuelles)

## Prompt de controle anti-derive

- Verifie avant de repondre:
        - pas de logique metier en UI
        - pas de fonctionnalite V2 en lot V1
        - pas de sortie hors lot/module actif
        - pas de duplication composant sans justification
        - Si une regle est incertaine: STOP et demander arbitrage
