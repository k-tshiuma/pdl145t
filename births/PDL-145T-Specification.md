# Rôle

Agis comme un **Software Architect, Senior Full-Stack Developer, UX/UI Designer et expert en systèmes d'information de santé publique**, avec une expérience des applications gouvernementales, des environnements à faible connectivité et des systèmes de collecte de données sur appareils mobiles.

Ta mission est de concevoir et développer progressivement une application permettant **l'enregistrement des nouveau-nés dans les centres de santé des provinces et territoires de la République démocratique du Congo (RDC)**, dans le cadre du programme **PDL-145T**.

Ne te limite pas à générer du code : analyse les exigences, identifie les informations manquantes, les risques techniques et fonctionnels, puis propose une architecture claire et maintenable.

---

# 1. Objectif général

Concevoir une application permettant au personnel autorisé d'un centre de santé de :

1. enregistrer un nouveau-né ;
2. enregistrer et/ou retrouver les informations de ses parents ;
3. enregistrer les examens cliniques et dépistages néonatals ;
4. enregistrer les vaccins et soins initiaux ;
5. générer automatiquement un identifiant pour l'enfant selon les règles qui seront définies par l'autorité compétente ;
6. faire confirmer les informations par l'utilisateur avant validation ;
7. générer un **acte de naissance au format PDF** ;
8. stocker les données localement pendant la phase de test ;
9. prévoir une architecture permettant ultérieurement la connexion à une base de données gouvernementale ;
10. fonctionner dans des environnements où la connexion Internet peut être faible, intermittente ou inexistante.

---

# 2. Architecture du projet — séparation Frontend / Backend

L'organisation du code doit être clairement séparée en deux parties principales :

```text
project/
│
├── frontend/
│   └── ...
│
├── backend/
│   └── ...
│
└── README.md
```

## Frontend

Le dossier `frontend/` doit contenir **uniquement la logique liée à l'interface utilisateur et à l'expérience utilisateur**, notamment :

* écrans ;
* composants UI ;
* formulaires ;
* navigation ;
* validation de présentation ;
* gestion de l'état de l'interface ;
* messages d'erreur ;
* affichage des données ;
* interactions utilisateur ;
* responsive design ;
* logique spécifique aux appareils mobiles/tablettes/PC.

Le frontend ne doit pas contenir directement la logique métier critique ni accéder directement à la base de données.

## Backend

Le dossier `backend/` doit contenir **la logique métier et l'accès aux données**, notamment :

* règles métier ;
* validation métier ;
* gestion des utilisateurs ;
* authentification ;
* autorisation ;
* gestion des parents ;
* gestion des nouveau-nés ;
* gestion des examens ;
* gestion des vaccins et soins ;
* génération/attribution des identifiants ;
* gestion des actes de naissance ;
* génération des PDF ;
* accès à la base de données ;
* synchronisation ;
* gestion des erreurs ;
* logs et audit ;
* API.

Le backend doit exposer une interface claire entre le frontend et la couche de données.

### Règle d'architecture importante

Le frontend ne doit **jamais accéder directement aux tables SQLite ou à une future base de données gouvernementale**.

Le flux doit être conceptuellement :

```text
Utilisateur
    ↓
Frontend
    ↓
API / Services Backend
    ↓
Logique métier
    ↓
Repository / Data Access Layer
    ↓
SQLite (phase de test)
```

À terme, la couche de persistance devra pouvoir être remplacée ou étendue pour communiquer avec l'infrastructure gouvernementale sans devoir réécrire toute l'interface frontend.

---

# 3. Base de données — phase de test

### Exigence obligatoire pour le prototype et les tests

Pendant toute la phase de **développement et de test**, les informations de l'application doivent être conservées **localement dans une base de données SQLite**.

La structure devra être conçue de manière à permettre ultérieurement le remplacement ou l'extension de SQLite par une base de données gouvernementale distante.

Architecture recommandée :

```text
Frontend
   ↓
Backend API
   ↓
Services métier
   ↓
Repository / Data Access Layer
   ↓
SQLite
```

### Important

Ne couple pas directement la logique métier aux fonctionnalités spécifiques de SQLite.

Utilise une **couche d'abstraction d'accès aux données**, par exemple :

```text
backend/
├── controllers/
├── services/
├── repositories/
├── models/
├── database/
├── middleware/
├── routes/
└── ...
```

Ainsi, le développement pourra commencer avec :

```text
SQLiteRepository
```

puis évoluer ultérieurement vers une implémentation telle que :

```text
GovernmentDatabaseRepository
```

sans modifier substantiellement la logique métier.

### Objectifs de SQLite pendant les tests

La base locale doit permettre de tester :

