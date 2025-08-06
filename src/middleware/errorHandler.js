// Gestionnaire d'erreurs global
const errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', err);

  // Erreur de validation PostgreSQL
  if (err.code === '23505') { 
    return res.status(409).json({
      success: false,
      message: 'Une ressource avec ces données existe déjà'
    });
  }

  if (err.code === '23503') { 
    return res.status(400).json({
      success: false,
      message: 'Référence invalide'
    });
  }

  if (err.code === '23514') { 
    return res.status(400).json({
      success: false,
      message: 'Données invalides'
    });
  }

  // Erreur de connexion à la base de données
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Service temporairement indisponible'
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format JSON invalide'
    });
  }

  // erreurs 403
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit'
    });
  }
  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
};

// Gestionnaire pour les routes non trouvées
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
};

module.exports = {
  errorHandler,
  notFound
};