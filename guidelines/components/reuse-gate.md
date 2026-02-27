# Components - Reuse Gate Contract (V1)

## Purpose

- Enforcer une regle unique: reutiliser avant de creer.
- Eviter les doublons visuels/fonctionnels dans Figma Make.
- Standardiser la decision `reutilise` vs `variante` vs `nouveau`.

## Scope

- S applique a toute demande `screen_generation` et `component_work`.
- S applique a tous les modules `M1..M13` et `M7bis`.
- Fonctionne avec `component-library.md` et `component-registry.md`.

## Inputs Required Before Decision

- `lot_id` et `module_id` actifs.
- `screen_ref` cible.
- type de composant demande (navigation, data, form, card, etc.).
- etats UI requis (`default`, `hover`, `focus`, `disabled`, `loading`, `success`, `warning`, `error`, `blocked` selon cas).
- cible responsive (`desktop_only`, `mobile_only`, `desktop_mobile`).

## Mandatory Sequence

1. Verifier le scope lot/module.
2. Rechercher composants candidats dans `component-registry.md`.
3. Evaluer la similarite fonctionnelle avec la grille ci-dessous.
4. Appliquer le seuil de decision.
5. Documenter la decision de reuse dans le registre.
6. Generer uniquement apres mise a jour du registre.

## Similarity Grid (0 or 1 per criterion)

| Criterion | Question | Score |
| --- | --- | --- |
| Function | Meme fonction UI principale ? | 0/1 |
| Interaction | Meme pattern interaction (click, select, edit, submit) ? | 0/1 |
| Data shape | Meme structure de donnees affichees/saisies ? | 0/1 |
| State model | Etats requis compatibles ? | 0/1 |
| Responsive | Meme cible responsive ? | 0/1 |
| Visual family | Meme famille visuelle (card, table, modal, badge, form) ? | 0/1 |

Total score sur 6.

## Decision Thresholds

- `5-6`: `reutilise` (aucun nouveau composant).
- `3-4`: `variante` (creer extension du composant parent).
- `0-2`: `nouveau` (creation autorisee).

## Hard Rules

- Interdiction de creer un doublon si un composant a score >= 5.
- Priorite a `variante` avant `nouveau` si score 3-4.
- Toute variante doit referencer un parent explicite.
- Tout composant nouveau doit avoir un scope module explicite.
- Toute action critique doit couvrir `warning` et `blocked` si applicable.

## Allowed Exceptions (strict)

Creation d un nouveau composant autorisee meme si un candidat existe, uniquement si:

- contrainte mobile specifique (`mobile_only`) impossible avec le parent,
- contrainte accessibilite non compatible avec le parent,
- contrainte semantique metier UI (sans logique metier) non couverte par la famille existante,
- contrainte layout majeure non resolvable par variante.

Dans ce cas, `reuse_decision` doit inclure une raison courte et testable.

## Required Registry Evidence

Pour chaque decision, renseigner au minimum dans `component-registry.md`:

- `component_id`
- `type` (`reutilise` / `variante` / `nouveau`)
- `lot_module`
- `screen_refs`
- `states`
- `responsive`
- `reuse_decision` (mention du parent si variante)
- `status`

## Decision Output Format (mandatory)

Pour chaque composant traite, produire:

- `decision`: reutilise | variante | nouveau
- `candidate_parent`: component_id ou `none`
- `similarity_score`: X/6
- `reason`: phrase courte
- `registry_update`: oui/non

## Variant Checklist

- `default`
- `hover`
- `focus`
- `disabled`
- `loading`
- `success` (if relevant)
- `warning` (if relevant)
- `error` (if relevant)
- `blocked` (if relevant)

## Anti-Patterns (blocked)

- Dupliquer un composant pour changer uniquement couleur/label.
- Creer un composant local ecran sans entree registre.
- Creer une variante sans parent explicite.
- Utiliser un composant hors lot/module sans verification.
- Introduire logique metier backend dans le composant.

## Quality Gate Before Generation

- lot/module valide.
- decision de reuse tracee.
- registre mis a jour.
- etats requis couverts.
- cible responsive couverte.
- a11y verifiee ou marquee `pending` avec plan.

## Operational Rule

- En cas de doute: STOP generation, demander arbitrage, puis reprendre le gate.
- Sans passage `Reuse Gate`, un composant ne doit pas etre cree.
