const mongoose = require('mongoose');

const TeachingPlanSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject name'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Please add a topic'],
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeachingPlan', TeachingPlanSchema);
