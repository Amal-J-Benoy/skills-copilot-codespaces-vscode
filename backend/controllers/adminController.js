const User = require('../models/User');
const SensorData = require('../models/SensorData');

exports.getAllWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: 'worker' }).select('-password');

        res.status(200).json({
            count: workers.length,
            workers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllData = async (req, res) => {
    try {
        const data = await SensorData.find()
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .limit(500);

        res.status(200).json({
            count: data.length,
            data,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkerData = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const worker = await User.findById(workerId).select('-password');
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const recentData = await SensorData.find({ userId: workerId })
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json({
            worker,
            recentData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};