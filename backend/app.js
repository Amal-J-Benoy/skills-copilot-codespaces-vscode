const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again later' },
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'file://'],
    credentials: true
}));
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', sensorRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

module.exports = app;