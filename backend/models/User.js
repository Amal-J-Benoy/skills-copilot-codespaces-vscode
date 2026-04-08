const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { InMemoryUserModel } = require('../config/inMemoryStore');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'worker'],
            default: 'worker',
        },
        deviceId: {
            type: String,
            required: [true, 'Please provide a device ID'],
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', UserSchema);

/**
 * Proxy that delegates to the Mongoose model when MongoDB is connected,
 * or to the in-memory implementation otherwise.
 * Controllers always call User.create / User.findOne / etc. without needing
 * to know which backend is active.
 */
const User = {
    create:   (...args) => db.isConnected() ? MongooseUser.create(...args)   : InMemoryUserModel.create(...args),
    findOne:  (...args) => db.isConnected() ? MongooseUser.findOne(...args)  : InMemoryUserModel.findOne(...args),
    findById: (...args) => db.isConnected() ? MongooseUser.findById(...args) : InMemoryUserModel.findById(...args),
    find:     (...args) => db.isConnected() ? MongooseUser.find(...args)     : InMemoryUserModel.find(...args),
};

module.exports = User;