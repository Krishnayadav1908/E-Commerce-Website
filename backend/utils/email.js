const nodemailer = require('nodemailer');
const EmailLog = require('../models/emailLogModel');

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const enableDebug = String(process.env.SMTP_DEBUG || '').toLowerCase() === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    logger: enableDebug,
    debug: enableDebug
  });
};

const sendEmail = async ({ to, subject, text, html, type, relatedId, meta, retryOf }) => {
  const transporter = buildTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  let status = 'skipped';
  let errorMessage = '';
  let messageId = '';

  if (!transporter) {
    errorMessage = 'SMTP not configured';
    console.warn('[email] SMTP not configured');
  } else {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      status = 'success';
      messageId = info.messageId || '';
    } catch (error) {
      status = 'failed';
      errorMessage = error.message;
      console.error('[email] Send failed:', error.message);
    }
  }

  try {
    await EmailLog.create({
      to,
      subject,
      text,
      html,
      status,
      error: errorMessage,
      messageId,
      type: type || '',
      relatedId: relatedId || '',
      meta: meta || {},
      provider: 'nodemailer',
      retryOf: retryOf || null
    });
  } catch (logError) {
    console.error('Email log failed:', logError.message);
  }

  if (status === 'success') {
    return { success: true, messageId };
  }
  if (status === 'skipped') {
    return { skipped: true, error: errorMessage };
  }
  return { success: false, error: errorMessage };
};

module.exports = { sendEmail };
