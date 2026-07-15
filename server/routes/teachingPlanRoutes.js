const express = require('express');
const router = express.Router();
const {
  addTeachingPlan,
  getTeachingPlans
} = require('../controllers/teachingPlanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTeachingPlans)
  .post(authorize('TEACHER'), addTeachingPlan);

module.exports = router;
