const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['temperature', 'uv', 'humidity', 'heart_rate', 'inactivity', 'battery', 'fall_detection'],
            required: true,
        },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'MEDIUM',
        },
        message: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
        },
        threshold: {
            type: Number,
        },
        resolved: {
            type: Boolean,
            default: false,
        },
        resolvedAt: {
            type: Date,
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

AlertSchema.index({ workerId: 1, createdAt: -1 });
AlertSchema.index({ severity: 1, resolved: 1 });
AlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
