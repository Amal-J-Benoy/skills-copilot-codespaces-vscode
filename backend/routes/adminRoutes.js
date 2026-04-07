const express = require('express');
const { getAllWorkers, getAllData, getWorkerData } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/all-workers', authMiddleware, adminMiddleware, getAllWorkers);
router.get('/all-data', authMiddleware, adminMiddleware, getAllData);
router.get('/worker/:workerId', authMiddleware, adminMiddleware, getWorkerData);

module.exports = router;