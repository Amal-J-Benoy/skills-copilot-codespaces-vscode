// Handle unhandled promise rejections and uncaught exceptions
// Registered first so all errors are caught
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});

require('dotenv').config();

// Provide a fallback JWT secret so the server works without a .env file.
// This value is intentionally weak – always set JWT_SECRET in production!
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'wearable-monitor-dev-secret-change-in-production';
    console.warn('[Auth] JWT_SECRET not set – using insecure development default');
}

const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

/**
 * Seeds a pair of default users into the in-memory store so the login page
 * works out-of-the-box when MongoDB is not available.
 */
async function seedDefaultUsers() {
    try {
        const existing = await User.findOne({ email: 'admin@example.com' });
        if (existing) return; // already seeded

        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Admin123!',
            deviceId: 'ADMIN-DEVICE-001',
            role: 'admin',
        });
        await User.create({
            name: 'Worker User',
            email: 'worker@example.com',
            password: 'Worker123!',
            deviceId: 'WORKER-DEVICE-001',
            role: 'worker',
        });
        console.log('[Seed] Default test users created:');
        console.log('  Admin  → admin@example.com  / Admin123!');
        console.log('  Worker → worker@example.com / Worker123!');
    } catch (err) {
        console.warn('[Seed] Could not seed default users:', err.message);
    }
}

async function start() {
    // Connect to MongoDB if MONGODB_URI is configured; fall back to in-memory otherwise.
    await connectDB();

    // Seed test users when running without a real database.
    if (!connectDB.isConnected()) {
        await seedDefaultUsers();
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});