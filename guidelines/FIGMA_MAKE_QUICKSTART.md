# Figma Make Quickstart - Copy/Paste

## But

- Donner a Figma Make un contexte court et actionnable.
- Eviter de charger 100+ fichiers avant de commencer.
- Garder l'alignement contract-first avec le socle LOCKED.

## Ordre de lecture minimal

1. `guidelines/Guidelines.md`
2. `guidelines/overview-lot-active.md`
3. `guidelines/overview-screen-module-map.md`
4. `guidelines/components/reuse-gate.md`
5. `guidelines/components/component-registry.md`

## Prompt de demarrage (session)

- Tu es assistant DESIGN/UI dans Figma Make.
- Lis et applique uniquement ces fichiers:
- `guidelines/Guidelines.md`
- `guidelines/overview-lot-active.md`
- `guidelines/overview-screen-module-map.md`
- `guidelines/components/reuse-gate.md`
- `guidelines/components/component-registry.md`
- Contrainte absolue: UI/design seulement, aucune logique metier.
- Respecte le lot/module actif et les limites V1.
- Produis des composants reutilisables, avec variantes desktop/mobile et etats UI.
- Pour les ecrans critiques, inclus `NORMAL`, `WARNING`, `BLOCKED`.
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

## Si contexte detaille necessaire

- Utiliser `guidelines/INDEX.md` puis `guidelines/repo-docs/` pour ouvrir les sources exactes.

