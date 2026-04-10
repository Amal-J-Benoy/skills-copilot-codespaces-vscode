/**
 * Mock Data Service
 * Generates realistic simulated sensor data for demo mode.
 */

const MOCK_WORKERS = [
    { _id: 'mock-w1', name: 'Alice Johnson',    email: 'alice@demo.com',   deviceId: 'ESP32_DEMO_01', role: 'worker', isActive: true  },
    { _id: 'mock-w2', name: 'Bob Martinez',     email: 'bob@demo.com',     deviceId: 'ESP32_DEMO_02', role: 'worker', isActive: true  },
    { _id: 'mock-w3', name: 'Carol Williams',   email: 'carol@demo.com',   deviceId: 'ESP32_DEMO_03', role: 'worker', isActive: false },
    { _id: 'mock-w4', name: 'David Kim',        email: 'david@demo.com',   deviceId: 'ESP32_DEMO_04', role: 'worker', isActive: true  },
    { _id: 'mock-w5', name: 'Eva Thompson',     email: 'eva@demo.com',     deviceId: 'ESP32_DEMO_05', role: 'worker', isActive: true  },
];

/** Return a random float in [min, max] rounded to `dp` decimal places. */
const rand = (min, max, dp = 1) => {
    const v = Math.random() * (max - min) + min;
    return parseFloat(v.toFixed(dp));
};

/**
 * Compute severity and alert messages from sensor values.
 */
const computeSeverity = (temperature, uvIndex) => {
    const alerts = [];
    let severity = 'SAFE';

    if (temperature >= 38.5) {
        alerts.push('Critical body temperature detected');
        severity = 'CRITICAL';
    } else if (temperature >= 37.5) {
        alerts.push('High body temperature');
        if (severity !== 'CRITICAL') severity = 'HIGH';
    }

    if (uvIndex >= 8) {
        alerts.push('Extreme UV exposure');
        severity = 'CRITICAL';
    } else if (uvIndex >= 6) {
        alerts.push('High UV exposure');
        if (severity === 'SAFE') severity = 'HIGH';
    }

    return { severity, alerts };
};

/**
 * Generate a single mock sensor reading.
 * @param {string} deviceId
 * @param {Date}   timestamp
 * @param {'safe'|'high'|'critical'} scenario
 */
const generateReading = (deviceId, timestamp, scenario = 'safe') => {
    let temperature, uvIndex;

    switch (scenario) {
        case 'critical':
            temperature = rand(38.5, 39.5);
            uvIndex     = rand(8, 11, 1);
            break;
        case 'high':
            temperature = rand(37.5, 38.5);
            uvIndex     = rand(6, 8, 1);
            break;
        default:
            temperature = rand(35, 37.4);
            uvIndex     = rand(0, 5.9, 1);
    }

    const humidity     = rand(30, 80);
    const batteryLevel = rand(20, 100, 0);

    const { severity, alerts } = computeSeverity(temperature, uvIndex);

    return {
        _id:          `mock-${deviceId}-${timestamp.getTime()}`,
        deviceId,
        temperature,
        uvIndex,
        humidity,
        batteryLevel,
        severity,
        alerts,
        createdAt:    timestamp.toISOString(),
        timestamp:    timestamp.toISOString(),
    };
};

/**
 * Build a series of `count` readings going back from now at `intervalMinutes` spacing.
 */
const generateReadingSeries = (deviceId, count = 20, intervalMinutes = 5, scenario = 'safe') => {
    const readings = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const ts = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);

        // Occasionally vary the scenario within a series for realism
        let s = scenario;
        if (scenario === 'safe' && i < 3) s = Math.random() > 0.7 ? 'high' : 'safe';

        readings.push(generateReading(deviceId, ts, s));
    }

    return readings; // newest first
};

// Pre-baked scenarios per worker so the data is consistent within a session
const WORKER_SCENARIOS = ['safe', 'high', 'safe', 'critical', 'safe'];

/** Get mock sensor data for the current worker (worker view). */
export const getMockSensorData = () => {
    const deviceId = 'ESP32_DEMO_01';
    const scenario = 'safe';
    const readings = generateReadingSeries(deviceId, 20, 5, scenario);
    return { data: { data: readings } };
};

/** Get mock worker list (admin view). */
export const getMockWorkers = () => {
    return { data: { workers: MOCK_WORKERS } };
};

/** Get mock detail for a specific worker (admin view). */
export const getMockWorkerDetail = (workerId) => {
    const worker    = MOCK_WORKERS.find((w) => w._id === workerId) || MOCK_WORKERS[0];
    const idx       = MOCK_WORKERS.indexOf(worker);
    const scenario  = WORKER_SCENARIOS[idx] || 'safe';
    const readings  = generateReadingSeries(worker.deviceId, 20, 5, scenario);

    return {
        data: {
            worker,
            recentData: readings,
        },
    };
};
