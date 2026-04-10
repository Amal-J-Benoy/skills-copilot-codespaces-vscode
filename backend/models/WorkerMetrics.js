const mongoose = require('mongoose');

const WorkerMetricsSchema = new mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasksFailed: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasksPending: {
            type: Number,
            default: 0,
            min: 0,
        },
        efficiencyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalWorkingHours: {
            type: Number,
            default: 0,
            min: 0,
        },
        avgHeartRate: {
            type: Number,
            min: 0,
        },
        avgTemperatureExposure: {
            type: Number,
        },
        avgUvExposure: {
            type: Number,
            min: 0,
        },
        alertsTriggered: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastActiveAt: {
            type: Date,
        },
        department: {
            type: String,
            trim: true,
        },
        performanceRating: {
            type: String,
            enum: ['excellent', 'good', 'average', 'below-average', 'poor'],
            default: 'average',
        },
    },
    { timestamps: true }
);

WorkerMetricsSchema.index({ workerId: 1 });
WorkerMetricsSchema.index({ department: 1 });
WorkerMetricsSchema.index({ efficiencyScore: -1 });

module.exports = mongoose.model('WorkerMetrics', WorkerMetricsSchema);
