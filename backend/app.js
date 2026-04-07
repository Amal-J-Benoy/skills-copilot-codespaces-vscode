const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', sensorRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

module.exports = app;