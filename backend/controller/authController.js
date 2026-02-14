// Get user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
const User = require('../models/userModels');
const EmailOtp = require('../models/emailOtpModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const { isValidEmail, validatePassword } = require('../utils/validation');

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtpEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: 'Verify your email - KrishCart',
    text: `Hello ${name || 'Customer'},\n\nYour verification code is: ${otp}\nThis code will expire in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `<p>Hello ${name || 'Customer'},</p><p>Your verification code is:</p><h2>${otp}</h2><p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p><p>If you did not request this, please ignore this email.</p>`,
    type: 'auth.otp',
    relatedId: email,
    meta: { channel: 'email' }
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminEmail = process.env.ADMIN_EMAIL;
    const role = adminEmail && email.toLowerCase() === adminEmail.toLowerCase()
      ? 'admin'
      : 'user';

    const user = existingUser || new User({ name, email, password: hashedPassword, role });
    user.name = name;
    user.password = hashedPassword;
    user.role = role;
    user.isVerified = false;
    user.verifiedAt = null;
    await user.save();

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      consumedAt: null
    });

    await sendOtpEmail(email, name, otp);

    res.status(201).json({ message: 'OTP sent to email', requiresOtp: true, email });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email OTP before login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const token = generateToken(user._id);
    res.json({ message: 'User logged in successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!isValidEmail(email) || !otp) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const record = await EmailOtp.findOne({ email, consumedAt: null }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.attempts >= record.maxAttempts) {
      return res.status(400).json({ message: 'Max OTP attempts reached' });
    }

    const isMatch = await bcrypt.compare(String(otp), record.otpHash);
    record.attempts += 1;
    await record.save();

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    record.consumedAt = new Date();
    await record.save();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Email verified', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      consumedAt: null
    });

    await sendOtpEmail(email, user.name, otp);

    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        zipCode: address.zipCode || user.address?.zipCode || '',
        country: address.country || user.address?.country || 'India'
      };
    }

    await user.save();

    const updatedUser = await User.findById(req.user).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};