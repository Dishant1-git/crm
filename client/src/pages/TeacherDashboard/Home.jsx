import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  Loader2, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/reports/analytics');
        setData(response.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-900 mb-4" />
        <p className="text-slate-500 font-medium">Gathering academic records...</p>
      </div>
    );
  }

  const { stats, classes } = data || { stats: {}, classes: [] };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium">Quick statistics and today's classes at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 mr-4 shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Classes</span>
            <span className="text-2xl font-bold text-slate-800">{stats.assignedClassesCount || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-900 mr-4 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-bold text-slate-800">{stats.totalStudents || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-900 mr-4 shadow-inner">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Attendance</span>
            <span className="text-2xl font-bold text-slate-800">{stats.attendanceRate || 0}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-900 mr-4 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Absentees Today</span>
            <span className="text-2xl font-bold text-slate-800">{stats.todayAbsenteesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Assigned Classes Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Your Classrooms</h3>
          <div className="divide-y divide-slate-100">
            {classes.length > 0 ? (
              classes.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-slate-50/30 rounded-xl transition-all duration-150 px-2">
                  <div className="flex items-center space-x-3">
                    <span className="h-10 w-10 bg-blue-50 text-blue-900 font-bold rounded-xl flex items-center justify-center shadow-inner">
                      {cls.className.charAt(0)}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cls.className}</h4>
                      <p className="text-xs text-slate-400 font-medium capitalize">{cls.timing} Shift | Semester {cls.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/teacher/attendance"
                      state={{ defaultClassId: cls._id }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-all duration-150"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">No classrooms assigned to you yet</div>
            )}
          </div>
        </div>

        {/* Today's Absentees list widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-lg font-bold text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Today's Absentees
          </h3>
          <div className="overflow-y-auto max-h-[300px] divide-y divide-slate-100 pr-1">
            {stats.todayAbsentees && stats.todayAbsentees.length > 0 ? (
              stats.todayAbsentees.map((student, index) => {
                const cls = classes.find(c => c._id === student.classId);
                return (
                  <div key={index} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{student.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">Roll No: {student.rollNo}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 uppercase">
                      {cls ? cls.className : 'Class'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                No absentees reported today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
