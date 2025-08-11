const userService = require('../services/userService');

class UserController {
  async getProfile(req, res) {
    try {
      const user = req.user; 

      res.json({
        success: true,
        message: 'Profil récupéré avec succès',
        data: { user }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      delete updateData.role;
      const updatedUser = await userService.updateUser(userId, updateData);
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);

      if (error.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Aucun champ valide à mettre à jour') {
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
  async deleteUser(req, res) {
    try {
      const userId = req.user.id;
      await userService.deleteUser(userId);
      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès',  
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      if (error.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
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

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json({
        success: true,
        message: 'Utilisateur récupéré avec succès',
        user 
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);

      if (error.message === 'Utilisateur non trouvé') {
        return res.status(404).json({
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

module.exports = new UserController();
