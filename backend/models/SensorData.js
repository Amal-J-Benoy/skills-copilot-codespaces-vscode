const mongoose = require('mongoose');
const db = require('../config/db');
const { InMemorySensorDataModel } = require('../config/inMemoryStore');

const SensorDataSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        temperature: {
            type: Number,
            required: [true, 'Please provide temperature reading'],
        },
        uvIndex: {
            type: Number,
            required: [true, 'Please provide UV index reading'],
        },
        alerts: {
            type: [String],
            default: [],
        },
        severity: {
            type: String,
            enum: ['SAFE', 'HIGH', 'CRITICAL'],
            default: 'SAFE',
        },
    },
    { timestamps: true }
);

// Create indexes for performance
SensorDataSchema.index({ userId: 1, createdAt: -1 });
SensorDataSchema.index({ deviceId: 1 });
SensorDataSchema.index({ createdAt: -1 });

const MongooseSensorData = mongoose.model('SensorData', SensorDataSchema);

/**
 * Proxy that delegates to the Mongoose model when MongoDB is connected,
 * or to the in-memory implementation otherwise.
 */
const SensorData = {
    create: (...args) => db.isConnected() ? MongooseSensorData.create(...args) : InMemorySensorDataModel.create(...args),
    find:   (...args) => db.isConnected() ? MongooseSensorData.find(...args)   : InMemorySensorDataModel.find(...args),
};

module.exports = SensorData;