import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import HeadHome from '../pages/HeadDashboard/Home';
import HeadTeachers from '../pages/HeadDashboard/Teachers';
import HeadClasses from '../pages/HeadDashboard/Classes';
import HeadReports from '../pages/HeadDashboard/Reports';
import TeacherHome from '../pages/TeacherDashboard/Home';
import TeacherStudents from '../pages/TeacherDashboard/Students';
import TeacherAttendance from '../pages/TeacherDashboard/Attendance';
import TeacherHistory from '../pages/TeacherDashboard/History';
import TeacherTeachingPlan from '../pages/TeacherDashboard/TeachingPlan';
import TeacherReports from '../pages/TeacherDashboard/Reports';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

// Auth Guard to verify user logged in
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Role Guard to verify user role
const RoleGuard = ({ children, allowedRole }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== allowedRole) {
    // Redirect to fallback dashboard or 404
    return <Navigate to="/404" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Root redirect */}
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />} 
      />

      {/* Head Routes */}
      <Route
        path="/head/dashboard"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="HEAD">
              <DashboardLayout>
                <HeadHome />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/head/teachers"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="HEAD">
              <DashboardLayout>
                <HeadTeachers />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/head/classes"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="HEAD">
              <DashboardLayout>
                <HeadClasses />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/head/reports"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="HEAD">
              <DashboardLayout>
                <HeadReports />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/head/settings"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="HEAD">
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherHome />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherStudents />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherAttendance />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/history"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherHistory />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/plan"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherTeachingPlan />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/reports"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <TeacherReports />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <AuthGuard>
            <RoleGuard allowedRole="TEACHER">
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* 404 Route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
