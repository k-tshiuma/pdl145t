# Plateforme Gouvernementale de Statistiques Démographiques (PDL-145T)

Ce plan décrit l'implémentation de la plateforme de statistiques démographiques basée sur la base de données `pdl145t.db`.

> [!IMPORTANT]
> Vous avez confirmé l'utilisation de `pdl145t.db` et de la règle de calcul: Population = Hommes + Femmes + Enfants. 
> Cependant, la base contient à la fois les adultes (table `parents`) et les enfants (table `children`). Les deux ont un attribut genre.
> **Assomption** : "Hommes" = Adultes (M) dans `parents`. "Femmes" = Adultes (F) dans `parents`. "Enfants" = Tous les enregistrements dans `children`.

## Open Questions

> [!WARNING]
> La table `health_centers` utilise des UUID pour `territory_id`, mais la table géographique disponible est `territoire` avec des IDs courts (ex: `ks01c1`). Il y a une déconnexion dans le modèle existant. Le dashboard regroupera les données par province en priorité, et gérera les territoires orphelins dans une catégorie "Non assigné" si la jointure échoue. Êtes-vous d'accord ?

## Proposed Changes

La stack choisie sera **Node.js (Express)** pour le backend (API) et **React (Vite + TypeScript + TailwindCSS)** pour le frontend, afin d'assurer de bonnes performances et une intégration facile des capacités PWA / Hors-ligne.

### Backend (Node.js API)

Le backend exposera les données agrégées pour le frontend afin d'éviter la surcharge côté client.

#### [NEW] `backend/package.json`
Initialisation du projet Node.js avec Express, SQLite3, Cors.

#### [NEW] `backend/src/server.js`
Configuration du serveur Express, middleware CORS, gestion des erreurs.

#### [NEW] `backend/src/db.js`
Configuration de la connexion SQLite vers `../births/backend/data/pdl145t.db` en mode lecture.

#### [NEW] `backend/src/routes/stats.js`
Endpoints de statistiques:
- `GET /api/stats/kpi` : Récupère la population totale, hommes, femmes, enfants, croisés avec les filtres géographiques (via `health_centers` et `parents`).
- `GET /api/stats/geo` : Récupère la hiérarchie géographique existante (provinces, territoires).

### Frontend (React Dashboard)

Interface moderne avec React, Tailwind (pour le respect du thème PDL-145T).

#### [NEW] `frontend/package.json`
Initialisation du projet Vite avec React, TailwindCSS, React Router, Recharts (pour les graphiques), Leaflet (carte).

#### [NEW] `frontend/src/App.tsx`
Structure du layout principal (Sidebar, Header, Zone de contenu).

#### [NEW] `frontend/src/components/Dashboard.tsx`
Tableau de bord affichant :
- Les filtres géographiques (Cascading dropdowns).
- Les cartes KPI (Population Totale, Hommes, Femmes, Enfants).
- Graphique à barres (Répartition par genre/âge).

#### [NEW] `frontend/src/services/api.ts`
Appels à l'API Node.js avec support du cache local (offline-first basique).

## Verification Plan

### Manual Verification
1. Lancer le backend Node.js (`npm start`).
2. Lancer le frontend React (`npm run dev`).
3. Vérifier que les KPIs s'affichent correctement en interrogeant la base `pdl145t.db`.
4. Tester le filtrage par Province pour s'assurer que les chiffres se mettent à jour.
