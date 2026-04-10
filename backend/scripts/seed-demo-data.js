#!/usr/bin/env node
/**
 * seed-demo-data.js
 *
 * Populates the demo MongoDB database with sample data for the
 * Smart Wearable Workforce Monitoring System.
 *
 * Usage:
 *   node backend/scripts/seed-demo-data.js          # seed demo DB
 *   node backend/scripts/seed-demo-data.js --clear  # clear demo DB only
 *
 * Environment variables:
 *   MONGODB_URI_DEMO  – demo database connection string (required)
 *   MONGODB_URI       – fallback if MONGODB_URI_DEMO is not set
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function hoursAgo(n) {
    const d = new Date();
    d.setHours(d.getHours() - n);
    return d;
}

function rand(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// ── Resolve connection URI ───────────────────────────────────────────────────

const DEMO_URI =
    process.env.MONGODB_URI_DEMO ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/wearable-monitoring-demo';

// ── Inline Schema Definitions ────────────────────────────────────────────────
// Defined here so this script is self-contained and does not depend on the
// in-memory proxy layer used by the main application.

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6, select: false },
        role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
        deviceId: { type: String, required: true, unique: true },
        department: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'failed', 'cancelled'],
            default: 'pending',
        },
        priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        department: { type: String },
        dueDate: { type: Date },
        completedAt: { type: Date },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

const SensorDataSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        deviceId: { type: String, required: true },
        temperature: { type: Number, required: true },
        uvIndex: { type: Number, required: true },
        humidity: { type: Number, min: 0, max: 100 },
        batteryLevel: { type: Number, min: 0, max: 100 },
        heartRate: { type: Number, min: 0 },
        alerts: { type: [String], default: [] },
        severity: { type: String, enum: ['SAFE', 'HIGH', 'CRITICAL'], default: 'SAFE' },
    },
    { timestamps: true }
);

const WorkerMetricsSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        tasksCompleted: { type: Number, default: 0 },
        tasksFailed: { type: Number, default: 0 },
        tasksPending: { type: Number, default: 0 },
        efficiencyScore: { type: Number, default: 0, min: 0, max: 100 },
        totalWorkingHours: { type: Number, default: 0 },
        avgHeartRate: { type: Number },
        avgTemperatureExposure: { type: Number },
        avgUvExposure: { type: Number },
        alertsTriggered: { type: Number, default: 0 },
        lastActiveAt: { type: Date },
        department: { type: String },
        performanceRating: {
            type: String,
            enum: ['excellent', 'good', 'average', 'below-average', 'poor'],
            default: 'average',
        },
    },
    { timestamps: true }
);

const AnalyticsSchema = new mongoose.Schema(
    {
        date: { type: Date, required: true },
        department: { type: String, default: 'all' },
        totalWorkers: { type: Number, default: 0 },
        activeWorkers: { type: Number, default: 0 },
        tasksCreated: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
        taskCompletionRate: { type: Number, default: 0 },
        avgEfficiencyScore: { type: Number, default: 0 },
        totalAlerts: { type: Number, default: 0 },
        criticalAlerts: { type: Number, default: 0 },
        avgTemperature: { type: Number },
        avgUvIndex: { type: Number },
        avgHeartRate: { type: Number },
        totalWorkingHours: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const AlertSchema = new mongoose.Schema(
    {
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        deviceId: { type: String, required: true },
        type: {
            type: String,
            enum: ['temperature', 'uv', 'humidity', 'heart_rate', 'inactivity', 'battery', 'fall_detection'],
            required: true,
        },
        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
        message: { type: String, required: true },
        value: { type: Number },
        threshold: { type: Number },
        resolved: { type: Boolean, default: false },
        resolvedAt: { type: Date },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Register models (use existing model if already registered)
const getModel = (name, schema) => {
    try { return mongoose.model(name); } catch (_) { return mongoose.model(name, schema); }
};

const User = getModel('User', UserSchema);
const Task = getModel('Task', TaskSchema);
const SensorData = getModel('SensorData', SensorDataSchema);
const WorkerMetrics = getModel('WorkerMetrics', WorkerMetricsSchema);
const Analytics = getModel('Analytics', AnalyticsSchema);
const AlertModel = getModel('Alert', AlertSchema);

// ── Clear demo database ──────────────────────────────────────────────────────

async function clearDemoDatabase() {
    console.log('[Seed] Clearing demo database…');
    await Promise.all([
        User.deleteMany({}),
        Task.deleteMany({}),
        SensorData.deleteMany({}),
        WorkerMetrics.deleteMany({}),
        Analytics.deleteMany({}),
        AlertModel.deleteMany({}),
    ]);
    console.log('[Seed] Demo database cleared.');
}

// ── Seed data ────────────────────────────────────────────────────────────────

async function seedDemoDatabase() {
    // ── 1. Hash helper ───────────────────────────────────────────────────────
    const hashPassword = async (pw) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(pw, salt);
    };

    // ── 2. Admin account ─────────────────────────────────────────────────────
    console.log('[Seed] Creating admin account…');
    const adminDoc = await User.create({
        name: 'Sarah Mitchell',
        email: 'admin@company.com',
        password: await hashPassword('admin123456'),
        role: 'admin',
        deviceId: 'ADMIN-DEVICE-000',
        department: 'Management',
        isActive: true,
    });

    // ── 3. Worker accounts ───────────────────────────────────────────────────
    console.log('[Seed] Creating worker accounts…');

    const workersData = [
        {
            name: 'James Carter',
            email: 'james.carter@company.com',
            password: await hashPassword('worker123'),
            role: 'worker',
            deviceId: 'ESP32_001',
            department: 'Construction',
            isActive: true,
        },
        {
            name: 'Priya Patel',
            email: 'priya.patel@company.com',
            password: await hashPassword('worker123'),
            role: 'worker',
            deviceId: 'ESP32_002',
            department: 'Logistics',
            isActive: true,
        },
        {
            name: 'Marcus Johnson',
            email: 'marcus.johnson@company.com',
            password: await hashPassword('worker123'),
            role: 'worker',
            deviceId: 'ESP32_003',
            department: 'Healthcare',
            isActive: true,
        },
        {
            name: 'Elena Rodriguez',
            email: 'elena.rodriguez@company.com',
            password: await hashPassword('worker123'),
            role: 'worker',
            deviceId: 'ESP32_004',
            department: 'Manufacturing',
            isActive: false,
        },
        {
            name: 'Tom Nguyen',
            email: 'tom.nguyen@company.com',
            password: await hashPassword('worker123'),
            role: 'worker',
            deviceId: 'ESP32_005',
            department: 'Utilities',
            isActive: true,
        },
    ];

    const workerDocs = await User.insertMany(workersData);

    // ── 4. Tasks (15+) ───────────────────────────────────────────────────────
    console.log('[Seed] Creating sample tasks…');

    const tasks = [
        // Construction – James Carter
        {
            title: 'Safety equipment inspection',
            description: 'Inspect all PPE on site and replace any damaged equipment.',
            assignedTo: workerDocs[0]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'high',
            department: 'Construction',
            dueDate: daysAgo(3),
            completedAt: daysAgo(3),
        },
        {
            title: 'Foundation concrete pour – Block A',
            description: 'Oversee concrete pouring for the Block A foundation section.',
            assignedTo: workerDocs[0]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'critical',
            department: 'Construction',
            dueDate: daysAgo(1),
            completedAt: daysAgo(1),
        },
        {
            title: 'Daily progress report – Week 14',
            description: 'Submit end-of-week progress report to management.',
            assignedTo: workerDocs[0]._id,
            assignedBy: adminDoc._id,
            status: 'in-progress',
            priority: 'medium',
            department: 'Construction',
            dueDate: new Date(),
        },
        // Logistics – Priya Patel
        {
            title: 'Warehouse inventory audit',
            description: 'Conduct a full inventory count and reconcile with ERP records.',
            assignedTo: workerDocs[1]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'high',
            department: 'Logistics',
            dueDate: daysAgo(5),
            completedAt: daysAgo(5),
        },
        {
            title: 'Shipment scheduling – Q2 batch',
            description: 'Coordinate delivery schedule for the Q2 outbound shipments.',
            assignedTo: workerDocs[1]._id,
            assignedBy: adminDoc._id,
            status: 'in-progress',
            priority: 'high',
            department: 'Logistics',
            dueDate: daysAgo(-2),
        },
        {
            title: 'Forklift maintenance check',
            description: 'Book and verify forklift maintenance with the service team.',
            assignedTo: workerDocs[1]._id,
            assignedBy: adminDoc._id,
            status: 'pending',
            priority: 'medium',
            department: 'Logistics',
            dueDate: daysAgo(-5),
        },
        // Healthcare – Marcus Johnson
        {
            title: 'Patient vital-signs monitoring round',
            description: 'Complete morning vital-signs check for assigned ward.',
            assignedTo: workerDocs[2]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'critical',
            department: 'Healthcare',
            dueDate: daysAgo(1),
            completedAt: daysAgo(1),
        },
        {
            title: 'Medical supplies restocking',
            description: 'Restock ward supplies from central pharmacy.',
            assignedTo: workerDocs[2]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'medium',
            department: 'Healthcare',
            dueDate: daysAgo(2),
            completedAt: daysAgo(2),
        },
        {
            title: 'Infection control audit',
            description: 'Walk through all zones and verify compliance with infection control protocols.',
            assignedTo: workerDocs[2]._id,
            assignedBy: adminDoc._id,
            status: 'in-progress',
            priority: 'high',
            department: 'Healthcare',
            dueDate: new Date(),
        },
        // Manufacturing – Elena Rodriguez
        {
            title: 'Assembly line calibration',
            description: 'Calibrate sensor arrays on assembly line 3.',
            assignedTo: workerDocs[3]._id,
            assignedBy: adminDoc._id,
            status: 'failed',
            priority: 'critical',
            department: 'Manufacturing',
            dueDate: daysAgo(4),
            notes: 'Calibration failed due to faulty sensor module. Replacement ordered.',
        },
        {
            title: 'Safety compliance review',
            description: 'Review line safety logs and file monthly compliance report.',
            assignedTo: workerDocs[3]._id,
            assignedBy: adminDoc._id,
            status: 'pending',
            priority: 'high',
            department: 'Manufacturing',
            dueDate: daysAgo(-3),
        },
        {
            title: 'Machine downtime root-cause analysis',
            description: 'Investigate and document root cause for production stoppage on 2026-04-08.',
            assignedTo: workerDocs[3]._id,
            assignedBy: adminDoc._id,
            status: 'pending',
            priority: 'high',
            department: 'Manufacturing',
            dueDate: daysAgo(-1),
        },
        // Utilities – Tom Nguyen
        {
            title: 'Electrical panel inspection – Building B',
            description: 'Inspect and test all breakers in Building B electrical room.',
            assignedTo: workerDocs[4]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'high',
            department: 'Utilities',
            dueDate: daysAgo(7),
            completedAt: daysAgo(7),
        },
        {
            title: 'Water filtration system servicing',
            description: 'Replace filter cartridges and flush system for all three filtration units.',
            assignedTo: workerDocs[4]._id,
            assignedBy: adminDoc._id,
            status: 'completed',
            priority: 'medium',
            department: 'Utilities',
            dueDate: daysAgo(2),
            completedAt: daysAgo(2),
        },
        {
            title: 'HVAC performance audit – Q2',
            description: 'Quarterly HVAC efficiency check and filter replacement across all zones.',
            assignedTo: workerDocs[4]._id,
            assignedBy: adminDoc._id,
            status: 'in-progress',
            priority: 'medium',
            department: 'Utilities',
            dueDate: daysAgo(-4),
        },
        {
            title: 'Emergency generator test run',
            description: 'Monthly test run of the standby generator; log fuel levels and output.',
            assignedTo: workerDocs[4]._id,
            assignedBy: adminDoc._id,
            status: 'pending',
            priority: 'high',
            department: 'Utilities',
            dueDate: daysAgo(-7),
        },
    ];

    await Task.insertMany(tasks);

    // ── 5. Sensor data (realistic readings per worker) ───────────────────────
    console.log('[Seed] Generating sensor data…');

    const sensorEntries = [];
    const severityFor = (temp, uv) => {
        if (temp > 39 || uv > 9) return 'CRITICAL';
        if (temp > 37.5 || uv > 7) return 'HIGH';
        return 'SAFE';
    };

    for (const worker of workerDocs) {
        if (!worker.isActive) continue;
        for (let h = 23; h >= 0; h--) {
            const temp = rand(35.0, 40.5);
            const uv = rand(1.0, 11.0);
            const humidity = rand(40, 80);
            const battery = rand(20, 100, 0);
            const heartRate = rand(65, 110, 0);
            const sev = severityFor(temp, uv);
            const alertList = [];
            if (temp > 38) alertList.push(`High temperature: ${temp}°C`);
            if (uv > 7) alertList.push(`High UV index: ${uv}`);
            sensorEntries.push({
                userId: worker._id,
                deviceId: worker.deviceId,
                temperature: temp,
                uvIndex: uv,
                humidity,
                batteryLevel: battery,
                heartRate,
                alerts: alertList,
                severity: sev,
                createdAt: hoursAgo(h),
                updatedAt: hoursAgo(h),
            });
        }
    }

    await SensorData.insertMany(sensorEntries);

    // ── 6. Worker metrics ────────────────────────────────────────────────────
    console.log('[Seed] Creating worker metrics…');

    const metricsData = [
        {
            workerId: workerDocs[0]._id,
            tasksCompleted: 12,
            tasksFailed: 1,
            tasksPending: 2,
            efficiencyScore: 88,
            totalWorkingHours: 186,
            avgHeartRate: 82,
            avgTemperatureExposure: 37.4,
            avgUvExposure: 5.2,
            alertsTriggered: 3,
            lastActiveAt: hoursAgo(1),
            department: 'Construction',
            performanceRating: 'good',
        },
        {
            workerId: workerDocs[1]._id,
            tasksCompleted: 18,
            tasksFailed: 0,
            tasksPending: 2,
            efficiencyScore: 95,
            totalWorkingHours: 210,
            avgHeartRate: 75,
            avgTemperatureExposure: 36.2,
            avgUvExposure: 2.8,
            alertsTriggered: 1,
            lastActiveAt: hoursAgo(2),
            department: 'Logistics',
            performanceRating: 'excellent',
        },
        {
            workerId: workerDocs[2]._id,
            tasksCompleted: 22,
            tasksFailed: 0,
            tasksPending: 1,
            efficiencyScore: 97,
            totalWorkingHours: 224,
            avgHeartRate: 70,
            avgTemperatureExposure: 35.8,
            avgUvExposure: 1.5,
            alertsTriggered: 0,
            lastActiveAt: hoursAgo(1),
            department: 'Healthcare',
            performanceRating: 'excellent',
        },
        {
            workerId: workerDocs[3]._id,
            tasksCompleted: 7,
            tasksFailed: 3,
            tasksPending: 3,
            efficiencyScore: 62,
            totalWorkingHours: 148,
            avgHeartRate: 88,
            avgTemperatureExposure: 38.1,
            avgUvExposure: 6.7,
            alertsTriggered: 8,
            lastActiveAt: daysAgo(2),
            department: 'Manufacturing',
            performanceRating: 'below-average',
        },
        {
            workerId: workerDocs[4]._id,
            tasksCompleted: 14,
            tasksFailed: 0,
            tasksPending: 2,
            efficiencyScore: 91,
            totalWorkingHours: 198,
            avgHeartRate: 78,
            avgTemperatureExposure: 36.8,
            avgUvExposure: 3.4,
            alertsTriggered: 2,
            lastActiveAt: hoursAgo(3),
            department: 'Utilities',
            performanceRating: 'excellent',
        },
    ];

    await WorkerMetrics.insertMany(metricsData);

    // ── 7. System alerts ─────────────────────────────────────────────────────
    console.log('[Seed] Creating system alerts…');

    const alertsData = [
        {
            workerId: workerDocs[0]._id,
            deviceId: workerDocs[0].deviceId,
            type: 'temperature',
            severity: 'HIGH',
            message: 'Body temperature exceeded safe threshold (38.6°C)',
            value: 38.6,
            threshold: 38.0,
            resolved: true,
            resolvedAt: daysAgo(1),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(2),
        },
        {
            workerId: workerDocs[0]._id,
            deviceId: workerDocs[0].deviceId,
            type: 'uv',
            severity: 'MEDIUM',
            message: 'UV exposure above recommended level (7.8)',
            value: 7.8,
            threshold: 7.0,
            resolved: true,
            resolvedAt: daysAgo(1),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(3),
        },
        {
            workerId: workerDocs[3]._id,
            deviceId: workerDocs[3].deviceId,
            type: 'temperature',
            severity: 'CRITICAL',
            message: 'CRITICAL: Body temperature reached 40.2°C – immediate action required',
            value: 40.2,
            threshold: 39.0,
            resolved: false,
            createdAt: daysAgo(1),
        },
        {
            workerId: workerDocs[3]._id,
            deviceId: workerDocs[3].deviceId,
            type: 'heart_rate',
            severity: 'HIGH',
            message: 'Elevated heart rate detected (112 BPM)',
            value: 112,
            threshold: 100,
            resolved: false,
            createdAt: hoursAgo(6),
        },
        {
            workerId: workerDocs[3]._id,
            deviceId: workerDocs[3].deviceId,
            type: 'inactivity',
            severity: 'MEDIUM',
            message: 'Worker inactive for more than 45 minutes',
            resolved: true,
            resolvedAt: daysAgo(2),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(3),
        },
        {
            workerId: workerDocs[1]._id,
            deviceId: workerDocs[1].deviceId,
            type: 'battery',
            severity: 'LOW',
            message: 'Device battery low (18%)',
            value: 18,
            threshold: 20,
            resolved: true,
            resolvedAt: daysAgo(4),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(5),
        },
        {
            workerId: workerDocs[2]._id,
            deviceId: workerDocs[2].deviceId,
            type: 'humidity',
            severity: 'MEDIUM',
            message: 'High ambient humidity detected (78%)',
            value: 78,
            threshold: 70,
            resolved: true,
            resolvedAt: daysAgo(6),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(7),
        },
        {
            workerId: workerDocs[4]._id,
            deviceId: workerDocs[4].deviceId,
            type: 'fall_detection',
            severity: 'CRITICAL',
            message: 'Potential fall detected – worker confirmed safe',
            resolved: true,
            resolvedAt: daysAgo(3),
            resolvedBy: adminDoc._id,
            createdAt: daysAgo(3),
        },
    ];

    await AlertModel.insertMany(alertsData);

    // ── 8. Analytics (last 7 days, all + per department) ────────────────────
    console.log('[Seed] Creating analytics records…');

    const departments = ['Construction', 'Logistics', 'Healthcare', 'Manufacturing', 'Utilities', 'all'];
    const analyticsEntries = [];

    for (let i = 6; i >= 0; i--) {
        for (const dept of departments) {
            analyticsEntries.push({
                date: daysAgo(i),
                department: dept,
                totalWorkers: dept === 'all' ? 5 : 1,
                activeWorkers: dept === 'Manufacturing' ? (i > 2 ? 0 : 1) : (dept === 'all' ? 4 : 1),
                tasksCreated: rand(1, 4, 0),
                tasksCompleted: rand(0, 3, 0),
                taskCompletionRate: rand(60, 100, 1),
                avgEfficiencyScore: rand(62, 97, 1),
                totalAlerts: rand(0, 4, 0),
                criticalAlerts: rand(0, 2, 0),
                avgTemperature: rand(35.5, 39.0),
                avgUvIndex: rand(1.5, 8.5),
                avgHeartRate: rand(68, 95),
                totalWorkingHours: rand(4, 9, 1),
            });
        }
    }

    await Analytics.insertMany(analyticsEntries);

    console.log('\n[Seed] ✅ Demo database seeded successfully!\n');
    console.log('  Admin account:');
    console.log('    Email   : admin@company.com');
    console.log('    Password: admin123456');
    console.log('\n  Worker accounts (all share password: worker123):');
    workerDocs.forEach((w, i) => {
        const status = w.isActive ? 'active' : 'inactive';
        console.log(`    [${i + 1}] ${w.email} – ${w.department} (${status})`);
    });
    console.log('');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const clearOnly = process.argv.includes('--clear');

    console.log(`[Seed] Connecting to demo database: ${DEMO_URI.replace(/\/\/[^@]+@/, '//<credentials>@')}`);

    await mongoose.connect(DEMO_URI);
    console.log('[Seed] Connected.\n');

    await clearDemoDatabase();

    if (!clearOnly) {
        await seedDemoDatabase();
    }

    await mongoose.disconnect();
    console.log('[Seed] Disconnected. Done.');
    process.exit(0);
}

main().catch((err) => {
    console.error('[Seed] Fatal error:', err.message);
    process.exit(1);
});
