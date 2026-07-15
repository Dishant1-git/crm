import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Loader2, 
  Search,
  UserCheck,
  UserX,
  X
} from 'lucide-react';

const HeadTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignedClasses: [],
    status: 'ACTIVE'
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teachersRes, classesRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/classes')
      ]);
      setTeachers(teachersRes.data.data);
      setClasses(classesRes.data.data);
    } catch (error) {
      toast.error('Failed to load teachers data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill in all required fields');
    }
    try {
      await api.post('/teachers', formData);
      toast.success('Teacher added successfully');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error('Name and Email are required');
    }
    try {
      await api.put(`/teachers/${selectedTeacher._id}`, {
        name: formData.name,
        email: formData.email,
        assignedClasses: formData.assignedClasses,
        status: formData.status
      });
      toast.success('Teacher updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update teacher');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await api.put(`/teachers/${selectedTeacher._id}/reset-password`, { password: newPassword });
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This will unassign all their classes.')) {
      try {
        await api.delete(`/teachers/${teacherId}`);
        toast.success('Teacher deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      assignedClasses: teacher.assignedClasses ? teacher.assignedClasses.map(c => c._id) : [],
      status: teacher.status || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  const openResetModal = (teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword('');
    setShowResetModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      assignedClasses: [],
      status: 'ACTIVE'
    });
    setSelectedTeacher(null);
  };

  const handleClassSelection = (classId) => {
    setFormData(prev => {
      const alreadySelected = prev.assignedClasses.includes(classId);
      const updated = alreadySelected
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId];
      return { ...prev, assignedClasses: updated };
    });
  };

  // Filter teachers by search term
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage teacher profiles, passwords, and assigned classes.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center px-4 py-2.5 bg-blue-900 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-800 cursor-pointer transition-all duration-150"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Search and statistics */}
      <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teachers list table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
            <p className="text-slate-500 font-medium">Retrieving profiles...</p>
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Teacher Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Classes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-900 font-semibold shadow-inner">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-800">{teacher.name}</div>
                          <div className="text-xs text-slate-400 font-medium">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                          teacher.assignedClasses.map((cls) => (
                            <span key={cls._id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800">
                              {cls.className} ({cls.timing})
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">No classes assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === 'ACTIVE' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {teacher.status === 'ACTIVE' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openResetModal(teacher)}
                          className="p-2 text-slate-400 hover:text-blue-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Edit Teacher"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Delete Teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 font-medium">No teachers found matching search criteria</div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sir"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@rimt.ac.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Classes</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {classes.map(cls => (
                    <label key={cls._id} className="flex items-center space-x-2 text-sm text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedClasses.includes(cls._id)}
                        onChange={() => handleClassSelection(cls._id)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <span>{cls.className} ({cls.timing})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold cursor-pointer shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Teacher Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Deactivated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Classes</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {classes.map(cls => (
                    <label key={cls._id} className="flex items-center space-x-2 text-sm text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedClasses.includes(cls._id)}
                        onChange={() => handleClassSelection(cls._id)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <span>{cls.className} ({cls.timing})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold cursor-pointer shadow-sm"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 font-medium">
                Resetting password for teacher **{selectedTeacher?.name}**. Enter a new secure password below:
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold cursor-pointer shadow-sm"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadTeachers;
