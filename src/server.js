const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, resetPasswordLimiter } = require('./middleware/rateLimiter');
const emailService = require('./services/emailService');
const app = express();
const PORT = process.env.PORT || 3000;



app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false 
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://getting-medical-rdv.vercel.app', 'http://localhost:5173']
    : ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', resetPasswordLimiter);
app.use('/api/auth/reset-password', resetPasswordLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur en fonctionnement',
    timestamp: new Date().toISOString()
  });
});

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

app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentation de l\'API',
    baseUrl: process.env.NODE_ENV === 'production'
      ? process.env.BASE_URL || 'https://backend-rdv-tlh8.onrender.com'
      : `http://localhost:${PORT}`,
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Inscription',
        'POST /api/auth/login': 'Connexion',
        'POST /api/auth/forgot-password': 'Demande de réinitialisation',
        'POST /api/auth/reset-password': 'Réinitialisation mot de passe',
        'GET /api/auth/verify-reset-token/:token': 'Vérification token',
        'POST /api/auth/logout': 'Déconnexion'
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

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    const emailConfigValid = await emailService.verifyConnection();
    if (!emailConfigValid) {
      console.warn('⚠️  Configuration email invalide - Les emails ne seront pas envoyés');
    }

    app.listen(PORT, () => {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL || 'https://backend-rdv-tlh8.onrender.com'
        : `http://localhost:${PORT}`;

      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🔗 Base URL: ${baseUrl}`);
      console.log(`📚 Documentation: ${baseUrl}/api/docs`);
      console.log(`❤️  Santé: ${baseUrl}/health`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

startServer();

module.exports = app;