* création d'un dossier ;
* recherche d'un parent ;
* création d'un enfant ;
* modification des données ;
* validation ;
* détection des doublons ;
* examens ;
* dépistages ;
* vaccins ;
* soins ;
* génération de l'acte de naissance ;
* historique ;
* authentification et rôles si inclus dans le prototype ;
* synchronisation simulée si nécessaire.

Fournis également un mécanisme permettant de :

* créer automatiquement la base SQLite ;
* créer les tables/migrations ;
* initialiser des données de test ;
* réinitialiser facilement la base pour effectuer de nouveaux tests.

---

# 4. Évolution vers la base gouvernementale

L'utilisation de SQLite est **uniquement destinée au développement, au prototypage et aux tests**, sauf décision contraire explicitement définie par les autorités compétentes.

Conçois donc l'application selon une architecture permettant ultérieurement :

```text
Phase 1 — Développement/Test

Frontend
   ↓
Backend
   ↓
SQLite


Phase 2 — Déploiement

Frontend
   ↓
Backend
   ↓
API / Synchronisation sécurisée
   ↓
Infrastructure gouvernementale
```

Ne suppose pas la technologie ou l'architecture de la future base gouvernementale.

Identifie les interfaces nécessaires pour permettre cette évolution.

---

# 5. Utilisateurs et gouvernance des accès

Les données seront conservées dans une infrastructure gouvernementale.

Les organismes susceptibles d'avoir accès aux données sont :

* Ministère de la Santé ;
* Ministère de l'Intérieur ;
* Ministère de la Justice ;
* Ministère de la Défense.

Ne considère pas que tous les utilisateurs doivent avoir accès à toutes les données.

Propose un système **RBAC (Role-Based Access Control)** permettant de définir précisément :

* rôles ;
* permissions ;
* données accessibles ;
* opérations autorisées ;
* restrictions par province ;
* territoire ;
* centre de santé ;
* administration ;
* journaux d'audit.

---

# 6. Interface utilisateur

L'application sera utilisée dans des zones où le niveau de littératie numérique peut être faible.

La priorité est :

**simplicité > rapidité > clarté > fonctionnalités avancées.**

L'interface doit être :

* mobile-first ;
* simple ;
* intuitive ;
* responsive ;
* utilisable sur smartphone, tablette et PC ;
* composée de gros boutons ;
* avec des libellés simples ;
* avec peu d'informations par écran ;
* organisée étape par étape ;
* avec des messages d'erreur compréhensibles ;
* avec une validation immédiate ;
* avec un minimum de saisie manuelle.

---

# 7. Données — Père

Prévoir :

* ID — numéro de carte d'identité nationale, 9 chiffres ;
* Prénom(s) ;
* Nom ;
* Postnom(s) ;
* Date de naissance ;
* État civil :

  * Marié ;
  * Célibataire ;
  * Divorcé ;
  * Veuf ;
* E-mail ;
* Téléphone ;
* Adresse :

  * Avenue ;
  * Numéro ;
  * Quartier/Village ;
  * Commune/Secteur ;
  * Territoire ;
  * Province ;
* Profession.

---

# 8. Données — Mère

Prévoir :

* ID — numéro de carte d'identité nationale, 9 chiffres ;
* Prénom(s) ;
* Nom ;
* Postnom(s) ;
* Date de naissance ;
* État civil :

  * Mariée ;
  * Célibataire ;
  * Divorcée ;
  * Veuve ;
* E-mail ;
* Téléphone ;
* Adresse :

  * Avenue ;
  * Numéro ;
  * Quartier/Village ;
  * Commune/Secteur ;
  * Territoire ;
  * Province ;
* Profession.

---

# 9. Données — Enfant

Prévoir :

* ID de l'enfant ;
* Prénom(s) ;
* Nom ;
* Postnom(s) ;
* Date de naissance ;
* Prénom(s), nom et postnom(s) du père ;
* ID du père ;
* Prénom(s), nom et postnom(s) de la mère ;
* ID de la mère.

L'ID de l'enfant doit être généré automatiquement lors de l'enregistrement, mais **ne jamais inventer les règles officielles d'attribution de cet identifiant**.

Si un système national existe déjà, proposer une intégration plutôt qu'une génération arbitraire.

---

# 10. Tests cliniques et dépistages

Créer une section dédiée comprenant :

### Score d'Apgar

Enregistrer :

* Apgar à 1 minute ;
* Apgar à 5 minutes.

### Examen physique complet

Prévoir :

* réalisé/non réalisé ;
* date/heure ;
* professionnel ;
* résultats ;
* observations.

### Test de Guthrie

Prévoir :

* réalisé/non réalisé ;
* date/heure ;
* résultat ;
* observations.

### Groupe sanguin

Prévoir :

* A ;
* B ;
* AB ;
* O ;
* Rhésus positif ;
* Rhésus négatif ;
* non réalisé/inconnu.

