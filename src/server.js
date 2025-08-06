const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Import des middlewares
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, resetPasswordLimiter } = require('./middleware/rateLimiter');

// Import des services
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Middlewares généraux
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Routes d'authentification avec rate limiting spécifique
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', resetPasswordLimiter);
app.use('/api/auth/reset-password', resetPasswordLimiter);

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur en fonctionnement',
    timestamp: new Date().toISOString()
  });
});

// Route de test de la base de données
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

// Route de documentation simple
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentation de l\'API',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Inscription',
        'POST /api/auth/login': 'Connexion',
        'POST /api/auth/forgot-password': 'Demande de réinitialisation',
        'POST /api/auth/reset-password': 'Réinitialisation mot de passe',
        'GET /api/auth/verify-reset-token/:token': 'Vérification token'
      },
      users: {
        'GET /api/users/profile': 'Profil utilisateur (authentifié)',
        'PUT /api/users/profile': 'Mise à jour profil (authentifié)',
        'GET /api/users/:id': 'Utilisateur par ID (authentifié)'
      },
      system: {
        'GET /health': 'État du serveur',
        'GET /api/test-db': 'Test connexion base de données',
        'GET /api/docs': 'Cette documentation'
      }
    }
  });
});

// Gestionnaire pour les routes non trouvées
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Fonction de démarrage du serveur
async function startServer() {
  try {
    // Vérifier la configuration email
    const emailConfigValid = await emailService.verifyConnection();
    if (!emailConfigValid) {
      console.warn('⚠️  Configuration email invalide - Les emails ne seront pas envoyés');
    }

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Santé: http://localhost:${PORT}/health`);
      console.log(`🔒 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Variables d\'environnement à configurer:');
        console.log('   - DATABASE_URL (Neon PostgreSQL)');
        console.log('   - JWT_SECRET');
        console.log('   - EMAIL_* (pour les notifications)');
        console.log('\n🔧 Commandes utiles:');
        console.log('   - npm run migrate (créer les tables)');
        console.log('   - npm run dev (mode développement)');
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;