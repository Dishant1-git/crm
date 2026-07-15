import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  ListTodo,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Define sidebar menu options based on role
  const headLinks = [
    { name: 'Dashboard', path: '/head/dashboard', icon: LayoutDashboard },
    { name: 'Teachers', path: '/head/teachers', icon: Users },
    { name: 'Classes', path: '/head/classes', icon: BookOpen },
    { name: 'Reports', path: '/head/reports', icon: FileSpreadsheet },
    { name: 'Settings', path: '/head/settings', icon: Settings },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/teacher/students', icon: Users },
    { name: 'Mark Attendance', path: '/teacher/attendance', icon: Calendar },
    { name: 'Attendance History', path: '/teacher/history', icon: FileSpreadsheet },
    { name: 'Teaching Plan', path: '/teacher/plan', icon: ListTodo },
    { name: 'Reports', path: '/teacher/reports', icon: TrendingUp },
    { name: 'Settings', path: '/teacher/settings', icon: Settings },
  ];

  const links = user?.role === 'HEAD' ? headLinks : teacherLinks;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
          {/* Brand header */}
          <div className="flex items-center h-16 px-6 bg-blue-900 text-white">
            <span className="text-xl font-bold tracking-wider">RIMT CRM</span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-1">
              {links.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-700' : 'text-slate-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer */}
          <div className="flex-shrink-0 flex border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-900 text-white font-semibold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || 'User Name'}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate capitalize">
                  {user?.role ? user.role.toLowerCase() : 'Role'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 flex z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-800 bg-opacity-75"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex items-center h-16 px-6 bg-blue-900 text-white">
                <span className="text-xl font-bold tracking-wider">RIMT CRM</span>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {links.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-xl ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="mr-4 h-6 w-6 text-slate-400" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex border-t border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-900 text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="text-sm md:text-base font-bold text-slate-700">
            RIMT University Attendance & Student Management CRM
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
              {user?.role} Portal
            </span>
          </div>
        </header>

        {/* Page children contents */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none bg-slate-50">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
