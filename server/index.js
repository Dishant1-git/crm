const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());

const corsOptions = {
  origin: [
    'https://crm-lyart-nu-25.vercel.app',
    'https://crm-lyart-nu-25.vercel.app/',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting (max 100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use(limiter);

// Import controllers directly for root routes mapping
const authController = require('./controllers/authController');
const teacherController = require('./controllers/teacherController');
const studentController = require('./controllers/studentController');
const classController = require('./controllers/classController');
const attendanceController = require('./controllers/attendanceController');
const reportController = require('./controllers/reportController');
const teachingPlanController = require('./controllers/teachingPlanController');
const googleSheets = require('./config/googleSheets');
const upload = require('./middleware/uploadMiddleware');
const { protect, authorize } = require('./middleware/authMiddleware');

// User Specified API Mappings (mapped exactly as requested at the root level)
app.post('/login', authController.login);

app.post('/teacher', protect, authorize('HEAD'), teacherController.createTeacher);
app.get('/teachers', protect, authorize('HEAD'), teacherController.getTeachers);
app.put('/teacher/:id', protect, authorize('HEAD'), teacherController.updateTeacher);
app.delete('/teacher/:id', protect, authorize('HEAD'), teacherController.deleteTeacher);

// Support plural endpoints for client compatibility
app.post('/teachers', protect, authorize('HEAD'), teacherController.createTeacher);
app.put('/teachers/:id', protect, authorize('HEAD'), teacherController.updateTeacher);
app.delete('/teachers/:id', protect, authorize('HEAD'), teacherController.deleteTeacher);

app.post('/students/upload', protect, authorize('TEACHER'), upload.single('file'), studentController.uploadExcel);
app.get('/students', protect, studentController.getStudents);

app.post('/attendance', protect, authorize('TEACHER'), attendanceController.markAttendance);
app.get('/attendance', protect, attendanceController.getAttendance);

app.get('/reports', protect, reportController.getStudentReports);
app.get('/reports/export', protect, reportController.exportReport);
app.get('/reports/analytics', protect, reportController.getAnalytics);

// Classes root mapping
app.get('/classes', protect, classController.getClasses);
app.post('/classes', protect, authorize('HEAD'), classController.createClass);
app.get('/classes/:id', protect, classController.getClass);
app.put('/classes/:id', protect, authorize('HEAD'), classController.updateClass);
app.delete('/classes/:id', protect, authorize('HEAD'), classController.deleteClass);

// Teaching Plans root mapping
app.get('/teaching-plans', protect, teachingPlanController.getTeachingPlans);
app.post('/teaching-plans', protect, authorize('TEACHER'), teachingPlanController.addTeachingPlan);

// Google Sheets manually trigger sync check
app.post('/google-sheet/sync', protect, async (req, res, next) => {
  try {
    const result = await googleSheets.appendAbsentees([
      {
        date: new Date().toLocaleDateString('en-GB'),
        teacherName: req.user.name,
        className: 'Connection Verification',
        rollNo: 'TEST-01',
        name: 'Connectivity Ping',
        status: 'Absent'
      }
    ]);
    res.status(200).json({
      success: true,
      message: 'Google Sheets sync test complete.',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Modular Routes Registration (under /api for clean structure)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/teaching-plans', require('./routes/teachingPlanRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Fallback route (404 API)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
