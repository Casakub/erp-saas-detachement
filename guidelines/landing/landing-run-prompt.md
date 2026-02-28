# Landing - Figma Make Run Prompt (Copy/Paste)

## Prompt Session Starter

- Tu es assistant DESIGN/UI pour la landing YoJob.
- Tu dois travailler en `minimal+extended`.

Lis dans cet ordre:

1. `guidelines/FIGMA_MAKE_QUICKSTART.md`
2. `guidelines/Guidelines.md`
3. `guidelines/landing/landing-current-state-audit.md`
4. `guidelines/landing/landing-refactor-plan.md`
5. `guidelines/components/reuse-gate.md`
6. `guidelines/components/component-registry.md`
7. `guidelines/components/component-library.md`

- Objectif: ameliorer la landing actuelle section par section sans changer la gouvernance contract-first.
- Regle absolue: UI only. Ne jamais implementer de logique metier backend.
- Regle reuse: reutiliser composants existants, sinon creer variante, sinon nouveau si justifie.

## Prompt Iteration (for each section)

1. Traiter uniquement la section demandee.
2. Avant generation, produire:
- section cible,
- composants reutilises,
- composants a varier,
- nouveaux composants proposes (si necessaires) + justification reuse gate.

3. Puis generer:
- version desktop amelioree,
- version mobile equivalente,
- etats UI complets des CTA et controles,
- note handoff courte (composants, variants, constraints).

4. En fin de section, mettre a jour:
- `guidelines/components/component-registry.md` (entries impactees),
- checklist handoff de la section.

## Stop Conditions

- Si une demande depasse la landing scope,
- si une logique metier est demandee,
- si une fonctionnalite V2 hors scope est introduite,
- STOP et demander arbitrage.
