import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  BookOpen, 
  Loader2, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const TeacherHistory = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchHistory();
    } else {
      setRecords([]);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedClass(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load classes dropdown');
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance?classId=${selectedClass}&date=${selectedDate}`);
      setRecords(response.data.data);
    } catch (error) {
      toast.error('Failed to load attendance records for this date');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.rollNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance History Calendar</h1>
        <p className="text-sm text-slate-500 font-medium">Browse previously marked records, edit student details, and verify logs.</p>
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
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Records table */}
      {selectedClass ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-700">Attendance Log for: {new Date(selectedDate).toLocaleDateString('en-GB')}</h3>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
              <p className="text-slate-500 font-medium">Retrieving attendance logs...</p>
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Remarks / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{rec.studentId?.rollNo || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{rec.studentId?.name || 'Unknown Student'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          rec.status === 'Present' ? 'bg-green-50 text-green-700'
                            : rec.status === 'Absent' ? 'bg-red-50 text-red-700'
                            : rec.status === 'Late' ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {rec.status === 'Present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {rec.status === 'Absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {rec.status === 'Late' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {rec.status === 'Leave' && <HelpCircle className="h-3 w-3 mr-1" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium italic">
                        {rec.remarks || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-medium">No attendance logs found for this date</div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 font-medium">
          Select a class to review history
        </div>
      )}
    </div>
  );
};

export default TeacherHistory;
