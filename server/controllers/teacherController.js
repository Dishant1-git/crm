const User = require('../models/User');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/HEAD
exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'TEACHER' }).populate('assignedClasses');
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private/HEAD
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id).populate('assignedClasses');
    if (!teacher || teacher.role !== 'TEACHER') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private/HEAD
exports.createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, assignedClasses } = req.body;

    // Check if email already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: 'TEACHER',
      assignedClasses: assignedClasses || []
    });

    // If classes were assigned, update their teacherId reference in Class collection
    if (assignedClasses && assignedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: assignedClasses } },
        { teacherId: teacher._id }
      );
    }

    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/HEAD
exports.updateTeacher = async (req, res, next) => {
  try {
    const { name, email, assignedClasses, status } = req.body;
    let teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'TEACHER') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Sync classes
    const oldClasses = teacher.assignedClasses.map(c => c.toString());
    const newClasses = assignedClasses || [];

    // Fields to update
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (status) updateData.status = status;
    updateData.assignedClasses = newClasses;

    teacher = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Clear old classes references that were removed
    const removedClasses = oldClasses.filter(c => !newClasses.includes(c));
    if (removedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: removedClasses }, teacherId: teacher._id },
        { teacherId: null }
      );
    }

    // Assign new classes references in Class collection
    if (newClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: newClasses } },
        { teacherId: teacher._id }
      );
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/HEAD
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'TEACHER') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Remove teacher references from assigned classes
    await Class.updateMany({ teacherId: teacher._id }, { teacherId: null });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset teacher password
// @route   PUT /api/teachers/:id/reset-password
// @access  Private/HEAD
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'TEACHER') {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(password, salt);
    await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};
