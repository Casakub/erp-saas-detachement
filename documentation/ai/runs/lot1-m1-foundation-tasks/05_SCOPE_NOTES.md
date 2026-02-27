# Scope Notes — Lot 1 / M1 Foundation (Tasks)

## Constat de perimetre

- La surface M1 explicitement presente dans OpenAPI 2.11 LOCKED pour ce run couvre les endpoints `tasks`.
- Les endpoints M1 additionnels mentionnes dans certains prompts module doivent etre traites via `CONFLICT GATE` s'ils ne sont pas presents dans les surfaces OpenAPI contractuelles actives du repo.

## Regle d'execution

- Executer ce pack sur le scope `tasks` uniquement.
- Si un besoin impose un endpoint M1 hors scope `tasks`, stopper et ouvrir un arbitrage contractuel avant code.

## References a verifier a chaque run

- `2.11` (surfaces endpoint actives)
- `2.10` (events autorises)
- `2.9` (tables support)
- `2.12` (RBAC endpoint)
- `SECTION 9` (conventions d'execution)
