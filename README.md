# Projet Node.js - Prise de rendez-vous avec PostgreSQL

Un projet Node.js complet avec système d'authentification, réinitialisation de mot de passe et gestion des utilisateurs utilisant PostgreSQL (Neon).

## 🚀 Fonctionnalités

- ✅ **Inscription** avec validation complète des données
- ✅ **Connexion** avec JWT
- ✅ **Réinitialisation de mot de passe** par email
- ✅ **Gestion du profil utilisateur**
- ✅ **Validation des numéros de téléphone** (format 01XXXXXXXX)
- ✅ **Sécurité** : Rate limiting, CORS, Helmet
- ✅ **Architecture modulaire** : Services, Controllers, Routes séparés
- ✅ **Base de données** : PostgreSQL avec Neon

## 📁 Structure du projet

```
src/
├── config/
│   └── database.js          # Configuration PostgreSQL
├── controllers/
│   ├── authController.js    # Contrôleur authentification
│   └── userController.js    # Contrôleur utilisateurs
├── database/
│   └── migrate.js           # Migrations base de données
├── middleware/
│   ├── auth.js             # Middleware authentification
│   ├── validation.js       # Middleware validation
│   ├── errorHandler.js     # Gestionnaire d'erreurs
│   └── rateLimiter.js      # Limitation de taux
├── routes/
│   ├── authRoutes.js       # Routes authentification
│   └── userRoutes.js       # Routes utilisateurs
├── services/
│   ├── userService.js      # Service utilisateurs
│   └── emailService.js     # Service emails
├── validations/
│   └── userValidation.js   # Schémas de validation
└── server.js               # Serveur principal
```

## 🛠 Installation

1. **Cloner le projet et installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

3. **Modifier le fichier `.env`** avec vos configurations :
```env
# Base de données Neon PostgreSQL
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# JWT
JWT_SECRET=your_very_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail exemple)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Serveur
PORT=3000
BASE_URL=http://localhost:3000
```

4. **Créer les tables de la base de données**
```bash
npm run migrate
```

5. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 📊 Modèle de données - Table Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,    -- Généré automatiquement : firstname_lastname
  password VARCHAR(255) NOT NULL,           -- Hashé avec bcrypt
  phone VARCHAR(10) NOT NULL,               -- Format : 01XXXXXXXX
  sexe VARCHAR(10) NOT NULL,                -- 'Masculin' ou 'Feminin'
  adresse TEXT NOT NULL,
  reset_token VARCHAR(255),                 -- Token de réinitialisation
  reset_token_expires TIMESTAMP,           -- Expiration du token
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Endpoints API

### 🔐 Authentification (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| POST | `/forgot-password` | Demande réinitialisation |
| POST | `/reset-password` | Réinitialisation mot de passe |
| GET | `/verify-reset-token/:token` | Vérification token |

### 👤 Utilisateurs (`/api/users`) - Authentification requise

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Profil utilisateur connecté |
| PUT | `/profile` | Mise à jour profil |
| GET | `/:id` | Utilisateur par ID |

### 🔧 Système

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | État du serveur |
| GET | `/api/test-db` | Test connexion DB |
| GET | `/api/docs` | Documentation |

## 📝 Exemples d'utilisation

### 1. Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "MonMotDePasse123!",
    "phone": "0123456789",
    "sexe": "Masculin",
    "adresse": "123 Rue de la Paix, 75001 Paris"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "firstname": "Jean",
      "lastname": "Dupont",
      "email": "jean.dupont@example.com",
      "username": "jean_dupont",
      "phone": "0123456789",
      "sexe": "Masculin",
      "adresse": "123 Rue de la Paix, 75001 Paris",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "MonMotDePasse123!"
  }'
```

### 3. Demande de réinitialisation de mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com"
  }'
```

### 4. Réinitialisation du mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "password": "NouveauMotDePasse123!"
  }'
```

### 5. Accès au profil (avec authentification)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 6. Mise à jour du profil
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0187654321",
    "adresse": "456 Avenue des Champs, 75008 Paris"
  }'
```

## ✅ Validations des données

