const SensorData = require('../models/SensorData');
const User = require('../models/User');
const { checkAlerts } = require('../utils/alertService');

exports.recordSensorData = async (req, res) => {
    try {
        const { deviceId, temperature, uvIndex, humidity, batteryLevel } = req.body;

        if (!deviceId || temperature === undefined || uvIndex === undefined) {
            return res.status(400).json({ message: 'Please provide deviceId, temperature, and uvIndex' });
        }

        // Find user by deviceId – coerce to string to prevent NoSQL injection
        const user = await User.findOne({ deviceId: String(deviceId) });
        if (!user) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Check alerts
        const alertInfo = checkAlerts(temperature, uvIndex, humidity);

        // Save sensor data
        const sensorData = await SensorData.create({
            userId: user._id,
            deviceId,
            temperature,
            uvIndex,
            humidity,
            batteryLevel,
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
        console.error('Record sensor data error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

exports.getMyData = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await SensorData.find({ userId }).sort({ createdAt: -1 }).limit(100);

        res.status(200).json({
            count: data.length,
            data,
        });
    } catch (error) {
        console.error('Get my data error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};