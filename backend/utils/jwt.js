const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Use secret from environment variables 
};  // Expires in 1 day

module.exports = generateToken;