const Student = require('../models/Student');
const Class = require('../models/Class');
const xlsx = require('xlsx');
const fs = require('fs');

// @desc    Get students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const { classId, search } = req.query;
    const filter = {};

    // Teachers can only view students in their assigned classes
    if (req.user.role === 'TEACHER') {
      filter.teacherId = req.user._id;
    }

    if (classId) {
      filter.classId = classId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .populate('classId', 'className timing semester')
      .populate('teacherId', 'name email');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student manually
// @route   POST /api/students
// @access  Private/TEACHER
exports.createStudent = async (req, res, next) => {
  try {
    const { name, rollNo, phone, email, classId } = req.body;

    // Verify class exists and is assigned to teacher
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.user.role === 'TEACHER' && cls.teacherId && cls.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to add students to this class' });
    }

    // Check roll number uniqueness in this class
    const duplicate = await Student.findOne({ rollNo, classId });
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Roll number ${rollNo} already exists in this class` });
    }

    const student = await Student.create({
      name,
      rollNo,
      phone,
      email,
      classId,
      teacherId: cls.teacherId || req.user._id
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student manually
// @route   PUT /api/students/:id
// @access  Private/TEACHER
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, rollNo, phone, email, classId } = req.body;
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check authorization
    if (req.user.role === 'TEACHER' && student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this student' });
    }

    // Check duplicate roll number if changing rollNo or classId
    if ((rollNo && rollNo !== student.rollNo) || (classId && classId !== student.classId.toString())) {
      const activeClass = classId || student.classId;
      const activeRoll = rollNo || student.rollNo;
      const duplicate = await Student.findOne({ rollNo: activeRoll, classId: activeClass, _id: { $ne: req.params.id } });
      
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Roll number ${activeRoll} already exists in this class` });
      }
    }

    const updateFields = { name, rollNo, phone, email, classId };
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    student = await Student.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/TEACHER
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check authorization
    if (req.user.role === 'TEACHER' && student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this student' });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Excel to import students
// @route   POST /api/students/upload
// @access  Private/TEACHER
exports.uploadExcel = async (req, res, next) => {
  try {
    const { classId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file' });
    }

    if (!classId) {
      // Remove temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Please specify the class ID' });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Verify teacher owns the class
    if (req.user.role === 'TEACHER' && cls.teacherId && cls.teacherId.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Not authorized to add students to this class' });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Clean up uploaded temp file
    fs.unlinkSync(req.file.path);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };

    // Columns supported: Roll Number, Student Name, Phone, Email
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      
      // Handle variations in Excel headers (spaces, casing)
      const rollNo = (row['Roll Number'] || row['rollNo'] || row['Roll No'] || row['RollNumber'] || '').toString().trim();
      const name = (row['Student Name'] || row['name'] || row['StudentName'] || row['Name'] || '').toString().trim();
      const phone = (row['Phone'] || row['phone'] || row['Phone Number'] || row['Mobile'] || '').toString().trim();
      const email = (row['Email'] || row['email'] || '').toString().trim();

      if (!rollNo || !name) {
        results.errors.push({
          row: index + 2,
          message: 'Missing roll number or student name'
        });
        continue;
      }

      try {
        // Upsert behavior: Find student with same rollNo in this class
        let student = await Student.findOne({ rollNo, classId });

        if (student) {
          // Update existing student details
          student.name = name;
          if (phone) student.phone = phone;
          if (email) student.email = email;
          await student.save();
          results.updated++;
        } else {
          // Create new student
          await Student.create({
            name,
            rollNo,
            phone,
            email,
            classId,
            teacherId: cls.teacherId || req.user._id
          });
          results.imported++;
        }
      } catch (err) {
        results.errors.push({
          row: index + 2,
          message: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete. Imported: ${results.imported}, Updated: ${results.updated}, Errors: ${results.errors.length}`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
