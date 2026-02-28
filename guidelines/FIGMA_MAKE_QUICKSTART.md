# Figma Make Quickstart - Copy/Paste

## But

- Donner a Figma Make un contexte court et actionnable.
- Eviter de charger 100+ fichiers avant de commencer.
- Garder l alignement contract-first avec le socle LOCKED.

## Path Rule (important)

- Ouvrir les fichiers par leur nom visible dans l arbre Figma.
- Ne pas dependre de chemins absolus.
- Si un fichier existe en double, privilegier celui du dossier `guidelines` actif.

## Mode de lecture (obligatoire)

- `minimal`: generation ecran/composants dans le lot actif.
- `extended`: besoin de mapping module/handoff detaille.
- `landing`: travail landing/CMS public.
- `deep`: uniquement si ambiguite contractuelle ou conflit de scope.

## Fichiers a lire par mode

### `minimal`

1. `guidelines/Guidelines.md`
2. `guidelines/overview-lot-active.md`
3. `guidelines/components/reuse-gate.md`

### `extended`

1. `guidelines/overview-screen-module-map.md`
2. `guidelines/components/component-registry.md`
3. `guidelines/overview-handoff.md`

### `landing`

1. `guidelines/landing/landing-current-state-audit.md`
2. `guidelines/landing/landing-refactor-plan.md`
3. `guidelines/landing/landing-handoff-checklist.md`
4. `guidelines/landing/landing-run-prompt.md`
5. `guidelines/landing/landing-cms-architecture.md`
6. `guidelines/landing/landing-page-template-catalog.md`
7. `guidelines/landing/landing-cms-run-prompt.md`

### `deep`

1. `guidelines/INDEX.md`
2. Puis seulement les fichiers cibles dans `guidelines/repo-docs`.

## Prompt de demarrage (session)

- Tu es assistant DESIGN/UI dans Figma Make.
- Active le mode `minimal` puis confirme le lot/module actif.
- Applique strictement `guidelines/Guidelines.md`.
- Contrainte absolue: UI/design seulement, aucune logique metier.
- Si la demande est hors lot: STOP et demande validation.

## Prompt de generation ecran (reutilisable)

1. Genere l ecran demande dans le scope du lot actif.
2. Avant creation, applique le reuse gate:
- chercher composant existant
- reutiliser ou creer variante
- creer nouveau composant seulement si necessaire
3. Livrer:
- ecran principal
- variantes desktop/mobile
- variantes d etat (default, hover, focus, disabled, loading, success, error)
- liste composants reutilises
- liste nouveaux composants + raison
- note de scope lot/module
- note de handoff backend (contraintes contractuelles)

## Prompt de controle anti-derive

1. Verifie avant de repondre:
- pas de logique metier en UI
- pas de fonctionnalite V2 en lot V1
- pas de sortie hors lot/module actif
- pas de duplication composant sans justification
2. Si une regle est incertaine: STOP et demander arbitrage.
