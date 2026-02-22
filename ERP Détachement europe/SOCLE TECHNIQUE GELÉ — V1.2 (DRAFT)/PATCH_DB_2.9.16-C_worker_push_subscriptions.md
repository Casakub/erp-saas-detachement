# PATCH DB — 2.9.16-C — worker_push_subscriptions

- **Statut**: DRAFT V1.2.2
- **Date**: 2026-02-22
- **Auteur**: Audit fonctionnel (claude-code)
- **Priorité**: HAUTE — bloque endpoint VAPID push (2.11.a V1.2.2)

---

## Contexte & Justification

### Problème identifié

Le document `2.11.a — OPENAPI V1.2 (PATCH)` définit les endpoints suivants pour la gestion des abonnements Web Push VAPID (section Worker App Mobile) :

```
POST   /v1/worker/push-subscription
DELETE /v1/worker/push-subscription
```

Ces endpoints nécessitent une table de persistance pour stocker les subscriptions VAPID. Or, le schéma DB `2.9 - Schéma DB V1.1` ne contient **aucune table `worker_push_subscriptions`** (vérifié : sections 2.9.1 à 2.9.15).

### Références sources

| Source | Référence | Contenu |
|---|---|---|
| `2.11.a — OPENAPI V1.2 (PATCH)` | Section Worker App Mobile | `POST /v1/worker/push-subscription` + `DELETE` |
| `SECTION 10.E — ACCEPTANCE TESTS` | E2E-09 | Scénario VAPID push worker — nécessite persistance endpoint/keys |
| `SECTION 6 — Checklist Lot 3` | 6.3 Mobile Worker | VAPID Web Push listé comme livrable Lot 3 |
| `SECTION 9 — IMPLEMENTATION SUBSTRATE` | §9.6 Notifications | VAPID sans dépendance FCM — spec technique |
| `Ancien prototype/PROTOTYPE_FEATURES.md` | Écran Paramètres | Notifications Push présentes |

### Scope V1 confirmé

VAPID Web Push est **V1** (non V2). Source : SOCLE TECHNIQUE GELÉ §M13 (i18n & Comms), Checklist 6.3.
Le prototype et les tests E2E E2E-09 confirment la nécessité V1.

---

## DDL SQL — Table `worker_push_subscriptions`

### Naming convention migrations (SECTION 9)

Format requis : `YYYYMMDDHHMMSS__lot<N>_m<M>_<slug>.sql`
→ Exemple : `20260222000001__lot3_m13_worker_push_subscriptions.sql`

### DDL complet

```sql
-- ============================================================
-- PATCH DB 2.9.16-C — worker_push_subscriptions
-- Lot 3 — M13 (i18n & Comms / VAPID Push)
-- Convention: 20260222000001__lot3_m13_worker_push_subscriptions.sql
-- ============================================================

CREATE TABLE worker_push_subscriptions (
  -- Identité
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Isolation multi-tenant (RLS)
  tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Référence worker (le bénéficiaire des notifications)
  worker_id     UUID        NOT NULL REFERENCES workers(id) ON DELETE CASCADE,

  -- Données VAPID W3C Push API
  -- https://www.w3.org/TR/push-api/#dom-pushsubscription-endpoint
  endpoint      TEXT        NOT NULL,
  keys_p256dh   TEXT        NOT NULL,  -- clé publique ECDH P-256, base64url
  keys_auth     TEXT        NOT NULL,  -- secret HMAC, base64url (16 bytes)

  -- Métadonnées de souscription
  user_agent    TEXT,                  -- navigator.userAgent (debug seulement)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,           -- null = pas d'expiration déclarée par le navigateur

  -- Unicité: un worker ne peut avoir qu'une subscription par endpoint (navigateur/device)
  CONSTRAINT uq_worker_push_subscription UNIQUE (worker_id, endpoint)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Lookup par worker (principal : envoi notifications à un worker)
CREATE INDEX idx_wps_worker_id
  ON worker_push_subscriptions (worker_id);

-- Lookup par tenant (pour batch notifications ou purge)
CREATE INDEX idx_wps_tenant_id
  ON worker_push_subscriptions (tenant_id);

-- Lookup par expiration (pour batch de purge des subscriptions expirées)
CREATE INDEX idx_wps_expires_at
  ON worker_push_subscriptions (expires_at)
  WHERE expires_at IS NOT NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE worker_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique 1 : tenant_admin voit toutes les subscriptions de son tenant
CREATE POLICY rls_wps_tenant_admin
  ON worker_push_subscriptions
  FOR ALL
  TO authenticated
  USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') IN ('tenant_admin', 'agency_user')
  );

-- Politique 2 : worker voit uniquement ses propres subscriptions
CREATE POLICY rls_wps_worker_self
  ON worker_push_subscriptions
  FOR ALL
  TO authenticated
  USING (
    worker_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
    AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'worker'
  );

-- Politique 3 : platform_admin bypass (accès global)
CREATE POLICY rls_wps_platform_admin
  ON worker_push_subscriptions
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role_type') = 'platform_admin'
  );
```

