# Components - Reuse Gate

## Mandatory Sequence

1. Chercher un composant equivalent dans la bibliotheque locale.
2. Si equivalent trouve:
- reutiliser tel quel, ou
- ajouter une variante/etat.
3. Si aucun equivalent:
- creer un nouveau composant.
4. Documenter la decision dans le registre composants.

## Anti Duplication Rules

- Interdiction de creer un doublon visuel/fonctionnel sans justification.
- Priorite aux variantes avant creation d'un composant nouveau.
- Un composant nouveau doit avoir un scope module clair.

## Variants Checklist

- `default`
- `hover`
- `focus`
- `disabled`
- `loading`
- `success` (si pertinent)
- `error` (si pertinent)
- `warning`/`blocked` (si pertinent)
