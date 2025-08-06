const Joi = require('joi');

// Validation pour l'inscription
const registerValidation = Joi.object({
  firstname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Le prénom est requis',
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
    }),
  
  lastname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Le nom de famille est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Veuillez fournir un email valide',
      'string.empty': 'L\'email est requis'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    }),
  
  phone: Joi.string()
    .pattern(/^01\d{8}$/)
    .length(10)
    .required()
    .messages({
      'string.empty': 'Le numéro de téléphone est requis',
      'string.pattern.base': 'Le numéro de téléphone doit commencer par 01 et contenir exactement 10 chiffres',
      'string.length': 'Le numéro de téléphone doit contenir exactement 10 chiffres'
    }),
  
  sexe: Joi.string()
    .valid('Masculin', 'Feminin')
    .required()
    .messages({
      'any.only': 'Le sexe doit être "Masculin" ou "Feminin"',
      'string.empty': 'Le sexe est requis'
    }),
  
  adresse: Joi.string()
    .trim()
    .min(10)
    .max(255)
    .required()
    .messages({
      'string.empty': 'L\'adresse est requise',
      'string.min': 'L\'adresse doit contenir au moins 10 caractères',
      'string.max': 'L\'adresse ne peut pas dépasser 255 caractères'
    })
});

// Validation pour la connexion
const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Veuillez fournir un email valide',
      'string.empty': 'L\'email est requis'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Le mot de passe est requis'
    })
});

// Validation pour la demande de réinitialisation de mot de passe
const forgotPasswordValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Veuillez fournir un email valide',
      'string.empty': 'L\'email est requis'
    })
});

// Validation pour la réinitialisation de mot de passe
const resetPasswordValidation = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Le token de réinitialisation est requis'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    })
});

// Validation pour la mise à jour du profil
const updateProfileValidation = Joi.object({
  firstname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
    }),
  
  lastname: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères'
    }),
  
  phone: Joi.string()
    .pattern(/^01\d{8}$/)
    .length(10)
    .optional()
    .messages({
      'string.pattern.base': 'Le numéro de téléphone doit commencer par 01 et contenir exactement 10 chiffres',
      'string.length': 'Le numéro de téléphone doit contenir exactement 10 chiffres'
    }),
  
  sexe: Joi.string()
    .valid('Masculin', 'Feminin')
    .optional()
    .messages({
      'any.only': 'Le sexe doit être "Masculin" ou "Feminin"'
    }),
  
  adresse: Joi.string()
    .trim()
    .min(10)
    .max(255)
    .optional()
    .messages({
      'string.min': 'L\'adresse doit contenir au moins 10 caractères',
      'string.max': 'L\'adresse ne peut pas dépasser 255 caractères'
    })
});

const userIdValidation = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'L\'ID doit être un nombre',
    'number.integer': 'L\'ID doit être un nombre entier',
    'number.positive': 'L\'ID doit être positif'
  })
});
module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  userIdValidation
};