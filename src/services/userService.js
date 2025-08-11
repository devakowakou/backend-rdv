const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const emailService = require('./emailService');

class UserService {
  generateUsername(firstname, lastname) {
    const cleanFirstname = firstname.toLowerCase().replace(/\s+/g, '');
    const cleanLastname = lastname.toLowerCase().replace(/\s+/g, '');
    return `${cleanFirstname}_${cleanLastname}`;
  }

  async checkEmailExists(email) {
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  async checkUsernameExists(username) {
    const query = 'SELECT id FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows.length > 0;
  }

  async createUser(userData) {
  const { firstname, lastname, email, password, phone, sexe, adresse, role } = userData;
  const allowedRoles = ['admin', 'patient', 'docteur'];
  let finalRole = role && allowedRoles.includes(role.toLowerCase()) 
    ? role.toLowerCase() 
    : 'patient';
  if (finalRole === 'admin') {
    finalRole = 'patient';
  }

  let username = this.generateUsername(firstname, lastname);
  let counter = 1;
  while (await this.checkUsernameExists(username)) {
    username = `${this.generateUsername(firstname, lastname)}_${counter}`;
    counter++;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const query = `
    INSERT INTO users (firstname, lastname, email, username, password, phone, sexe, adresse, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, firstname, lastname, email, username, phone, sexe, adresse, role, created_at
  `;
  const values = [
    firstname, 
    lastname, 
    email, 
    username, 
    hashedPassword, 
    phone, 
    sexe, 
    adresse, 
    finalRole
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}


  async authenticateUser(email, password) {
    const query = `
      SELECT id, firstname, lastname, email, username, password, phone, sexe, adresse, role, created_at
      FROM users WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.token = this.generateJWT(user.id, user.role);
    return userWithoutPassword;
  }

  generateJWT(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async saveResetToken(email, token) {
    const expiresAt = new Date(Date.now() + 3600000); 
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2 
      WHERE email = $3
      RETURNING id, firstname, lastname, email, role
    `;
    const result = await pool.query(query, [token, expiresAt, email]);
    if (result.rows.length === 0) {
      throw new Error('Email non trouvé');
    }
    return result.rows[0];
  }

  async verifyResetToken(token) {
    const query = `
      SELECT id, firstname, lastname, email, reset_token_expires
      FROM users 
      WHERE reset_token = $1 AND reset_token_expires > NOW()
    `;
    const result = await pool.query(query, [token]);
    if (result.rows.length === 0) {
      throw new Error('Token invalide ou expiré');
    }
    return result.rows[0];
  }

  async resetPassword(token, newPassword) {
    const user = await this.verifyResetToken(token);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password = $1, reset_token = NULL, reset_token_expires = NULL
      WHERE id = $2
      RETURNING id, firstname, lastname, email, username
    `;

    const result = await pool.query(query, [hashedPassword, user.id]);
    return result.rows[0];
  }

  async getUserById(userId) {
    const query = `
      SELECT id, firstname, lastname, email, username, phone, sexe, adresse, role, created_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    return result.rows[0];
  }

  async updateUser(userId, updateData) {
    const allowedFields = ['firstname', 'lastname', 'phone', 'sexe', 'adresse'];
    const updates = [];
    const values = [];
    let paramIndex = 1;
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    if (updates.length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }
    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, firstname, lastname, email, username, phone, sexe, adresse, role, updated_at
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    return result.rows[0];
  }

  async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    return result.rows[0];
  }

  async requestPasswordReset(email) {
    const token = this.generateResetToken();
    const user = await this.saveResetToken(email, token);

    await emailService.sendPasswordResetEmail(user.email, user.username, token);

    return { 
      message: 'Email de réinitialisation envoyé' 
    };
  }
}

module.exports = new UserService();
