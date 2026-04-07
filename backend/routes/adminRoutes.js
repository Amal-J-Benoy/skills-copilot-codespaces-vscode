const express = require('express');
const { getAllWorkers, getAllData, getWorkerData } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all-workers', authMiddleware, getAllWorkers);
router.get('/all-data', authMiddleware, getAllData);
router.get('/worker/:workerId', authMiddleware, getWorkerData);

module.exports = router;