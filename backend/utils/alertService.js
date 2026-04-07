const TEMP_THRESHOLD = parseFloat(process.env.ALERT_TEMP_THRESHOLD) || 38;
const UV_THRESHOLD = parseFloat(process.env.ALERT_UV_THRESHOLD) || 7;

const checkAlerts = (temperature, uvIndex) => {
    let alerts = [];
    let severity = 'SAFE';

    if (temperature > TEMP_THRESHOLD) {
        alerts.push('High Temperature');
        severity = 'HIGH';
    }

    if (uvIndex > UV_THRESHOLD) {
        alerts.push('High UV Exposure');
        severity = 'HIGH';
    }

    if (temperature > TEMP_THRESHOLD && uvIndex > UV_THRESHOLD) {
        severity = 'CRITICAL';
    }

    return {
        alerts,
        severity,
        timestamp: new Date(),
    };
};

module.exports = { checkAlerts };