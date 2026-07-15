const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const googleSheets = require('../config/googleSheets');

// @desc    Mark or update attendance
// @route   POST /api/attendance
// @access  Private/TEACHER
exports.markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body; // records: [{ studentId, status, remarks }]

    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide classId, date, and records' });
    }

    // Verify class and authorization
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.user.role === 'TEACHER' && cls.teacherId && cls.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this class' });
    }

    // Normalize date (ignore time part)
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const savedRecords = [];
    const absenteesToSync = [];

    // Retrieve details for google sheet sync
    const teacherName = req.user.name;
    const className = cls.className;

    for (const record of records) {
      const { studentId, status, remarks } = record;

      if (!studentId || !status) {
        continue;
      }

      // Upsert attendance
      const attendance = await Attendance.findOneAndUpdate(
        { studentId, date: attendanceDate },
        {
          studentId,
          teacherId: req.user._id,
          classId,
          date: attendanceDate,
          status,
          remarks: remarks || ''
        },
        { upsert: true, new: true, runValidators: true }
      );

      savedRecords.push(attendance);

      // If status is Absent, we add it to sync list
      if (status === 'Absent') {
        const student = await Student.findById(studentId);
        if (student) {
          absenteesToSync.push({
            date: attendanceDate.toLocaleDateString('en-GB'), // DD/MM/YYYY formatting
            teacherName,
            className,
            rollNo: student.rollNo,
            name: student.name,
            status: 'Absent'
          });
        }
      }
    }

    // Sync absentees to Google Sheet in the background
    let sheetSyncResult = null;
    if (absenteesToSync.length > 0) {
      sheetSyncResult = await googleSheets.appendAbsentees(absenteesToSync);
    }

    res.status(200).json({
      success: true,
      count: savedRecords.length,
      data: savedRecords,
      sheetSync: sheetSyncResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide classId and date' });
    }

    // Normalise date
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Verify class authorization
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.user.role === 'TEACHER' && cls.teacherId && cls.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendance for this class' });
    }

    const attendanceRecords = await Attendance.find({
      classId,
      date: attendanceDate
    }).populate('studentId', 'name rollNo phone email');

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};
