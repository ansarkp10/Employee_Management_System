const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

router.route('/')
  .get(getAllEmployees)
  .post(upload.single('profileImage'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;