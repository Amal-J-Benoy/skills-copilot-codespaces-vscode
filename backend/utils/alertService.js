const TEMP_THRESHOLD = parseFloat(process.env.ALERT_TEMP_THRESHOLD) || 38;
const UV_THRESHOLD = parseFloat(process.env.ALERT_UV_THRESHOLD) || 7;
const HUMIDITY_THRESHOLD = parseFloat(process.env.ALERT_HUMIDITY_THRESHOLD) || 70;

const checkAlerts = (temperature, uvIndex, humidity) => {
    let alerts = [];
    let highCount = 0;

    if (temperature > TEMP_THRESHOLD) {
        alerts.push('High Temperature');
        highCount++;
    }

    if (uvIndex > UV_THRESHOLD) {
        alerts.push('High UV Exposure');
        highCount++;
    }

    if (humidity !== undefined && humidity !== null && humidity > HUMIDITY_THRESHOLD) {
        alerts.push('High Humidity');
        highCount++;
    }

    let severity = 'SAFE';
    if (highCount >= 2) {
        severity = 'CRITICAL';
    } else if (highCount === 1) {
        severity = 'HIGH';
    }

    return {
        alerts,
        severity,
        timestamp: new Date(),
    };
};

module.exports = { checkAlerts };