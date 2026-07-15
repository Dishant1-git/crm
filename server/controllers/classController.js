const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
  try {
    let classes;
    // HEAD gets all classes; TEACHER only gets their assigned classes
    if (req.user.role === 'HEAD') {
      classes = await Class.find().populate('teacherId', 'name email');
    } else {
      classes = await Class.find({ teacherId: req.user._id }).populate('teacherId', 'name email');
    }

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('teacherId', 'name email');
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Teacher check
    if (req.user.role === 'TEACHER' && cls.teacherId && cls.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this class' });
    }

    res.status(200).json({ success: true, data: cls });
  } catch (error) {
    next(error);
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private/HEAD
exports.createClass = async (req, res, next) => {
  try {
    const { className, timing, semester, teacherId } = req.body;

    const classExists = await Class.findOne({ className });
    if (classExists) {
      return res.status(400).json({ success: false, message: 'Class already exists' });
    }

    const cls = await Class.create({
      className,
      timing,
      semester,
      teacherId: teacherId || null
    });

    // If teacher was assigned during creation, update User assignedClasses reference
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedClasses: cls._id }
      });
    }

    res.status(201).json({
      success: true,
      data: cls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/HEAD
exports.updateClass = async (req, res, next) => {
  try {
    const { className, timing, semester, teacherId } = req.body;
    let cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const oldTeacherId = cls.teacherId;

    // Fields to update
    const updateData = {};
    if (className) updateData.className = className;
    if (timing) updateData.timing = timing;
    if (semester) updateData.semester = semester;
    updateData.teacherId = teacherId || null;

    cls = await Class.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Sync user model references
    if (oldTeacherId && oldTeacherId.toString() !== (teacherId || '')) {
      // Remove class from old teacher
      await User.findByIdAndUpdate(oldTeacherId, {
        $pull: { assignedClasses: cls._id }
      });
    }

    if (teacherId && (!oldTeacherId || oldTeacherId.toString() !== teacherId)) {
      // Add class to new teacher
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedClasses: cls._id }
      });
    }

    res.status(200).json({
      success: true,
      data: cls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/HEAD
exports.deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Remove references from users
    if (cls.teacherId) {
      await User.findByIdAndUpdate(cls.teacherId, {
        $pull: { assignedClasses: cls._id }
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
