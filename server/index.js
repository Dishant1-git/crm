require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const testRoutes = require('./routes/testRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Socket handler import
const initSocket = require('./socket/index');

// Initialize database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permit any local development ports, the configured frontend url, or the production Vercel url
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://crm-wibr.vercel.app',
      'https://crm-wibr.vercel.app/'
    ];
    if (!origin || origin.startsWith('http://localhost:') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
}));

// Stripe webhook requires raw body parser before express.json()
// Express routes will evaluate match patterns sequentially
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// For all other routes, parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploads static assets
app.use('/uploads', express.static(path.join(__dirname, 'temp')));

// Welcome message/Health Check
app.get('/', (req, res) => {
  res.send('Online Learning Enterprise API Running...');
});

// Central Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Initialize Socket.IO
const io = socketio(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://crm-wibr.vercel.app',
      'https://crm-wibr.vercel.app/'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
