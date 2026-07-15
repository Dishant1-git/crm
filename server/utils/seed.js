const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const TeachingPlan = require('../models/TeachingPlan');

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rimt_crm');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Class.deleteMany();
    await Student.deleteMany();
    await Attendance.deleteMany();
    await TeachingPlan.deleteMany();

    console.log('Database cleared.');

    // 1. Create HEAD Administrator
    const headAdmin = await User.create({
      name: 'Dr. Ajay Gupta (Dean)',
      email: 'head@rimt.ac.in',
      password: 'password123', // Will be hashed automatically by user pre-save hook
      role: 'HEAD',
      status: 'ACTIVE'
    });
    console.log(`Created HEAD Administrator: ${headAdmin.email} (Password: password123)`);

    // 2. Create Classes
    const class1 = await Class.create({ className: 'BCA 1st', timing: 'Morning', semester: '1st' });
    const class2 = await Class.create({ className: 'BCA 2nd', timing: 'Morning', semester: '3rd' });
    const class3 = await Class.create({ className: 'MCA', timing: 'Evening', semester: '1st' });
    const class4 = await Class.create({ className: 'B.Tech CSE', timing: 'Morning', semester: '5th' });
    const class5 = await Class.create({ className: 'B.Tech AIML', timing: 'Morning', semester: '3rd' });
    console.log('Sample classes created.');

    // 3. Create Teachers
    const teacher1 = await User.create({
      name: 'Rahul Sir',
      email: 'teacher1@rimt.ac.in',
      password: 'password123',
      role: 'TEACHER',
      status: 'ACTIVE',
      assignedClasses: [class1._id, class2._id]
    });

    const teacher2 = await User.create({
      name: 'Priya Ma\'am',
      email: 'teacher2@rimt.ac.in',
      password: 'password123',
      role: 'TEACHER',
      status: 'ACTIVE',
      assignedClasses: [class3._id, class4._id]
    });

    console.log(`Created Teacher 1: ${teacher1.email} (Password: password123)`);
    console.log(`Created Teacher 2: ${teacher2.email} (Password: password123)`);

    // Update teacherId back-references on Class
    class1.teacherId = teacher1._id;
    await class1.save();
    class2.teacherId = teacher1._id;
    await class2.save();
    class3.teacherId = teacher2._id;
    await class3.save();
    class4.teacherId = teacher2._id;
    await class4.save();

    // 4. Create some initial students for BCA 1st (Rahul Sir's class) to make dashboard look loaded
    const sampleStudents = [
      { name: 'Amanpreet Singh', rollNo: '1021', phone: '9876543210', email: 'aman@rimt.ac.in', classId: class1._id, teacherId: teacher1._id },
      { name: 'Baldev Singh', rollNo: '1022', phone: '9876543211', email: 'baldev@rimt.ac.in', classId: class1._id, teacherId: teacher1._id },
      { name: 'Chandeep Kaur', rollNo: '1023', phone: '9876543212', email: 'chandeep@rimt.ac.in', classId: class1._id, teacherId: teacher1._id },
      { name: 'Divya Sharma', rollNo: '1024', phone: '9876543213', email: 'divya@rimt.ac.in', classId: class1._id, teacherId: teacher1._id },
      { name: 'Eshwar Pal', rollNo: '1025', phone: '9876543214', email: 'eshwar@rimt.ac.in', classId: class1._id, teacherId: teacher1._id }
    ];

    await Student.insertMany(sampleStudents);
    console.log('Sample students seeded for BCA 1st.');

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
