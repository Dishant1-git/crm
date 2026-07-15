const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Please add a class name'],
    unique: true,
    trim: true
  },
  timing: {
    type: String,
    enum: ['Morning', 'Evening'],
    default: 'Morning'
  },
  semester: {
    type: String,
    required: [true, 'Please specify the semester']
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', ClassSchema);
