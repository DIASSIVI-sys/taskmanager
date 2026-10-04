# Task Manager : Frontend

Interface web de l'application de gestion de tâches, développée avec **Angular 22** (CLI 22.2.1) et **Angular Material**.

Elle communique avec l'API REST Spring Boot du dossier `backend/` (voir le [README principal](../README.md) pour le projet complet).

## Fonctionnalités

- Liste paginée des tâches (pagination côté serveur, paginateur en français)
- Création et modification via un formulaire en dialogue, avec validation
- Consultation du détail d'une tâche
- Changement rapide du statut depuis la carte
- Suppression avec dialogue de confirmation Material
- Recherche par titre (avec debounce) et filtres par statut et priorité
- Notifications de succès et d'erreur stylisées
- États de chargement, d'erreur et de liste vide
- Interface responsive

## Technologies

- Angular 22 (composants standalone, signals, nouvelle syntaxe `@if` / `@for`)
- Angular Material (dialogues, formulaires, paginateur, snackbar, barre de chargement)
- RxJS (`debounceTime`, `distinctUntilChanged`, `takeUntilDestroyed`)
- Formulaires réactifs
- Vitest pour les tests unitaires

## Prérequis

- Node.js 20 ou supérieur (développé avec 24.15.0) et npm
- Angular CLI : `npm install -g @angular/cli`
- Le backend démarré sur http://localhost:8080 (voir le README principal)

## Installation et lancement

Depuis le dossier `frontend` :

```bash
npm install
ng serve
```

Ouvrir ensuite http://localhost:4200. L'application se recharge automatiquement à chaque modification.

L'application doit être ouverte via `localhost` : le CORS du backend n'autorise que `http://localhost:4200`.

## Configuration de l'API

L'URL de l'API est définie dans `src/app/services/task-api.ts` :

```ts
private readonly baseUrl = 'http://localhost:8080/api/tasks';
```

Pour utiliser un autre backend, modifier cette valeur (et adapter le CORS côté backend). Un fichier d'environnement serait une amélioration possible.

## Structure

```
src/app/
├── components/
│   ├── task-list/        # Liste, recherche, filtres, pagination
│   ├── task-form/        # Dialogue de création / modification
│   ├── task-detail/      # Dialogue de consultation
│   ├── confirm-dialog/   # Dialogue de confirmation réutilisable
│   └── notification/     # Notification personnalisée (snackbar)
├── services/
│   ├── task-api.ts       # Appels HTTP vers l'API
│   └── notification-service.ts
└── models/
    └── task.model.ts     # Types, enums et libellés français
```

Principe : les composants n'effectuent jamais d'appels HTTP eux-mêmes, tout passe par `TaskApi`. Les notifications passent par `NotificationService`, ce qui évite d'appeler `MatSnackBar` directement dans les composants.

## Tests unitaires

```bash
ng test --watch=false
```

Sans `--watch=false`, les tests restent en mode surveillance. Ils couvrent notamment :

- `TaskApi` : méthodes HTTP, paramètres de filtre et de pagination (`HttpTestingController`)
- `TaskForm` : validation, description vide convertie en `null`
- `TaskDetail` : affichage des libellés français
- `ConfirmDialog` et `NotificationService`
- composants `TaskList` et `App`

## Build de production

```bash
ng build
```

Les fichiers générés sont placés dans `dist/`.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `ng serve` | Serveur de développement |
| `ng test --watch=false` | Lance les tests une fois |
| `ng build` | Build de production |
| `ng generate component components/nom` | Génère un composant |

## Pistes d'amélioration

- URL de l'API dans un fichier d'environnement
- Tri des tâches
- Tests end-to-end
- Internationalisation complète
