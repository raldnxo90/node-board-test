// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        trim: true
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'naver'],
        default: 'local'
    },
    profileImage: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;