const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, deviceId } = req.body;

        if (!name || !email || !password || !deviceId) {
            return res.status(400).json({ message: 'Please provide name, email, password, and deviceId' });
        }

        const user = await User.create({
            name,
            email,
            password,
            deviceId,
            // role intentionally omitted — defaults to 'worker'
        });

        const token = generateToken(user._id, user.role);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email or Device ID already in use' });
        }
        console.error('Register error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};