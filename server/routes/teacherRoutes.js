const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  resetPassword
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All teacher management routes require user to be logged in and have HEAD role
router.use(protect);
router.use(authorize('HEAD'));

router.route('/')
  .get(getTeachers)
  .post(createTeacher);

router.route('/:id')
  .get(getTeacher)
  .put(updateTeacher)
  .delete(deleteTeacher);

router.put('/:id/reset-password', resetPassword);

module.exports = router;
