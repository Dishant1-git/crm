const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadExcel
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(authorize('TEACHER'), createStudent);

router.route('/:id')
  .put(authorize('TEACHER'), updateStudent)
  .delete(authorize('TEACHER'), deleteStudent);

router.post('/upload', authorize('TEACHER'), upload.single('file'), uploadExcel);

module.exports = router;
