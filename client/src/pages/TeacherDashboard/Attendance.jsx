import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  BookOpen, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const TeacherAttendance = () => {
  const location = useLocation();
  const defaultClassId = location.state?.defaultClassId || '';

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(defaultClassId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> { status, remarks }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchRoster();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
      if (response.data.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load classes dropdown');
    }
  };

  const fetchRoster = async () => {
    setLoading(true);
    try {
      // 1. Fetch all students in the class
      const studentsRes = await api.get(`/students?classId=${selectedClass}`);
      const roster = studentsRes.data.data;
      setStudents(roster);

      // 2. Try fetching existing attendance records for the selected date
      const attendanceRes = await api.get(`/attendance?classId=${selectedClass}&date=${selectedDate}`);
      const existingAttendance = attendanceRes.data.data;

      // 3. Initialize attendance states. Default to 'Present' for new days
      const stateMap = {};
      roster.forEach(student => {
        const marked = existingAttendance.find(a => a.studentId?._id === student._id);
        stateMap[student._id] = {
          status: marked ? marked.status : 'Present',
          remarks: marked ? marked.remarks : ''
        };
      });
      setAttendanceRecords(stateMap);
    } catch (error) {
      toast.error('Failed to load class roster');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const bulkSetStatus = (status) => {
    setAttendanceRecords(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = { ...updated[id], status };
      });
      return updated;
    });
    toast.success(`Marked all students as ${status}`);
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error('Please select a class');
    if (!selectedDate) return toast.error('Please select a date');

    const records = Object.entries(attendanceRecords).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks
    }));

    setSaving(true);
    try {
      const response = await api.post('/attendance', {
        classId: selectedClass,
        date: selectedDate,
        records
      });

      toast.success('Attendance saved to database.');

      // Check sheet sync report
      const sheetResult = response.data.sheetSync;
      if (sheetResult) {
        if (sheetResult.simulated) {
          toast.success('Google Sheets Sync: Logged locally (Mock Mode)');
        } else if (sheetResult.success) {
          toast.success('Google Sheets Sync: Absentees appended successfully');
        } else {
          toast.warn('Google Sheets Sync warning: Sync credentials failed');
        }
      }
      
      fetchRoster(); // Reload state
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mark Class Attendance</h1>
        <p className="text-sm text-slate-500 font-medium">Verify student rosters, mark statuses, and sync records to databases.</p>
      </div>

      {/* Select filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Class</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Cannot mark future attendance
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roster Controls and Listing */}
      {selectedClass ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Roster header tools */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-700">Roster & Attendance List</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bulkSetStatus('Present')}
                className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer transition-colors duration-150"
              >
                All Present
              </button>
              <button
                onClick={() => bulkSetStatus('Absent')}
                className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg cursor-pointer transition-colors duration-150"
              >
                All Absent
              </button>
              <button
                onClick={() => bulkSetStatus('Late')}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer transition-colors duration-150"
              >
                All Late
              </button>
            </div>
          </div>

          {/* Table List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
              <p className="text-slate-500 font-medium">Loading class roster...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {students.map((student) => {
                const record = attendanceRecords[student._id] || { status: 'Present', remarks: '' };
                return (
                  <div key={student._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/20">
                    <div className="sm:w-1/4">
                      <div className="text-sm font-bold text-slate-800 truncate">{student.name}</div>
                      <div className="text-xs text-slate-400 font-medium">Roll No: {student.rollNo}</div>
                    </div>

                    {/* Radio Button Options */}
                    <div className="flex items-center space-x-2 sm:w-2/5">
                      {['Present', 'Absent', 'Late', 'Leave'].map((status) => {
                        const isChecked = record.status === status;
                        const colors = {
                          Present: 'border-green-600 checked:bg-green-600 text-green-700 bg-green-50/50',
                          Absent: 'border-red-600 checked:bg-red-600 text-red-700 bg-red-50/50',
                          Late: 'border-yellow-500 checked:bg-yellow-500 text-yellow-600 bg-yellow-50/50',
                          Leave: 'border-blue-600 checked:bg-blue-600 text-blue-700 bg-blue-50/50'
                        };
                        return (
                          <label
                            key={status}
                            className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-150 select-none ${
                              isChecked 
                                ? status === 'Present' ? 'bg-green-50 border-green-500 text-green-700'
                                  : status === 'Absent' ? 'bg-red-50 border-red-500 text-red-700'
                                  : status === 'Late' ? 'bg-amber-50 border-amber-400 text-amber-700'
                                  : 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`attendance-${student._id}`}
                              checked={isChecked}
                              onChange={() => handleStatusChange(student._id, status)}
                              className="hidden"
                            />
                            {status}
                          </label>
                        );
                      })}
                    </div>

                    {/* Remarks Input */}
                    <div className="sm:w-1/4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick)"
                        value={record.remarks}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Submit panel */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 mr-1 text-green-600" />
                  Auto-syncs absent students to Google sheets
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-white rounded-xl font-bold cursor-pointer shadow-sm transition-all duration-150"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Attendance'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-medium">This class has no students registered. Go to Students directory to import roster.</div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100 shadow-sm">
          Please select a class to mark attendance
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
