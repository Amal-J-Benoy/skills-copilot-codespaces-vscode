const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        department: {
            type: String,
            trim: true,
            default: 'all',
        },
        totalWorkers: {
            type: Number,
            default: 0,
        },
        activeWorkers: {
            type: Number,
            default: 0,
        },
        tasksCreated: {
            type: Number,
            default: 0,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
        },
        taskCompletionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        avgEfficiencyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalAlerts: {
            type: Number,
            default: 0,
        },
        criticalAlerts: {
            type: Number,
            default: 0,
        },
        avgTemperature: {
            type: Number,
        },
        avgUvIndex: {
            type: Number,
        },
        avgHeartRate: {
            type: Number,
        },
        totalWorkingHours: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

AnalyticsSchema.index({ date: -1, department: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
