# SECTION 10.A — PILIERS FONCTIONNELS (6 PILIERS ↔ M1..M13)

- Statut: DRAFT
- Portée: cartographier les 6 piliers fonctionnels V1 vers les modules M1..M13.
- Règles:
- Document descriptif de navigation.
- Aucun ajout de règle métier, de contrat ou d'implémentation.

## Références sources (justification d'existence)

- SOCLE point 10.A: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:558`
- Liste des 6 piliers V1: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:28`
- Catalogue modules M1..M13: `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md:92`
- Alias utilisé dans les tableaux: `SOCLE` = `ERP Détachement europe/SOCLE TECHNIQUE GELÉ — V1 (LOCKED) 308688d6a596805b8e40c7f8a22944ea.md`

## 6 piliers fonctionnels (source SOCLE V1)

| Pilier | Libellé source | Référence |
| --- | --- | --- |
| P1 | Acquisition & Prospection (CRM + RFP interne) | `SOCLE:30` |
| P2 | Marketplace & ATS (annonces + candidatures + scoring IA assisté) | `SOCLE:31` |
| P3 | Conformité Détachement (Compliance Case + règles dynamiques + conventions) | `SOCLE:32` |
| P4 | Finance & Comptabilité (devis/factures + exports + commissions) | `SOCLE:33` |
| P5 | Gestion Clients (multi-sites + vigilance + portail client) | `SOCLE:34` |
| P6 | Multi-langues & UX (UI + emails + documents, base terminologique) | `SOCLE:35` |

## Table de mapping piliers -> modules

| Pilier | Description (1 ligne) | Modules principaux | Modules transverses | Références de navigation |
| --- | --- | --- | --- | --- |
| P1 | Pilier d'acquisition et structuration du pipe commercial. | M2, M4 | M1, M13 | M2 `SOCLE:108`, M4 `SOCLE:130` |
| P2 | Pilier recrutement et traction marketplace. | M5, M11, M12 | M6, M13 | M5 `SOCLE:145`, M11 `SOCLE:267`, M12 `SOCLE:277` |
| P3 | Pilier conformité et contrôle de détachement inspection-ready. | M8 | M7, M9 | M8 `SOCLE:213`, M7 `SOCLE:168`, M9 `SOCLE:230` |
| P4 | Pilier facturation, encaissement et pilotage financier. | M10 | M7, M8, M9 | M10 `SOCLE:245` |
| P5 | Pilier gestion client et vigilance documentaire. | M3 | M2, M4, M9 | M3 `SOCLE:119` |
| P6 | Pilier expérience multi-langue et canaux de communication. | M13, M7bis | M1, M6 | M13 `SOCLE:292`, M7bis `SOCLE:179` |

## Navigation modules M1..M13

| Module | Intitulé source | Pilier(s) rattaché(s) | Référence principale |
| --- | --- | --- | --- |
| M1 | Identity & Access (Core) | P1, P6 | `SOCLE:92` |
| M2 | CRM Prospection | P1, P5 | `SOCLE:108` |
| M3 | Gestion Clients + Vigilance | P5 | `SOCLE:119` |
| M4 | RFP Interne | P1, P5 | `SOCLE:130` |
| M5 | ATS (Annonces & Candidatures) | P2 | `SOCLE:145` |
| M6 | Workers & Dossiers | P2, P6 | `SOCLE:157` |
| M7 | Missions & Timesheets | P3, P4 | `SOCLE:168` |
| M7bis | Worker App (Mobile PWA) | P6 | `SOCLE:179` |
| M8 | Conformité Détachement | P3, P4 | `SOCLE:213` |
| M9 | Vault (Coffre-fort numérique) | P3, P4, P5 | `SOCLE:230` |
| M10 | Finance (Devis / Factures / Commissions) | P4 | `SOCLE:245` |
| M11 | Marketplace | P2 | `SOCLE:267` |
| M12 | Risk & Certification | P2 | `SOCLE:277` |
| M13 | i18n & Comms | P1, P2, P6 | `SOCLE:292` |

## Non-goals / Out of scope

- Définir des règles d'exécution, des calculs, des seuils ou des décisions métier.
- Modifier les contrats 2.9, 2.10, 2.11, 2.12 ou la SECTION 9.
- Remplacer le SOCLE LOCKED.

## Mini-changelog

- 2026-02-18: page complétée en cartographie de navigation (sans changement contractuel).
