# SECTION 5 — “DEFINITION OF DONE” GLOBAL (DoD)

> 📌 **Règle d’or**
Cette Definition of Done est **globale et obligatoire** pour **tout module, toute feature et tout lot**.
Elle s’applique **en complément** des checklists spécifiques par lot (ex : 2.13 — Lot 1 IA).
> 

📎 Cette DoD s’applique en complément de la SECTION 6 — Checklists Produit & Lots.
Aucune validation finale n’est possible si une checklist de lot reste incomplète.

Un module, une feature ou un lot est considéré comme TERMINÉ uniquement si
TOUTES les conditions suivantes sont réunies.

1) QUALITÉ TECHNIQUE MINIMALE
☐ Tous les tests unitaires passent
☐ Tous les tests d’intégration passent
☐ Aucun test critique désactivé
☐ Aucune erreur bloquante en logs

2) MULTI-TENANT & SÉCURITÉ
☐ tenant_id présent sur toutes les tables
☐ Isolation multi-tenant testée (accès croisé impossible)
☐ RBAC testé (accès autorisés / refusés)
☐ Aucun secret en dur
☐ Coffre-fort : hash + access logs vérifiés

3) CHAÎNES MÉTIER CRITIQUES VALIDÉES
☐ Chaîne métier critique du lot validée
   - Lot 2 : Requirements → A1 → Enforcement flags
	 - Lot 4+ : Rémunération → Snapshot → Score → Enforcement
☐ Blocages effectifs sur :
   - activation mission
   - validation timesheets
   - émission facture
☐ Raisons de blocage visibles et explicables

4) CONFORMITÉ & AUDITABILITÉ
☐ Export “inspection-ready” fonctionnel (PDF)
☐ Audit logs présents pour toutes actions critiques
☐ Scores, décisions et règles versionnés
☐ Snapshots immuables vérifiés

5) MOBILE & WORKER APP
☐ Endpoints mobile dédiés testés
☐ Check-in / Check-out fonctionnels
☐ V1 : PWA online only (aucune exigence offline)
☐ V2+ : Offline lecture seule validée si explicitement incluse dans le lot
☐ Aucun calcul métier côté mobile
☐ Critères Mobile applicables uniquement aux lots incluant l’app Worker (Lot 3+)

6) PERFORMANCE & ROBUSTESSE
☐ Tables indexées (tenant_id, mission_id, worker_id)
☐ Batch jobs (nightly) exécutés sans erreur
☐ Temps de réponse acceptable (seuil documenté et validé pour le lot concerné)
☐ Pas de N+1 critiques

7) OBSERVABILITÉ
☐ Logs applicatifs exploitables
☐ Erreurs tracées
☐ Alertes configurées pour incidents critiques

8) DOCUMENTATION & TRAÇABILITÉ
☐ OpenAPI à jour
☐ Événements métier documentés
☐ Modèles de données versionnés
☐ Lien clair vers écrans Figma impactés

9) NON-RÉGRESSION
☐ Les fonctionnalités existantes ne sont pas cassées
☐ Les scénarios critiques V1 sont toujours valides
☐ Aucune régression sur conformité ou finance

10) VALIDATION FINALE
☐ Validation humaine explicite requise
☐ Module marqué “Approved” dans Notion
☐ Prêt pour intégration / déploiement

FIN DEFINITION OF DONE

---

## Changelog doc

- 2026-02-17: Normalisation fences — sans changement métier.
