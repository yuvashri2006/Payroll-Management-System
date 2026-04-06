const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.get('/', payrollController.getPayrolls);
router.post('/', payrollController.addPayroll);
router.get('/me', payrollController.getMyPayrolls);
router.get('/verify', payrollController.verifyPayroll);
router.patch('/:id/status', payrollController.updateStatus);
router.delete('/:id', payrollController.deletePayroll);

module.exports = router;
