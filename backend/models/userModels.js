const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({    
    name: { 
        type: String, 
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String, 
        required: true },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    refreshTokenHash: {
        type: String,
        default: null,
        select: false
    },
    refreshTokenExpiresAt: {
        type: Date,
        default: null,
        select: false
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    }
}, { timestamps: true });

// Add indexes for faster queries
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;