---

## Politiques RLS détaillées

| Rôle | SELECT | INSERT | UPDATE | DELETE | Condition |
|---|---|---|---|---|---|
| `tenant_admin` | ✅ | ✅ | ✅ | ✅ | `tenant_id` du JWT |
| `agency_user` | ✅ | ❌ | ❌ | ❌ | lecture seule (envoi push via backend) |
| `worker` | ✅ | ✅ | ❌ | ✅ | uniquement ses propres subscriptions (`sub` JWT = `worker_id`) |
| `platform_admin` | ✅ | ✅ | ✅ | ✅ | bypass RLS global |
| `client_user` | ❌ | ❌ | ❌ | ❌ | exclu |
| `consultant` | ❌ | ❌ | ❌ | ❌ | exclu |
| `system` | ✅ | ✅ | ✅ | ✅ | service account batch purge |

**Source RBAC**: `2.12.a — RBAC V1.2 (PATCH)` + principe général SOCLE §RBAC "worker voit uniquement ses propres données".

---

## Comportement applicatif (non-DDL)

### Gestion des expirations (décision retenue : Option B)

```
Règle: retry 3x sur erreur 410 Gone (endpoint révoqué côté navigateur)
→ Après 3 échecs consécutifs → DELETE de la subscription (purge)
→ Log événement dans audit_logs: action='push_subscription_expired', actor='system'
→ Worker re-subscribe au prochain login (frontend)
```

**Source**: Décision audit fonctionnel 2026-02-22, Q8 Option B.
V2 : gestion avancée des préférences de notification (Section 10.F candidate V2).

### Unicité multi-device

Un worker peut avoir N subscriptions (une par navigateur/device). La contrainte `UNIQUE(worker_id, endpoint)` garantit pas de doublon pour le même device. Pas de limite artificielle sur le nombre de devices en V1.

---

## Impact — Endpoints débloqués

| Endpoint | Méthode | Statut avant patch | Statut après patch |
|---|---|---|---|
| `/v1/worker/push-subscription` | POST | ❌ Pas de table | ✅ |
| `/v1/worker/push-subscription` | DELETE | ❌ Pas de table | ✅ |

**Event outbox concerné**: Aucun event direct sur cette table. Les notifications push sont déclenchées par d'autres events (ex: `ComplianceDurationAlert`, `MissionStatusChanged`).

---

## Checklist de validation

- [ ] DDL appliqué en migration nommée `20260222000001__lot3_m13_worker_push_subscriptions.sql`
- [ ] RLS activé + politiques créées
- [ ] Index créés
- [ ] Endpoints `POST /DELETE /v1/worker/push-subscription` fonctionnels
- [ ] Test E2E-09 passe
- [ ] Test RBAC : worker ne peut pas accéder aux subscriptions d'un autre worker
- [ ] Test multi-tenant : tenant isolation vérifiée

---

## Alignement contrat

| Pilier | Statut avant | Statut après |
|---|---|---|
| DB `worker_push_subscriptions` | ❌ Absent | ✅ |
| OpenAPI `2.11.a` endpoints Push | ⚠️ Endpoint sans DB | ✅ |
| Events | N/A (pas d'event direct) | ✅ |
| RBAC | ⚠️ Pas de RLS définie | ✅ |
| E2E-09 | ⚠️ Bloqué (pas de table) | ✅ |

---

## Mini-changelog

- 2026-02-22 : Création du patch suite à audit fonctionnel — gap identifié : table absente de 2.9 V1.1 malgré endpoints actifs en 2.11.a.
- 2026-02-22 : Correction nomenclature — endpoint corrigé `/v1/workers/push-subscription` → `/v1/worker/push-subscription` (singulier) pour alignement sur contrat autoritaire `2.11.a — OPENAPI V1.2 (PATCH)` §Worker App Mobile. Détecté lors du QA Final V1.2.
