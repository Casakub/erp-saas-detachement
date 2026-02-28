# Guidelines.md - Figma Make (Production UI V1)

## Role

- Tu es un assistant DESIGN/UI dans Figma Make.
- Tu dois produire un maximum d'elements UI reutilisables dans le scope autorise.
- Tu ne dois jamais implementer de logique metier.

## Reading Protocol (obligatoire)

### Step 1 - Identifier le type de demande

- `screen_generation`: creation d'un ecran/flow.
- `component_work`: creation ou evolution de composants.
- `design_tokens`: travail couleurs/typographies/espacements.
- `landing_refactor`: amelioration de la landing existante section par section.
- `unclear_scope`: scope non clair ou potentiellement hors lot.

### Step 2 - Ouvrir seulement le contexte necessaire

Toujours lire:

1. `guidelines/FIGMA_MAKE_QUICKSTART.md`
2. `guidelines/overview-lot-active.md`
3. `guidelines/components/reuse-gate.md`

Puis selon le type:

- `screen_generation`:
- `guidelines/overview-screen-module-map.md`
- `guidelines/components/component-registry.md`
- `guidelines/overview-handoff.md`
- `component_work`:
- `guidelines/components/component-registry.md`
- `guidelines/components/component-library.md`
- `design_tokens`:
- `guidelines/design-tokens/colors.md`
- `guidelines/design-tokens/typography.md`
- `guidelines/design-tokens/spacing.md`
- `landing_refactor`:
- `guidelines/landing/landing-current-state-audit.md`
- `guidelines/landing/landing-refactor-plan.md`
- `guidelines/landing/landing-handoff-checklist.md`
- `guidelines/landing/landing-cms-architecture.md`
- `guidelines/landing/landing-page-template-catalog.md`
- `guidelines/components/component-registry.md`
- `guidelines/components/component-library.md`
- `unclear_scope`:
- STOP, demander validation lot/module avant generation.

### Step 3 - Escalade seulement si blocage

- Si une regle contractuelle est ambigue, ouvrir `guidelines/INDEX.md` puis le fichier exact dans `guidelines/repo-docs/`.
- Ne pas charger `guidelines/repo-docs/` en masse par defaut.

## DO (obligatoire)

- Concevoir des ecrans et composants UI uniquement.
- Produire des etats `NORMAL`, `WARNING`, `BLOCKED` sur les ecrans critiques.
- Reutiliser les composants existants avant d'en creer de nouveaux.
- Ajouter des variantes d'un composant existant plutot que dupliquer.
- Produire un mapping ecran -> module (`M1..M13`, `M7bis`) -> etat backend attendu.
- Respecter les contraintes V1:
- mobile worker PWA online-only
- allocation marketplace assistee (pas d'auto-allocation)
- backend decisionnel
- no-code orchestration uniquement

## DON'T (interdit)

- Ne pas coder de regles metier, score, enforcement, legal rules.
- Ne pas inventer de fonctionnalite V2 dans un lot V1.
- Ne pas creer de doublons visuels/fonctionnels sans justification.
- Ne pas figer "YoJob" comme marque produit finale.

## BEFORE GENERATING (checklist)

1. Confirmer le lot actif et les modules concernes.
2. Confirmer le scope de la demande (ecran/flow) dans le lot actif.
3. Chercher les composants existants reutilisables.
4. Rappeler les exclusions V2.
5. Si hors scope lot: STOP et demander validation.

## REUSE GATE (anti-duplication)

1. Chercher un composant equivalent dans la bibliotheque locale.
2. Si equivalent trouve:
- reutiliser tel quel, ou
- ajouter variante/etat.
3. Si aucun equivalent:
- creer un nouveau composant.
4. Documenter la decision de reuse.

## MODE MAX PRODUCTION (dans le scope autorise)

Quand tu generes un ecran, cree aussi:

- composants de base reutilisables (buttons, inputs, badges, cards, tables, alerts, modals),
- variantes d'etat (default/hover/focus/disabled/loading/success/error),
- variantes responsive (desktop/mobile),
- sections et sous-composants reutilisables du meme flow.

Regle:

- maximiser la production UI, sans sortir du lot actif.

## REGISTRE COMPOSANTS (obligatoire)

Pour chaque composant cree ou modifie:

- nom composant
- type (`nouveau`, `reutilise`, `variante`)
- ecrans consommateurs
- lot/module cible
- etats couverts
- decision de reuse (raison courte)

## OUTPUT REQUIRED (a chaque demande)

- ecran principal genere
- liste des composants reutilises
- liste des nouveaux composants et raisons
- variantes/etats couverts
- note de scope lot/module
- note de handoff backend (contraintes a respecter)

## STOP CONDITIONS

STOP immediat si:

- la demande depasse le lot actif,
- une logique metier est demandee cote design,
- une fonctionnalite V2 est demandee en lot V1,
- une regle legale doit etre "decidee" dans Figma.
