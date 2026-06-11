const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByDate,
  getEmployeeAttendanceReport
} = require('../controllers/attendanceController');

router.post('/mark', markAttendance);
router.get('/date/:date', getAttendanceByDate);
router.get('/report', getEmployeeAttendanceReport);

module.exports = router;