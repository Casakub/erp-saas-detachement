# RELEASE PACK V1.2 — OPEN ITEMS (Post-QA)

- **Statut**: DRAFT V1.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Portée**: Items ouverts à l'issue du QA Final V1.2 — non bloquants pour lancer le build Lot 1.

---

> Ce document liste **uniquement** les items réellement ouverts. Il est intentionnellement court.
> Tout ce qui n'est pas listé ici est considéré résolu et documenté dans les patches V1.2.

---

## Items résolus depuis hardening V1.4

| Item | Statut | Preuve documentaire | Raison de clôture |
|---|---|---|---|
| **platform admin OpenAPI missing** | ✅ **RESOLU** | `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md`, `RELEASE_PACK_V1.2_INDEX.md`, `RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md` | Surfaces `/v1/admin/platform/*` désormais contractées via OpenAPI V1.4 (pas via `2.11`/`2.11.a`/V1.3). |

---

## Items ouverts — Classés par priorité

### PRIORITÉ 1 — Validation OWNER requise avant build des lots concernés

| Item | Décision | Lot impacté | Délai recommandé | Go-live blocker ? |
|---|---|---|---|---|
| **D1 — platform_admin Option A** | `tenant_id=null`, bypass RLS, SELECT global (contrat OpenAPI V1.4 désormais en place) | Lot 1 (Foundation RBAC) | Avant démarrage Lot 1 | **Oui** |
| **D2 — ATS scoring rules-v1.0** | 4 composantes, `model_version="rules-v1.0"`, LLM=V2 | Lot 5 (ATS) | Avant démarrage Lot 5 | **Oui** |
| **D6 — Égalité traitement V1 manuel** | Check manuel, snapshot immuable, pas de blocage auto | Lot 7 Bis | Avant démarrage Lot 7 Bis | **Oui** |

**Action** : Soumettre `DECISIONS_OWNER_V1.2.md` au Product Owner. Absence de réponse dans 5 jours ouvrés = approbation tacite.

**Référence** : [`DECISIONS_OWNER_V1.2.md`](./DECISIONS_OWNER_V1.2.md)

---

### PRIORITÉ 2 — Gaps E2E (non bloquants build, bloquants QA Lot)

| Item | Description | Lot | Action recommandée | Go-live blocker ? |
|---|---|---|---|---|
| **E2E SIPSI manquant** | Aucun scénario E2E dédié pour `sipsi_declarations` (workflow draft→submitted→validated→rejected) | 2/7 | Créer E2E-14 en Vague 4 avant QA Lot 7 | **Oui** |

**Couverture actuelle SIPSI** : GWT dans `6.7 CHECKLIST LOT 7 IA` + events définis `2.10.4.11 §C`. Suffisant pour le build, pas pour l'acceptance testing complet.

---

### PRIORITÉ 3 — Event candidat (à confirmer avant build CRM)

| Item | Description | Lot | Action recommandée | Go-live blocker ? |
|---|---|---|---|---|
| **`LeadActivityCreated` — statut CANDIDAT** | Event référencé comme "CANDIDAT V1" dans `PATCH_OPENAPI_V1.3 §2`. Pas de payload défini dans `PATCH_EVENTS_2.10.4.11`. | 4 (CRM) | Valider ou supprimer avant démarrage Lot 4 | **Non** |

**Options** :
1. Valider → ajouter §F dans `PATCH_EVENTS_2.10.4.11.md` avec payload complet
2. Reporter V2 → marquer explicitement "event = V2" dans `PATCH_OPENAPI_V1.3 §2`

---

## Items explicitement hors scope V1 (pour référence)

Ces items sont documentés comme V2 dans `DECISIONS_OWNER_V1.2.md`. Ils n'apparaissent ici que pour mémoire.

| Item | Décision | Doc source |
|---|---|---|
| LLM scoring ATS | V2 | `PATCH_ATS_SCORING_Q7 §Décision LLM` |
| API externe salaires minimaux pays hôte | V2 | `DECISIONS_OWNER §D6` |
| Blocage enforcement = égalité traitement | V2 | `6.9 CHECKLIST §Out of scope` |
| Offline PWA worker | V2 | `DECISIONS_OWNER §D3`, `ERRATA C2` |
| Connecteur SIPSI API direct | V2 | `PATCH_OPENAPI_V1.3 §Ce qui N'est PAS dans ce patch` |
| Analytics avancées multi-tenant | V2 | `CDC_COMPLETIONS §C3` |
| Matching IA avancé RFP | V2 | `PATCH_OPENAPI_V1.3 §hors scope confirmé V2` |

---

## Résumé

```json
OPEN ITEMS BLOQUANTS BUILD : 0
OPEN ITEMS NÉCESSITANT DÉCISION OWNER : 3 (D1, D2, D6)
OPEN ITEMS E2E MANQUANTS : 1 (E2E SIPSI)
OPEN ITEMS À STATUER (event CRM) : 1
ITEMS V2 DOCUMENTÉS (hors scope) : 7
```

**Conclusion** : Le build peut démarrer sur le Lot 1 immédiatement. Les décisions D1/D2/D6 doivent être obtenues avant les lots concernés (1, 5, 7 Bis). L'E2E SIPSI et l'event LeadActivityCreated peuvent être traités en Vague 4 parallèlement au build.

---

## Ordre de résolution recommandé (go-live)

1. **D1 signé** (`OWNER_SIGNOFF_V1.2.md`) — verrouiller l'architecture `platform_admin`.
2. **D6 signé** (`OWNER_SIGNOFF_V1.2.md`) — verrouiller le périmètre conformité légal V1.
3. **D2 signé** (`OWNER_SIGNOFF_V1.2.md`) — verrouiller le scoring ATS V1.
4. **E2E SIPSI ajouté et validé** — fermer le gap test bloquant QA go-live.
5. **Statut final `LeadActivityCreated`** — valider payload event ou reporter explicitement V2.

---

## Mini-changelog

- 2026-02-22 : Création — 5 items ouverts post-QA Final. 0 bloquant build. 3 décisions OWNER requises. 1 E2E manquant. 1 event à statuer.
- 2026-02-22 : Mise à jour post-hardening — item `platform admin OpenAPI missing` marqué **RESOLU** après contractualisation via `PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md`.
- 2026-02-22 : Ajout du champ `Go-live blocker ?` sur tous les items ouverts + ordre de résolution recommandé.
