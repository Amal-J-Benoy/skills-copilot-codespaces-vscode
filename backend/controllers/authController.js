const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiter for the bootstrap endpoint – stricter than the general auth limiter
const bootstrapLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many bootstrap attempts. Please try again later.' },
});

exports.bootstrapLimiter = bootstrapLimiter;

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, deviceId, role } = req.body;

        if (!name || !email || !password || !deviceId) {
            return res.status(400).json({ message: 'Please provide name, email, password, and deviceId' });
        }

        const VALID_ROLES = ['admin', 'worker'];
        const requestedRole = role && VALID_ROLES.includes(role) ? role : 'worker';

        // Only an authenticated admin may create another admin account
        if (requestedRole === 'admin') {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
            if (!token) {
                return res.status(403).json({ message: 'Admin token required to create an admin account' });
            }
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (verifyErr) {
                console.error('Register admin token verify error:', verifyErr.message);
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            if (!decoded || decoded.role !== 'admin') {
                return res.status(403).json({ message: 'Only existing admins can create admin accounts' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            deviceId,
            role: requestedRole,
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

exports.bootstrapAdmin = async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress;
    console.log(`[Bootstrap] Attempt from ${ip}`);

    try {
        const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
        if (!bootstrapSecret) {
            console.warn('[Bootstrap] BOOTSTRAP_SECRET is not configured. Endpoint disabled.');
            return res.status(403).json({ message: 'Bootstrap is not configured on this server.' });
        }

        const { name, email, password, deviceId, bootstrapSecret: provided } = req.body;

        if (!provided || provided !== bootstrapSecret) {
            console.warn(`[Bootstrap] Invalid secret from ${ip}`);
            return res.status(403).json({ message: 'Invalid bootstrap secret.' });
        }

        if (!name || !email || !password || !deviceId) {
            return res.status(400).json({ message: 'Please provide name, email, password, and deviceId' });
        }

        // Only allow if no admin exists yet
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.warn(`[Bootstrap] Blocked – admin already exists (attempt from ${ip})`);
            return res.status(403).json({ message: 'Admin already exists. Bootstrap is disabled.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            deviceId,
            role: 'admin',
        });

        const token = generateToken(user._id, user.role);
        console.log(`[Bootstrap] Admin account created: ${email} from ${ip}`);
        res.status(201).json({
            message: 'Admin account created successfully',
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
        console.error('Bootstrap error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};