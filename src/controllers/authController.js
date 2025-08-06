const userService = require('../services/userService');
const emailService = require('../services/emailService');

class AuthController {

    async register(req, res) {
    try {
      const userData = req.body;

      const emailExists = await userService.checkEmailExists(userData.email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }

      const user = await userService.createUser(userData);

      emailService.sendWelcomeEmail(user.email, user.username).catch(err => {
        console.error('Erreur envoi email de bienvenue:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        user
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userService.authenticateUser(email, password);

      const token = userService.generateJWT(user.id, user.role);

      res.json({
        success: true,
        message: 'Connexion réussie',
        token
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      if (error.message === 'Email ou mot de passe incorrect') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: "Déconnexion réussie. "
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur"
      });
    }
  }


  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const result = await userService.requestPasswordReset(email);
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      
      if (error.message === 'Email non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Aucun compte associé à cet email'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await userService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });

    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      
      if (error.message === 'Token invalide ou expiré') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  // Vérification du token de réinitialisation
  async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      const user = await userService.verifyResetToken(token);

      res.json({
        success: true,
        message: 'Token valide',
        data: {
          email: user.email,
          firstname: user.firstname
        }
      });

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      
      if (error.message === 'Token invalide ou expiré') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

module.exports = new AuthController();