### Oxymétrie de pouls

Prévoir les mesures et informations nécessaires selon le protocole officiellement retenu.

### Dépistage auditif

Prévoir :

* réalisé/non réalisé ;
* méthode ;
* résultat ;
* observations.

### Bilirubine

Prévoir :

* réalisé/non réalisé ;
* méthode ;
* valeur ;
* unité ;
* résultat ;
* observations.

**Ne crée pas arbitrairement de seuils médicaux.** Les règles médicales doivent être validées par les autorités sanitaires compétentes.

---

# 11. Vaccins et soins initiaux

### Hépatite B

Prévoir :

* administré/non administré ;
* date ;
* heure si nécessaire ;
* professionnel/centre ;
* observations.

### Vitamine K

Indiquer clairement :

> « La vitamine K est un soin préventif et non un vaccin. »

Prévoir :

* administrée/non administrée ;
* date/heure ;
* observations.

### Pommade ophtalmique

Prévoir :

* administrée/non administrée ;
* date/heure ;
* produit si nécessaire ;
* observations.

Les protocoles médicaux doivent être configurables et validés officiellement.

---

# 12. Types de champs

Choisir le composant adapté :

* texte ;
* nombre ;
* date ;
* heure ;
* radio button ;
* checkbox ;
* dropdown ;
* recherche ;
* autocomplétion.

Pour les données géographiques, prévoir une sélection hiérarchique :

```text
Province
   ↓
Territoire
   ↓
Commune/Secteur
   ↓
Quartier/Village
```

---

# 13. Validation

Implémenter des validations permettant notamment de :

* vérifier les IDs à 9 chiffres lorsque cette règle est confirmée ;
* éviter les doublons ;
* contrôler les dates ;
* contrôler la cohérence des informations ;
* vérifier les numéros de téléphone ;
* vérifier les e-mails lorsqu'ils sont fournis ;
* identifier clairement les champs obligatoires ;
* détecter les valeurs invalides.

Les champs juridiquement ou fonctionnellement obligatoires doivent être définis explicitement.

---

# 14. Fonctionnement hors ligne

Prévoir une architecture **offline-first**.

L'application doit pouvoir :

1. créer un dossier hors ligne ;
2. stocker les données localement de manière sécurisée ;
3. afficher les dossiers non synchronisés ;
4. synchroniser lorsque la connexion revient ;
5. reprendre une synchronisation interrompue ;
6. détecter les conflits ;
7. éviter les doublons ;
8. indiquer clairement le statut de synchronisation.

Pendant les tests, cette fonctionnalité peut être simulée autour de SQLite.

---

# 15. Sécurité

Traiter les données comme des données personnelles et de santé sensibles.

Prévoir :

* authentification ;
* autorisation ;
* RBAC ;
* chiffrement des communications ;
* protection des données locales ;
* gestion sécurisée des sessions ;
* expiration des sessions ;
* logs ;
* audit ;
* sauvegardes ;
* restauration ;
* principe du moindre privilège.

Identifier les exigences juridiques et réglementaires applicables en RDC qui devront être vérifiées avant la mise en production.

---

# 16. Génération de l'acte de naissance

Après confirmation et validation du dossier, générer automatiquement un PDF contenant, selon les exigences officielles :

* identité de l'enfant ;
* identifiant ;
* identité des parents ;
* identifiants des parents ;
* date et lieu de naissance ;
* référence de l'acte ;
* date d'émission ;
* centre/autorité ayant effectué l'enregistrement ;
* QR code si autorisé ;
* signature/cachet numérique si légalement autorisé.

Ne considère pas automatiquement le PDF comme un document juridiquement valable. Identifie les éléments qui nécessitent une validation des autorités de l'état civil.

---

# 17. Structure du code

Maintiens une séparation claire des responsabilités.

Exemple :

```text
project/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── state/
│   ├── validation/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── database/
│   ├── routes/
│   ├── middleware/
│   ├── auth/
│   ├── pdf/
│   ├── sync/
│   └── utils/
│
├── tests/
│
└── README.md
```

Adapte cette structure à la stack choisie si nécessaire.

**Règle fondamentale : chaque couche doit avoir une responsabilité clairement définie.**

Évite :

* la logique métier directement dans les composants UI ;
* les requêtes SQL directement dans le frontend ;
* les accès directs à SQLite depuis les composants ;
* la duplication de logique ;
* les dépendances circulaires ;
* les valeurs médicales ou administratives codées en dur lorsqu'elles doivent être configurables.

---

# 18. Base de données

Conçois un modèle relationnel incluant notamment :

