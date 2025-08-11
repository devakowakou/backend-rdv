const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken,authorizeRole } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const { updateProfileValidation,userIdValidation } = require('../validations/userValidation');
const Joi = require('joi');

// Toutes les routes utilisateur nécessitent une authentification
router.use(authenticateToken);

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', userController.getProfile);

// Route pour mettre à jour le profil de l'utilisateur connecté
router.put('/profile', 
  validate(updateProfileValidation),
  userController.updateProfile
);

// Route pour supprimer l'utilisateur connecté
router.delete('/profile', userController.deleteUser);

// Route pour obtenir un utilisateur par ID
router.get('/:id', 
  validateParams(userIdValidation),
  userController.getUserById,
  authorizeRole('admin')
);

module.exports = router;