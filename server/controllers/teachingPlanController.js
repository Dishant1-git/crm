const TeachingPlan = require('../models/TeachingPlan');

// @desc    Add daily teaching plan
// @route   POST /api/teaching-plans
// @access  Private/TEACHER
exports.addTeachingPlan = async (req, res, next) => {
  try {
    const { subject, topic, duration, description, date } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ success: false, message: 'Please provide subject and topic' });
    }

    const plan = await TeachingPlan.create({
      teacherId: req.user._id,
      subject,
      topic,
      duration,
      description, // Remarks/details
      date: date ? new Date(date) : undefined
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teaching plans history
// @route   GET /api/teaching-plans
// @access  Private
exports.getTeachingPlans = async (req, res, next) => {
  try {
    const filter = {};

    // Teachers can only view their own plans
    if (req.user.role === 'TEACHER') {
      filter.teacherId = req.user._id;
    } else {
      // HEAD can filter by teacher
      if (req.query.teacherId) {
        filter.teacherId = req.query.teacherId;
      }
    }

    const plans = await TeachingPlan.find(filter)
      .populate('teacherId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};
