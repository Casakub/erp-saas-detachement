# 6.3 — CHECKLIST — LOT 3 IA (TIMESHEETS & MOBILE)

### 🔒 Décisions structurantes (VERROUILLÉES)

- [x]  Modèle temps : Daily entries + soumission hebdomadaire
- [x]  Validation : Client + Agence (double validation)
- [x]  Mobile : PWA online only (V1)

---

### 🧱 Contrats techniques obligatoires

- [x]  DB V1 validée (missions, timesheets, entries, check_events)
- [x]  Events métier V1 existants et gelés (2.10)
- [x]  RBAC V1 validé (worker / agency_user / client_user)
- [x]  Enforcement flags (M8) disponibles en lecture seule

---

### ⏱ M7.T — Timesheets

- [ ]  Création timesheet hebdomadaire liée à une mission
- [ ]  Entrées journalières (date, heures, notes)
- [ ]  Soumission par le worker
- [ ]  Validation agence + client
- [ ]  Statuts clairs (draft / submitted / validated / rejected)
- [ ]  Aucun lien direct avec facturation (V1)
- [ ]  Events émis à chaque transition clé

---

### 📱 M7bis — Worker Mobile API (PWA)

- [ ]  Auth sécurisée (worker only)
- [ ]  Lecture missions & planning
- [ ]  Saisie temps journalière
- [ ]  Soumission timesheet
- [ ]  Check-in / check-out (présence)
- [ ]  Upload documents (via Vault)
- [ ]  Messages clairs si action bloquée (enforcement)

---

### 🔁 Events (OBLIGATOIRES)

- [ ]  TimesheetCreated
- [ ]  TimesheetEntryAdded
- [ ]  TimesheetSubmitted
- [ ]  TimesheetValidated
- [ ]  TimesheetRejected
- [ ]  WorkerCheckEventRecorded (check_in / check_out via `data.event_type`)

➡️ Payload conforme à 2.10 (pas d’event inventé)

---

### 📏 Règle canonique events

- Tout event doit exister dans 2.10, sinon interdit.

---

### 🚫 Interdictions strictes

- [ ]  Aucune logique de rémunération
- [ ]  Aucun calcul de paie
- [ ]  Aucune décision conformité
- [ ]  Aucune logique critique côté mobile
- [ ]  Aucun offline complexe (V1)

---

### 🧪 Validation finale

- [ ]  Tests unitaires
- [ ]  Tests intégration
- [ ]  Tests RBAC
- [ ]  Tests multi-tenant
- [ ]  Review via SECTION 2.C

⛔ Aucun prompt IA ne peut être exécuté
tant que cette checklist n’est pas complète.

---

## Changelog doc

- 2026-02-18: Alignement référentiel Lot 3 sur modules canoniques (M7.T, M7bis) et events 2.10, sans changement métier.
