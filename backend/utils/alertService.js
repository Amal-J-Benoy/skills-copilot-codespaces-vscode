const checkAlerts = (temperature, uvIndex) => {
    let alerts = [];
    let severity = 'SAFE';

    if (temperature > 38) {
        alerts.push('High Temperature');
        severity = 'HIGH';
    }

    if (uvIndex > 7) {
        alerts.push('High UV Exposure');
        severity = 'HIGH';
    }

    if (temperature > 38 && uvIndex > 7) {
        severity = 'CRITICAL';
    }

    return {
        alerts,
        severity,
        timestamp: new Date(),
    };
};

module.exports = { checkAlerts };