### Inscription
- **Prénom/Nom** : 2-50 caractères
- **Email** : Format email valide
- **Mot de passe** : 8+ caractères avec majuscule, minuscule, chiffre et caractère spécial
- **Téléphone** : Exactement 10 chiffres commençant par "01"
- **Sexe** : "Masculin" ou "Feminin"
- **Adresse** : 10-255 caractères

### Numéros de téléphone acceptés
✅ `0123456789` ✅ `0187654321` ✅ `0145678912`

❌ `123456789` ❌ `02123456789` ❌ `0212345678`

## 🔒 Sécurité

### Rate Limiting
- **Général** : 100 requêtes/15min par IP
- **Authentification** : 5 tentatives/15min par IP
- **Réinitialisation** : 3 demandes/heure par IP

### Protection
- Headers de sécurité avec **Helmet**
- Mots de passe hashés avec **bcrypt**
- Tokens JWT sécurisés
- Validation stricte des entrées
- Protection CORS configurée

## 📧 Configuration Email

### Gmail (recommandé)
1. Activer l'authentification à 2 facteurs
2. Générer un mot de passe d'application
3. Utiliser ces paramètres :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=mot-de-passe-application
```

### Autres providers
- **Outlook** : `smtp-mail.outlook.com:587`
- **Yahoo** : `smtp.mail.yahoo.com:587`
- **SendGrid** : `smtp.sendgrid.net:587`

## 🗃 Configuration Neon PostgreSQL

1. Créer un compte sur [Neon](https://neon.tech)
2. Créer une nouvelle base de données
3. Copier l'URL de connexion
4. Ajouter `?sslmode=require` à la fin de l'URL

```env
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🚨 Gestion des erreurs

### Codes de réponse HTTP
- **200** : Succès
- **201** : Ressource créée
- **400** : Erreur de validation
- **401** : Non authentifié
- **404** : Ressource non trouvée
- **409** : Conflit (email déjà utilisé)
- **429** : Trop de requêtes
- **500** : Erreur serveur

### Format des erreurs
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Veuillez fournir un email valide"
    }
  ]
}
```

## 🧪 Tests et développement

### Vérifier l'état du serveur
```bash
curl http://localhost:3000/health
```

### Tester la connexion à la base de données
```bash
curl http://localhost:3000/api/test-db
```

### Mode développement avec rechargement automatique
```bash
npm run dev
```

## 📦 Scripts disponibles

```bash
npm start          # Démarrer le serveur
npm run dev        # Mode développement avec nodemon
npm run migrate    # Créer les tables de la base de données
```

## 🔧 Dépannage

### Erreur de connexion à la base de données
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier que Neon PostgreSQL est accessible
- Vérifier la configuration SSL

### Emails non envoyés
- Vérifier la configuration `EMAIL_*` dans `.env`
- Tester avec `curl http://localhost:3000/api/test-db`
- Vérifier les logs du serveur

### Token JWT invalide
- Vérifier `JWT_SECRET` dans `.env`
- Le token expire selon `JWT_EXPIRES_IN`
- Format attendu : `Authorization: Bearer <token>`

## 🚀 Déploiement

### Neon PostgreSQL
1. Base de données déjà hébergée
2. Pas de configuration serveur nécessaire

### Variables d'environnement production
```env
NODE_ENV=production
DATABASE_URL=<neon-postgresql-url>
JWT_SECRET=<secret-très-sécurisé>
BASE_URL=https://votre-domaine.com
```

## 📚 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données (Neon)
- **JWT** - Authentification
- **Bcrypt** - Hashage des mots de passe
- **Joi** - Validation des données
- **Nodemailer** - Envoi d'emails
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing

## 👨‍💻 Architecture

### Séparation des responsabilités
- **Controllers** : Gestion des requêtes HTTP
- **Services** : Logique métier
- **Routes** : Définition des endpoints
- **Middleware** : Authentification, validation, erreurs
- **Validations** : Schémas de validation séparés

### Pattern MVC respecté
- **Models** : Représentés par les services
- **Views** : Réponses JSON
- **Controllers** : Gestion des interactions

Cette architecture garantit une maintenabilité et une évolutivité optimales du projet.