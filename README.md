# Task Manager

Application de gestion de tâches (Full Stack) permettant de consulter, créer, modifier et supprimer des tâches, avec recherche, filtres et changement rapide de statut.

Réalisée dans le cadre d'un test technique Développeur Full Stack Java / Angular.

## Fonctionnalités

- Liste des tâches avec états de chargement et messages d'erreur
- Pagination côté serveur de la liste des tâches
- Création, modification, suppression
- Consultation du détail d'une tâche
- Changement de statut directement depuis la liste
- Recherche par titre (avec debounce) et filtres par statut et priorité (filtrage côté serveur)
- Validation des formulaires (client) et des données (serveur)
- Interface responsive (Angular Material)

Chaque tâche possède : `id`, `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`), `createdAt`.

## Technologies

| Couche | Technologie |
|---|---|
| Frontend | Angular 22 (CLI 22.2.1), Angular Material, RxJS, Signals, Vitest |
| Backend | Java 21, Spring Boot 4.1.1, Spring Web, Spring Data JPA, Bean Validation, Maven |
| Base de données | PostgreSQL 16 (Docker Compose) |
| Tests backend | JUnit 5, Mockito, MockMvc |

## Prérequis

- Java 21 (JDK)
- Node.js 20 ou supérieur (développé avec 24.15.0) et npm
- Angular CLI : `npm install -g @angular/cli`
- Docker et Docker Compose (ou un PostgreSQL local, voir plus bas)
- Git

## Structure du projet

```
taskmanager/
├── docker-compose.yml        # PostgreSQL
├── backend/taskmanager/      # API Spring Boot
│   └── src/main/java/com/djenna/taskmanager/
│       ├── controller/       # Endpoints REST
│       ├── service/          # Logique métier
│       ├── repository/       # Accès aux données (Spring Data JPA)
│       ├── entity/           # Entité Task et enums
│       ├── dto/              # Objets d'entrée/sortie de l'API
│       ├── exception/        # Gestion globale des erreurs
│       └── config/           # Configuration CORS
└── frontend/                 # Application Angular
    └── src/app/
        ├── components/       # task-list, task-form, task-detail
        ├── services/         # task-api (appels HTTP)
        └── models/           # Types et libellés
```

## Installation et lancement

### 1. Cloner le projet

```bash
git clone <https://github.com/DIASSIVI-sys/taskmanager>
cd taskmanager
```

### 2. Base de données PostgreSQL

```bash
docker compose up -d
```

Informations de connexion :

| Paramètre | Valeur |
|---|---|
| Hôte | `localhost` |
| Port | `5432` |
| Base | `taskmanager` |
| Utilisateur | `taskuser` |
| Mot de passe | `taskpass` |

Pour arrêter la base : `docker compose down` (les données sont conservées dans le volume `pgdata` ; `docker compose down -v` les supprime).

La table `tasks` est créée automatiquement au premier démarrage du backend.

**Sans Docker** : installer PostgreSQL localement, puis exécuter :

```sql
CREATE USER taskuser WITH PASSWORD 'taskpass';
CREATE DATABASE taskmanager OWNER taskuser;
```

**Port 5432 déjà utilisé** : modifier le port côté hôte dans `docker-compose.yml` (par exemple `"5433:5432"`) et lancer le backend avec `DB_URL=jdbc:postgresql://localhost:5433/taskmanager`.

### 3. Backend (http://localhost:8080)

```bash
cd backend/taskmanager
./mvnw spring-boot:run
```

Sous Windows PowerShell : `.\mvnw.cmd spring-boot:run`

La configuration (`application.yaml`) lit les variables d'environnement suivantes, avec ces valeurs par défaut :

| Variable | Défaut |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/taskmanager` |
| `DB_USER` | `taskuser` |
| `DB_PASSWORD` | `taskpass` |

### 4. Frontend (http://localhost:4200)

Dans un second terminal :

```bash
cd frontend
npm install
ng serve
```

Ouvrir ensuite http://localhost:4200. Le backend doit être démarré, et l'application doit être ouverte via `localhost` (le CORS n'autorise que `http://localhost:4200`).

