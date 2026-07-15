const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Viewing is allowed for authorized logged in users
router.route('/')
  .get(getClasses)
  .post(authorize('HEAD'), createClass);

router.route('/:id')
  .get(getClass)
  .put(authorize('HEAD'), updateClass)
  .delete(authorize('HEAD'), deleteClass);

module.exports = router;
