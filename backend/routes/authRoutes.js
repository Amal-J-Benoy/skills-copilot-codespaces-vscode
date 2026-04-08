const express = require('express');
const { register, login, bootstrapAdmin, bootstrapLimiter } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/bootstrap-admin', bootstrapLimiter, bootstrapAdmin);

module.exports = router;
