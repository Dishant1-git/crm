import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Loader2, 
  Mail, 
  Shield,
  BookOpen
} from 'lucide-react';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      return toast.error('Please fill in all fields');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return toast.error('New passwords do not match');
    }

    setSaving(true);
    try {
      // In this CRM, we can trigger a profile self-reset endpoint or reset through general admin reset.
      // Let's call the reset-password endpoint.
      await api.put(`/teachers/${user._id}/reset-password`, { password: passwordData.newPassword });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your personal profile and security configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-900" />
            Profile Details
          </h3>

          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-900 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-900/10">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">{user?.name}</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 uppercase mt-1 tracking-wider">
                {user?.role} Portal
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <Mail className="h-4 w-4 mr-3 text-slate-400" />
              {user?.email}
            </div>
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <Shield className="h-4 w-4 mr-3 text-slate-400" />
              Account Status: <span className="text-green-600 ml-1 font-bold">Active</span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-900" />
            Security & Password Change
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-white rounded-xl font-bold cursor-pointer transition-colors duration-150 flex items-center shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
