const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getEmployees);
router.post('/', employeeController.addEmployee);
router.get('/trash', employeeController.getTrash);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.put('/:id/restore', employeeController.restoreEmployee);
router.delete('/:id/permanent', employeeController.permanentDelete);

module.exports = router;
