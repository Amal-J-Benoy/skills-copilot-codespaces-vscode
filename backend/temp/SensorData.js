const mongoose = require('mongoose');

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
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Create indexes for performance
SensorDataSchema.index({ userId: 1, timestamp: -1 });
SensorDataSchema.index({ deviceId: 1 });
SensorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SensorData', SensorDataSchema);