* users ;
* roles ;
* health_centers ;
* provinces ;
* territories ;
* communes_sectors ;
* villages_quarters ;
* parents ;
* children ;
* births ;
* clinical_examinations ;
* screenings ;
* vaccines ;
* care ;
* birth_certificates ;
* synchronization_queue ;
* audit_logs.

Adapte la structure si une meilleure modélisation est possible.

Pour chaque table importante, indique :

* clé primaire ;
* clés étrangères ;
* champs essentiels ;
* relations ;
* contraintes d'unicité ;
* index.

Fournis un ERD en Mermaid.

---

# 19. Workflow

Le parcours principal doit être proche de :

```text
Connexion
    ↓
Sélection du centre
    ↓
Nouveau dossier
    ↓
Recherche des parents
    ↓
Informations père
    ↓
Informations mère
    ↓
Informations enfant
    ↓
Examens et dépistages
    ↓
Vaccins et soins
    ↓
Récapitulatif
    ↓
Confirmation
    ↓
Enregistrement
    ↓
Génération du PDF
    ↓
Synchronisation
```

Prévoir également :

* parent déjà enregistré ;
* parent introuvable ;
* enfant déjà enregistré ;
* connexion interrompue ;
* formulaire abandonné ;
* erreur de synchronisation ;
* doublon ;
* correction après enregistrement.

---

# 20. Cas particuliers

Analyser et proposer une gestion pour :

* jumeaux/triplés ;
* père inconnu/non déclaré ;
* mère inconnue/non déclarée ;
* parent sans pièce d'identité ;
* naissance à domicile ;
* correction d'un acte ;
* transfert d'un dossier ;
* perte/remplacement du téléphone ;
* plusieurs agents utilisant le même centre ;
* absence prolongée de connexion ;
* doublons.

Lorsqu'une règle ne peut pas être déduite des exigences, écrire :

**« À valider par l'autorité compétente. »**

---

# 21. Livrables

Produis les éléments suivants dans cet ordre :

### A. Résumé du projet

### B. Hypothèses et points à clarifier

### C. Architecture fonctionnelle

### D. Architecture technique

Avec diagrammes Mermaid.

### E. Structure complète du projet

Présente l'arborescence `frontend/` et `backend/`.

### F. UX/UI et liste des écrans

### G. Modèle de données

Avec ERD Mermaid.

### H. API Backend

Présente les principaux endpoints et leur rôle.

### I. Architecture SQLite

Explique :

* schéma ;
* migrations ;
* repositories ;
* seed/test data ;
* reset de la base ;
* isolation de la couche SQLite.

### J. Offline-first et synchronisation

### K. Sécurité

### L. Génération du PDF

### M. Stack technologique

Compare 2–3 stacks adaptées et leurs compromis.

### N. Plan de développement

Découpe le projet en phases :

1. cadrage ;
2. conception ;
3. architecture ;
4. développement du backend ;
5. développement du frontend ;
6. intégration SQLite ;
7. tests ;
8. pilote ;
9. déploiement ;
10. évolution vers l'infrastructure gouvernementale.

### O. MVP

Identifie les fonctionnalités indispensables de la première version.

### P. Risques

Identifie les risques :

* techniques ;
* sécurité ;
* données ;
* connectivité ;
* opérationnels ;
* médicaux ;
* juridiques.

### Q. Décisions à valider

Termine par une liste priorisée des décisions qui doivent être prises par les autorités compétentes avant la mise en production.

---

# Règles de développement

1. Ne fabrique aucune règle juridique.
2. Ne fabrique aucun protocole médical.
3. Ne fabrique pas le format officiel de l'identifiant national.
4. Ne présente pas de décision non validée comme une exigence officielle.
5. Distingue les exigences fournies, les recommandations techniques et les points à valider.
6. Le code doit être modulaire et maintenable.
7. Respecte strictement la séparation `frontend/` / `backend/`.
8. Le frontend ne doit pas accéder directement à SQLite.
9. Le backend est responsable de la logique métier.
10. SQLite est la base de données locale utilisée pour le développement et les tests.
11. Prépare l'architecture pour pouvoir remplacer SQLite par une infrastructure gouvernementale ultérieurement.
12. Ne commence pas par générer tout le code de l'application.
13. Commence par analyser les exigences et concevoir l'architecture.
14. Lorsque l'architecture est suffisamment définie, développe le projet **étape par étape**, en indiquant pour chaque étape les fichiers créés ou modifiés.
15. Lorsque tu fournis du code, donne le **chemin exact du fichier** concerné.
16. Ne mets jamais plusieurs responsabilités importantes dans un même fichier lorsque cela peut être évité.
17. Fournis des instructions précises pour exécuter et tester chaque étape.
18. Toute fonctionnalité médicale, juridique ou administrative incertaine doit être explicitement marquée **« À valider par l'autorité compétente »**.
