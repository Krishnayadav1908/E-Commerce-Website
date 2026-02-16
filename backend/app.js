const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Sentry = require('@sentry/node');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./connection');

const app = express();

app.set('trust proxy', 1);  

const sentryDsn = process.env.SENTRY_DSN;
const isValidSentryDsn = sentryDsn && sentryDsn !== 'your_backend_sentry_dsn';

if (isValidSentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0)
  });

  const sentryRequestHandler = Sentry.Handlers?.requestHandler?.();
  if (sentryRequestHandler) {
    app.use(sentryRequestHandler);
  }
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Products route
const productsRoutes = require('./routes/products');
app.use('/api/products', productsRoutes);

// Payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

// Order routes
const orderRoutes = require('./routes/order');
app.use('/api/order', orderRoutes);

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Public endpoint to get Stripe Public Key for frontend
app.get('/api/stripe-public-key', (req, res) => {
  res.json({ key: process.env.STRIPE_PUBLIC_KEY });
});

// Health endpoint for uptime checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

if (isValidSentryDsn) {
  const sentryErrorHandler = Sentry.Handlers?.errorHandler?.();
  if (sentryErrorHandler) {
    app.use(sentryErrorHandler);
  }
}

// Fallback error handler
app.use((err, req, res, next) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;
