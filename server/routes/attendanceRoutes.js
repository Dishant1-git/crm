const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(authorize('TEACHER'), markAttendance);

module.exports = router;
