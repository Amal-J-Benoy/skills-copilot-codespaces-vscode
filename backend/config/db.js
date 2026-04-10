const mongoose = require('mongoose');

let _connected = false;

/** Returns true once mongoose has successfully connected to MongoDB. */
const isConnected = () => _connected;

/**
 * Resolves the active MongoDB connection URI based on environment variables.
 *
 * Priority:
 *  1. DB_MODE=demo  → MONGODB_URI_DEMO
 *  2. DB_MODE=prod  → MONGODB_URI_PROD
 *  3. Fallback      → MONGODB_URI  (backward-compatible)
 */
const resolveMongoURI = () => {
    const mode = (process.env.DB_MODE || '').toLowerCase();
    if (mode === 'demo' && process.env.MONGODB_URI_DEMO) {
        return process.env.MONGODB_URI_DEMO;
    }
    if (mode === 'prod' && process.env.MONGODB_URI_PROD) {
        return process.env.MONGODB_URI_PROD;
    }
    // Prefer the mode-specific prod URI even without DB_MODE if MONGODB_URI is absent
    return process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || null;
};

const connectDB = async () => {
    const uri = resolveMongoURI();
    if (!uri) {
        console.warn('[DB] No MongoDB URI configured – running with in-memory storage');
        return;
    }
    const mode = (process.env.DB_MODE || '').toLowerCase();
    const label = mode === 'demo' ? 'DEMO' : mode === 'prod' ? 'PROD' : 'default';
    try {
        await mongoose.connect(uri);
        _connected = true;
        console.log(`[DB] MongoDB connected successfully (${label})`);
    } catch (error) {
        console.warn(
            `[DB] MongoDB connection failed (${label}) – running with in-memory storage:`,
            error.message
        );
    }
};

module.exports = connectDB;
module.exports.isConnected = isConnected;
module.exports.resolveMongoURI = resolveMongoURI;