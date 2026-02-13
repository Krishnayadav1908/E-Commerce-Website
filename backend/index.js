
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');
require('./connection');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes
app.use(cors());

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

// Public endpoint to get Stripe Public Key for frontend
app.get('/api/stripe-public-key', (req, res) => {
  res.json({ key: process.env.STRIPE_PUBLIC_KEY });
});

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });  // Load .env from backend folder


// Protected route (add after other routes)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});






app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
