import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileSpreadsheet, 
  Search, 
  Loader2, 
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const TeacherReports = () => {
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchReportData();
    }
  }, [selectedClass, selectedMonth]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedClass(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load classes info');
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.classId = selectedClass;
      if (selectedMonth) params.month = selectedMonth;

      const response = await api.get('/reports/students', { params });
      setReports(response.data.data);
    } catch (error) {
      toast.error('Failed to load reports details');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedClass) return toast.error('Please select a class first');
    const params = new URLSearchParams();
    params.append('classId', selectedClass);
    if (selectedMonth) params.append('month', selectedMonth);

    const url = `/reports/export?${params.toString()}`;
    window.open(url, '_blank');
    toast.success('Downloading Excel report...');
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.rollNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Attendance Metrics</h1>
          <p className="text-sm text-slate-500 font-medium">Verify overall student attendance rates and generate Excel sheets.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-colors duration-150"
        >
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Export class sheet
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Class select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Classroom</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none"
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Month selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Month</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Student Search */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Student</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
            <p className="text-slate-500 font-medium">Aggregating records...</p>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Classes</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Present / Absent / Leave</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {report.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                      {report.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-800">
                      {report.totalMarked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <span className="text-green-600">{report.presents}</span>
                      <span className="text-slate-300 mx-2">/</span>
                      <span className="text-red-600">{report.absents}</span>
                      <span className="text-slate-300 mx-2">/</span>
                      <span className="text-amber-500">{report.leaves}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        report.attendanceRate >= 75 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {report.attendanceRate >= 75 ? null : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {report.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 font-medium">No student reports found for this class</div>
        )}
      </div>
    </div>
  );
};

export default TeacherReports;
