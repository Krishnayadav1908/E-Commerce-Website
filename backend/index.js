const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');
require('./connection');



const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Protected route (add after other routes)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
