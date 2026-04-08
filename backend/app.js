const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust the first proxy hop so express-rate-limit can correctly read the
// client IP from the X-Forwarded-For header when the app is behind a
// reverse proxy or a development tool such as VS Code Live Server.
app.set('trust proxy', 1);

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

// Resolve allowed CORS origins from the environment or fall back to common dev ports.
// Set ALLOWED_ORIGINS as a comma-separated list in .env to override.
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:5500'];

// Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
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

// Serve the static HTML frontend — placed after API routes so API paths
// are matched first and static file serving acts as a fallback.
app.use(express.static(path.join(__dirname, '../frontend/public')));

module.exports = app;