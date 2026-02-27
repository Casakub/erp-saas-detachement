# Tooling

## Objectif

- Héberger les outils utilitaires hors socle métier.
- Isoler les scripts d'assistance (dev tooling, intégrations, helpers).

## Règles

- Ne pas y placer de logique métier critique.
- Ne pas y déplacer les scripts de contrôle contractuel existants (`scripts/`).
- Garder les outils idempotents et documentés.
