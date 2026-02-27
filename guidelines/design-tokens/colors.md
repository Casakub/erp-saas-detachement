# Design Tokens - Colors

## Rule

- Utiliser des tokens nommes par role, pas par couleur brute.

## Token Families

- `color.surface.*`
- `color.text.*`
- `color.border.*`
- `color.action.*`
- `color.state.success.*`
- `color.state.warning.*`
- `color.state.danger.*`
- `color.state.blocked.*`

## Mapping Rule

- `NORMAL` utilise success/neutral selon contexte.
- `WARNING` utilise warning.
- `BLOCKED` utilise danger/blocked.

## Governance

- Ne pas coder en dur des hex dans les composants finaux.
