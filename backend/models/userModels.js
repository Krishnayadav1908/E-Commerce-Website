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

const User = mongoose.model('User', userSchema);

module.exports = User;