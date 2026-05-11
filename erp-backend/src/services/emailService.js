const nodemailer = require('nodemailer');

const requiredSmtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];

const isEmailConfigured = () => requiredSmtpKeys.every((key) => Boolean(process.env[key]));

const getLoginUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl.replace(/\/$/, '')}/login`;
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
    };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

const sendAccountCredentialsEmail = async ({ user, plainPassword }) => {
  const loginUrl = getLoginUrl();
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  try {
    return await sendMail({
      to: user.email,
      subject: 'Votre compte ERP a ete cree',
      text: [
        `Bonjour ${fullName},`,
        '',
        'Votre compte ERP a ete cree.',
        `Email: ${user.email}`,
        `Mot de passe: ${plainPassword}`,
        `Connexion: ${loginUrl}`,
        '',
        'Changez votre mot de passe apres la premiere connexion.',
      ].join('\n'),
      html: `
        <p>Bonjour ${fullName},</p>
        <p>Votre compte ERP a ete cree.</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Mot de passe:</strong> ${plainPassword}</li>
        </ul>
        <p><a href="${loginUrl}">Se connecter</a></p>
        <p>Changez votre mot de passe apres la premiere connexion.</p>
      `,
    });
  } catch (error) {
    console.error('Erreur envoi email identifiants:', error.message);
    return {
      sent: false,
      reason: error.message,
    };
  }
};

module.exports = {
  isEmailConfigured,
  sendMail,
  sendAccountCredentialsEmail,
};
