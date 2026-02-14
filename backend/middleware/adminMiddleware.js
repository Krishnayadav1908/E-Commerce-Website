const User = require('../models/userModels');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.admin = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = adminMiddleware;