## API REST

| Méthode | URL | Description | Codes |
|---|---|---|---|
| GET | `/api/tasks` | Liste paginée (filtres `search`, `status`, `priority`, `page`, `size`, optionnels) | 200 |
| GET | `/api/tasks/{id}` | Détail d'une tâche | 200, 404 |
| POST | `/api/tasks` | Création | 201, 400 |
| PUT | `/api/tasks/{id}` | Modification complète | 200, 400, 404 |
| PATCH | `/api/tasks/{id}/status` | Changement de statut | 200, 400, 404 |
| DELETE | `/api/tasks/{id}` | Suppression | 204, 404 |

Exemple de corps pour `POST` / `PUT` :

```json
{
  "title": "Préparer la démo",
  "description": "Optionnel",
  "status": "TODO",
  "priority": "HIGH"
}
```

Exemple de requête : `GET /api/tasks?search=démo&status=TODO&priority=HIGH&page=0&size=10`

La liste renvoie `content`, `page`, `size`, `totalElements` et `totalPages`. Les paramètres de pagination ont pour défaut `page=0` et `size=10` ; la taille est limitée à 100.

Format des erreurs :

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": { "title": "must not be blank" },
  "timestamp": "2026-10-03T18:22:51Z"
}
```

Sont gérés : ressource inexistante (404), validation des champs (400), JSON invalide ou valeur d'enum inconnue (400), paramètre de type incorrect, par exemple `/api/tasks/abc` (400).

## Tests

Backend (depuis `backend/taskmanager`) :

```bash
./mvnw test
```

- `TaskServiceTest` : tests unitaires du service avec Mockito (création, lecture, modification, statut, suppression, 404, filtres)
- `TaskControllerTest` : tests de la couche HTTP avec MockMvc (codes de statut, validation, format des erreurs)
- `TaskmanagerApplicationTests` : démarrage du contexte Spring (nécessite PostgreSQL démarré)

Frontend (depuis `frontend`) :

```bash
ng test --watch=false
```

Tests Vitest : service HTTP (`HttpTestingController`), formulaire (validation, description vide convertie en `null`), détail, liste et composant racine.

## Choix techniques

- **Architecture en couches** : Controller → Service → Repository → PostgreSQL, chaque couche a une seule responsabilité.
- **DTO** (`TaskRequest`, `TaskResponse`, `StatusUpdateRequest`) : l'entité n'est jamais exposée, et le client ne peut pas définir `id` ni `createdAt`.
- **Filtres dynamiques avec `Specification`** : recherche et filtres combinables, exécutés côté base.
- **`PATCH /api/tasks/{id}/status`** : endpoint dédié au changement rapide de statut, en plus de l'API minimale demandée.
- **Gestion globale des erreurs** (`@RestControllerAdvice`) : réponses JSON homogènes, sans exposer de stack trace.
- **Enums stockés en texte** (`EnumType.STRING`) : base lisible, et robuste si l'ordre de l'enum change.
- **Angular Material** : composants prêts à l'emploi (dialogues, snackbar, formulaires, barre de chargement) et intégration native avec Angular.
- **Signals et formulaires réactifs** : état de la liste (chargement, erreur) réactif, validation déclarée dans le code.
- **Service Angular dédié** (`TaskApi`) : seul point d'accès à l'API, les composants ne font pas d'appels HTTP.
- **Variables d'environnement** pour la connexion à la base, avec valeurs par défaut pour le développement.

## Améliorations possibles

- Migrations avec Flyway ou Liquibase à la place de `ddl-auto: update`
- Authentification utilisateur
- Documentation Swagger/OpenAPI
- Dockerisation complète (Backend + Frontend dans le Docker Compose)
- URL de l'API dans un fichier d'environnement Angular (actuellement en dur dans `TaskApi`)
- Tests d'intégration avec Testcontainers et tests E2E

## Notes

- PostgreSQL 16 est utilisé dans Docker Compose ; le développement local a été fait avec une instance PostgreSQL installée sur la machine.
- Le projet ne contient pas de secrets : les identifiants de la base sont ceux du développement local.
