const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'failed', 'cancelled'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        department: {
            type: String,
            trim: true,
        },
        dueDate: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ assignedBy: 1 });
TaskSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', TaskSchema);
