const express = require('express');
const { recordSensorData, getMyData } = require('../controllers/sensorController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sensor-data', recordSensorData);
router.get('/my-data', authMiddleware, getMyData);

module.exports = router;