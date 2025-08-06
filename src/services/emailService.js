const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendPasswordResetEmail(email, username, token) {
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
          
          <p>Bonjour ${username},</p>
          
          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.</p>
          
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #007bff; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          
          <p><strong>Ce lien expirera dans 1 heure.</strong></p>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  async sendWelcomeEmail(email, firstname) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Bienvenue !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bienvenue ${firstname} !</h2>
          
          <p>Votre compte a été créé avec succès.</p>
          
          <p>Vous pouvez maintenant vous connecter et profiter de nos services.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de bienvenue envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration email vérifiée');
      return true;
    } catch (error) {
      console.error('❌ Erreur de configuration email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();