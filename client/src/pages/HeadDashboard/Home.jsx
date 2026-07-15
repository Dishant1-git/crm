import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  Loader2,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';

const COLORS = ['#16a34a', '#dc2626', '#eab308', '#2563eb']; // Present, Absent, Late, Leave

const HeadHome = () => {
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
        <p className="text-slate-500 font-medium">Gathering university records...</p>
      </div>
    );
  }

  const { stats, recentActivities, charts } = data || {
    stats: {},
    recentActivities: [],
    charts: { pieData: [], barData: [], lineData: [] }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">RIMT University CRM</h1>
        <p className="text-sm text-slate-500 font-medium">Welcome to the Administration Console. Here is your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 mr-4 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Teachers</span>
            <span className="text-2xl font-bold text-slate-800">{stats.totalTeachers || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-900 mr-4 shadow-inner">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Classes</span>
            <span className="text-2xl font-bold text-slate-800">{stats.totalClasses || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-900 mr-4 shadow-inner">
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Attendance</span>
            <span className="text-2xl font-bold text-slate-800">{stats.todayAttendanceRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-900 mr-4">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Classes marked today</span>
            <span className="text-xl font-bold text-slate-800">{stats.todayAttendanceCount || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-900 mr-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Absentees</span>
            <span className="text-xl font-bold text-slate-800">{stats.todayAbsenteesCount || 0} Students</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class attendance bar chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Class-Wise Attendance Rate (%)</h3>
          <div className="h-80">
            {charts.barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="percentage" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No class records available</div>
            )}
          </div>
        </div>

        {/* Attendance breakdown pie chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Overall Status Distribution</h3>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            {charts.pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-500 capitalize">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart monthly trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Attendance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="percentage" stroke="#1e3a8a" strokeWidth={3} dot={{ fill: '#1e3a8a', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Activities</h3>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flow-root h-72 overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              <ul className="-mb-8">
                {recentActivities.map((act, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== recentActivities.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 shadow-sm">
                            <UserCheck className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {act.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <span>No activities recorded today</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadHome;
