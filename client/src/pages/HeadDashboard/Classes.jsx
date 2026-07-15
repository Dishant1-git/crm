import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search,
  BookOpen,
  X,
  Clock
} from 'lucide-react';

const HeadClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    className: '',
    timing: 'Morning',
    semester: '',
    teacherId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/teachers')
      ]);
      setClasses(classesRes.data.data);
      setTeachers(teachersRes.data.data);
    } catch (error) {
      toast.error('Failed to load classes records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.semester) {
      return toast.error('Class Name and Semester are required');
    }
    try {
      await api.post('/classes', formData);
      toast.success('Class created successfully');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.semester) {
      return toast.error('Class Name and Semester are required');
    }
    try {
      await api.put(`/classes/${selectedClass._id}`, formData);
      toast.success('Class details updated');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update class');
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This will dissociate any students in this class.')) {
      try {
        await api.delete(`/classes/${classId}`);
        toast.success('Class deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const openEditModal = (cls) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className,
      timing: cls.timing || 'Morning',
      semester: cls.semester,
      teacherId: cls.teacherId ? cls.teacherId._id : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      className: '',
      timing: 'Morning',
      semester: '',
      teacherId: ''
    });
    setSelectedClass(null);
  };

  // Filter classes by search term
  const filteredClasses = (classes || []).filter(c => 
    c.className?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.semester?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classrooms & Courses</h1>
          <p className="text-sm text-slate-500 font-medium">Create classrooms, set schedule timings, and assign teacher supervisors.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center px-4 py-2.5 bg-blue-900 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-800 cursor-pointer transition-all duration-150"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Class
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search classes (e.g. BCA, CSE)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Classes list table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
            <p className="text-slate-500 font-medium">Loading classes...</p>
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Timing</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Teacher</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredClasses.map((cls) => (
                  <tr key={cls._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900 mr-3 shadow-inner">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-bold text-slate-800">{cls.className}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {cls.semester} Semester
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cls.timing === 'Morning' 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {cls.timing} Shift
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cls.teacherId ? (
                        <div className="text-sm font-bold text-slate-800">
                          {cls.teacherId.name}
                          <span className="block text-[10px] text-slate-400 font-medium">{cls.teacherId.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(cls)}
                          className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Edit Class"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Delete Class"
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
          <div className="text-center py-16 text-slate-500 font-medium">No classrooms currently added</div>
        )}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Create New Class</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Name *</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. BCA 1st, B.Tech CSE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester *</label>
                <input
                  type="text"
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g. 1st, 3rd, 8th"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timing Shift</label>
                <select
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {(teachers || []).map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Class details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Name *</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester *</label>
                <input
                  type="text"
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timing Shift</label>
                <select
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {(teachers || []).map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>
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
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadClasses;
