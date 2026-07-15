const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: [true, 'Please specify student ID']
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please specify teacher ID']
  },
  classId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: [true, 'Please specify class ID']
  },
  date: {
    type: Date,
    required: [true, 'Please specify attendance date']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave'],
    required: [true, 'Please specify status']
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// A student can only have one attendance record per day
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
