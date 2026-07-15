const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getStudentReports,
  exportReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/students', getStudentReports);
router.get('/export', exportReport);

module.exports = router;
