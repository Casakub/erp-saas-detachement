# SECTION 4 — AI CONTRIBUTION RULES (OFFICIEL)

AI CONTRIBUTION RULES — V1.1

Ces règles sont OBLIGATOIRES pour toute IA intervenant sur le projet.
Elles priment sur tout autre instruction.

1) PÉRIMÈTRE & RESPONSABILITÉ
1.1 Une IA = un module = un périmètre strict.
1.2 Aucune IA ne modifie un autre module.
1.3 Toute tentative de transversalité = rejet.

2) CONTRACT-FIRST (NON NÉGOCIABLE)
2.1 Aucune route sans OpenAPI validée.
2.2 Aucun champ sans schéma documenté.
2.3 Aucune modification DB sans migration versionnée.

3) MULTI-TENANT & SÉCURITÉ
3.1 tenant_id obligatoire sur toutes les tables.
3.2 Isolation multi-tenant testée et vérifiée.
3.3 Aucune clé en dur.
3.4 Secrets via variables d’environnement uniquement.
3.5 Storage chiffré + hashing + access logs.

4) SÉPARATION STRICTE DES RESPONSABILITÉS
4.1 Backend = logique métier & décisions.
4.2 Frontend = affichage & interaction uniquement.
4.3 No-code = orchestration (emails, PDF, notifications, batch).
4.4 Toute logique métier hors backend = rejet.

5) COMPLIANCE & DÉCISION AUTOMATIQUE
5.1 Aucune décision automatique sans :
    - règle explicite
    - version de modèle
    - raison lisible (reason)
    - audit trail
5.2 Aucun score ou blocage “silencieux”.
5.3 Toute décision doit être explicable à un inspecteur.

6) STOP CONDITIONS — IA
Une IA DOIT s’arrêter et demander validation humaine si :
- Une règle légale est ambiguë
- Une donnée réglementaire manque ou est incertaine
- Un calcul conformité est douteux
- Une décision automatique est envisagée
- Un impact cross-module est détecté

Continuer sans validation = rejet automatique.

7) VERSIONING & SNAPSHOTS
7.1 Modèles de scoring/ranking/règles légales versionnés.
7.2 Snapshots immuables (rémunération, score, conformité).
7.3 Changelog obligatoire à chaque modification.

8) TESTS & QUALITÉ
8.1 Tests unitaires obligatoires.
8.2 Tests d’intégration obligatoires.
8.3 Tests RBAC & multi-tenant obligatoires.
8.4 Absence de tests = rejet.

9) CRITICITÉ DES MODULES
Les modules compliance, finance, enforcement, certification sont CRITIQUES.
Ils exigent :
- tests renforcés
- revue humaine obligatoire
- validation finale explicite

10) REVUE & SANCTIONS
10.1 Toute contribution inclut une note d’impact.
10.2 Toute violation d’une règle = PR refusée sans discussion.
10.3 Les règles priment sur la vitesse d’exécution.

FIN DES RÈGLES

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
