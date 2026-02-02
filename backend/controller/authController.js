const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/jwt');

// Register a new user
exports.register = async (req, res) => {
  try {
    const {name, email, password } = req.body;
    const existingUser = await User.findOne({ email }); // Check if user already exists & findone means find single user

    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save(); // Save user to database

    const token = generateToken(user._id); // Generate JWT token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Check if user exists & findone means find single user
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const token = generateToken(user._id); // Generate JWT token
    res.json({ message: 'User logged in successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};