# Runbook — Bootstrap local backend V1.1

Statut: LOCKED
Portée: démarrage local backend sans secret réel

## 1) Pré-requis machine

- `node --version` (attendu: Node.js 20.x)
- `npm --version`
- `supabase --version`

## 2) Initialisation environnement

- `test -f backend/.env || cp backend/.env.example backend/.env`
- Vérifier que `backend/.env` ne contient aucune valeur secrète réelle commitable.

## 3) Réinitialisation DB locale

- `supabase db reset`

## 4) Installation dépendances backend

- `npm --prefix backend install`

## 5) Démarrage backend

- Option dev: `npm --prefix backend run dev`
- Option start: `npm --prefix backend run start`

## 6) Healthcheck minimal

- `curl -fsS "http://127.0.0.1:${PORT:-3000}/health"`

## 7) Critères de succès

- Commandes exécutées sans erreur bloquante.
- Le healthcheck retourne un statut succès.
