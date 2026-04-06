const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.get('/aggregate', payrollController.getAggregateReports);

module.exports = router;
