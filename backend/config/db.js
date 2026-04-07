const mongoose = require('mongoose');

let _connected = false;

/** Returns true once mongoose has successfully connected to MongoDB. */
const isConnected = () => _connected;

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn('[DB] MONGODB_URI not configured – running with in-memory storage');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        _connected = true;
        console.log('[DB] MongoDB connected successfully');
    } catch (error) {
        console.warn(
            '[DB] MongoDB connection failed – running with in-memory storage:',
            error.message
        );
    }
};

module.exports = connectDB;
module.exports.isConnected = isConnected;