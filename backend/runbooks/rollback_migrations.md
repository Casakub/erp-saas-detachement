# Runbook — Rollback migrations (forward-only)

Statut: LOCKED
Portée: correction DB par migration compensatrice uniquement

## 1) Politique

- Forward-only obligatoire.
- Interdiction de réécrire ou supprimer l’historique des migrations.

## 2) Conditions d’entrée

- Incident ou régression DB confirmé.
- Ticket d’intervention ouvert (format recommandé: `INC-xxxx`).
- Migration cible identifiée.

## 3) Procédure pas à pas

1. Identifier la migration cible:
- `ls -1 backend/migrations`
2. Créer une migration compensatrice:
- `supabase migration new rollback_<target_slug>`
3. Implémenter la correction SQL dans la migration compensatrice (sans changement métier).
4. Appliquer l’ensemble des migrations en local:
- `supabase db reset`
5. Vérifier l’absence de dérive:
- `supabase db diff`
6. Vérifier non-régression backend:
- `npm --prefix backend run test:ci`

## 4) Critères de sortie

- `supabase db reset` réussi.
- `supabase db diff` sans dérive inattendue.
- `npm --prefix backend run test:ci` au vert.

## 5) Traçabilité

- Lier la migration compensatrice au ticket d’intervention.
- Conserver un journal court: date, auteur, migration cible, migration compensatrice, résultat des vérifications.
