const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true
  },
  rollNo: {
    type: String,
    required: [true, 'Please add a roll number'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  classId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: [true, 'Please assign a class']
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a teacher']
  }
}, {
  timestamps: true
});

// Enforce unique roll number within a specific class
StudentSchema.index({ rollNo: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Student', StudentSchema);
