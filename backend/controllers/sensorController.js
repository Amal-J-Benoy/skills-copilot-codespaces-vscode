const SensorData = require('../models/SensorData');
const User = require('../models/User');
const { checkAlerts } = require('../utils/alertService');

exports.recordSensorData = async (req, res) => {
    try {
        const { deviceId, temperature, uvIndex } = req.body;

        // Find user by deviceId
        const user = await User.findOne({ deviceId });
        if (!user) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Check alerts
        const alertInfo = checkAlerts(temperature, uvIndex);

        // Save sensor data
        const sensorData = await SensorData.create({
            userId: user._id,
            deviceId,
            temperature,
            uvIndex,
            alerts: alertInfo.alerts,
            severity: alertInfo.severity,
        });

        res.status(201).json({
            message: 'Sensor data recorded successfully',
            data: sensorData,
            alerts: alertInfo.alerts,
            severity: alertInfo.severity,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyData = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await SensorData.find({ userId }).sort({ timestamp: -1 }).limit(100);

        res.status(200).json({
            count: data.length,
            data,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};