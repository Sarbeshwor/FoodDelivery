const express = require('express');
const router = express.Router();
const { submitApplication } = require('../controllers/deliveryApplicationController');

router.post('/', submitApplication);

module.exports = router; 