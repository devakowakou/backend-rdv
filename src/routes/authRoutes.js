const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validations/userValidation');

// Route d'inscription
router.post('/register', 
  validate(registerValidation),
  authController.register
);

// Route de connexion
router.post('/login', 
  validate(loginValidation),
  authController.login
);

// Route de déconnexion
router.post('/logout',
   authenticateToken,
    (req, res) => authController.logout(req, res)
);

// Route de demande de réinitialisation de mot de passe
router.post('/forgot-password', 
  validate(forgotPasswordValidation),
  authController.forgotPassword
);

// Route de réinitialisation de mot de passe
router.post('/reset-password', 
  validate(resetPasswordValidation),
  authController.resetPassword
);

// Route de vérification du token de réinitialisation
router.get('/verify-reset-token/:token', 
  authController.verifyResetToken
);

module.exports = router;