# RELEASE CANDIDATE V1.2.1

- **Version** : RC V1.2.1
- **Date** : 2026-02-22
- **Statut** : CANDIDATE (documentation finale pre-go-live)
- **Scope** : `RELEASE_PACK_V1.2` + hardening contractuel OpenAPI V1.4 pour `platform_admin` (`PATCH_OPENAPI_V1.4_PLATFORM_ADMIN_SURFACES.md`), sans changement technique produit.

---

## Références de contrôle

- `RELEASE_PACK_V1.2_INDEX.md`
- `RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md`
- `RELEASE_PACK_V1.2_CHANGELOG.md`
- `RELEASE_PACK_V1.2_OPEN_ITEMS.md`
- `OWNER_SIGNOFF_V1.2.md`

---

## Résumé exécutable

### Gates

- Gates satisfaites : **7/8**
- Gate restante : **G8 — validation OWNER formelle D1/D2/D6**
- Base contractuelle : alignement DB ↔ OpenAPI ↔ Events ↔ RBAC maintenu, avec contractualisation explicite des surfaces `/v1/admin/platform/*` via OpenAPI V1.4.

### Open items restants (statut)

| Item | Type de statut | Statut | Go-live blocker |
|---|---|---|---|
| D1 — platform_admin Option A | `owner` | En attente signature | Oui |
| D2 — ATS scoring rules-v1.0 | `owner` | En attente signature | Oui |
| D6 — Égalité traitement V1 manuel | `owner` | En attente signature | Oui |
| E2E SIPSI manquant | `test` | Scénario E2E dédié absent | Oui |
| `LeadActivityCreated` (event CANDIDAT) | `candidate` | À valider ou déporter V2 | Non |

---

## Checklist Go/No-Go (RC V1.2.1)

- [ ] 1. D1 signé dans `OWNER_SIGNOFF_V1.2.md` (ACCEPTER / ACCEPTER CONDITIONNELLEMENT / REFUSER documenté)
- [ ] 2. D2 signé dans `OWNER_SIGNOFF_V1.2.md`
- [ ] 3. D6 signé dans `OWNER_SIGNOFF_V1.2.md`
- [ ] 4. Scénario E2E SIPSI ajouté et validé (workflow draft → submitted → validated/rejected)
- [ ] 5. Décision `LeadActivityCreated` actée (valider payload event ou reporter explicitement en V2)
- [ ] 6. `RELEASE_PACK_V1.2_ALIGNMENT_CHECKLIST.md` à jour et cohérent avec la décision finale D1/D2/D6
- [ ] 7. `RELEASE_PACK_V1.2_OPEN_ITEMS.md` reflète uniquement les items réellement ouverts
- [ ] 8. Aucun marqueur d'incertitude non justifié dans `SOCLE TECHNIQUE GELÉ — V1.2 (DRAFT)`
- [ ] 9. Aucun document LOCKED modifié
- [ ] 10. Validation finale Product/Tech Lead sur ce RC (`RELEASE_CANDIDATE_V1.2.1.md`)

---

## Verdict RC

- **GO conditionnel** : possible après fermeture des blockers `owner` + `test` (D1, D2, D6, E2E SIPSI).
- **NO-GO** : si une décision D1/D2/D6 n'est pas signée ou si l'E2E SIPSI n'est pas validé.

---

## Mini-changelog

- 2026-02-22 : Création du RC V1.2.1 (packaging documentaire post-hardening V1.4 `platform_admin`).
