import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  Upload,
  Download,
  BookOpen,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    phone: '',
    email: '',
    classId: ''
  });

  // Excel Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadClassId, setUploadClassId] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClassFilter]);

  const fetchInitialData = async () => {
    try {
      const classesRes = await api.get('/classes');
      setClasses(classesRes.data.data);
      if (classesRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, classId: classesRes.data.data[0]._id }));
        setUploadClassId(classesRes.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load classes info');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClassFilter) params.classId = selectedClassFilter;
      
      const response = await api.get('/students', { params });
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to retrieve students roster');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo || !formData.classId) {
      return toast.error('Name, Roll Number, and Class are required');
    }
    try {
      await api.post('/students', formData);
      toast.success('Student added successfully');
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo || !formData.classId) {
      return toast.error('Name, Roll Number, and Class are required');
    }
    try {
      await api.put(`/students/${selectedStudent._id}`, formData);
      toast.success('Student records updated');
      setShowEditModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student? All attendance records will persist.')) {
      try {
        await api.delete(`/students/${studentId}`);
        toast.success('Student removed from list');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleExcelUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error('Please select an Excel file to upload');
    if (!uploadClassId) return toast.error('Please select a class for importing students');

    const uploadFormData = new FormData();
    uploadFormData.append('file', uploadFile);
    uploadFormData.append('classId', uploadClassId);

    setUploading(true);
    try {
      const response = await api.post('/students/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      setShowUploadModal(false);
      setUploadFile(null);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Excel upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      phone: student.phone || '',
      email: student.email || '',
      classId: student.classId ? student.classId._id : ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rollNo: '',
      phone: '',
      email: '',
      classId: classes[0]?._id || ''
    });
    setSelectedStudent(null);
  };

  const downloadSampleExcel = () => {
    // Generate sample Excel columns for user reference
    const sampleRows = [
      {
        'Roll Number': '1021',
        'Student Name': 'Amanpreet Singh',
        'Course': 'BCA',
        'Semester': '1st',
        'Section': 'A',
        'Batch': '2026',
        'Phone': '9876543210',
        'Email': 'aman@rimt.ac.in'
      },
      {
        'Roll Number': '1022',
        'Student Name': 'Baldev Singh',
        'Course': 'BCA',
        'Semester': '1st',
        'Section': 'A',
        'Batch': '2026',
        'Phone': '9876543211',
        'Email': 'baldev@rimt.ac.in'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Import Roster');
    XLSX.writeFile(workbook, 'rimt_students_sample_upload.xlsx');
    toast.success('Downloaded sample upload template');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage student profiles manually or import bulk data via Excel sheets.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-colors duration-150"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Students
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center justify-center px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-sm cursor-pointer transition-colors duration-150"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and class filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-64 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3">
          <BookOpen className="h-5 w-5 text-slate-400 mr-2" />
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full bg-transparent border-none py-2 text-sm text-slate-700 focus:outline-none cursor-pointer font-semibold"
          >
            <option value="">All Assigned Classes</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
            <p className="text-slate-500 font-medium">Retrieving student records...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Detail</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {student.classId ? student.classId.className : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-700 font-medium">{student.phone || 'No Phone'}</div>
                      <div className="text-[10px] text-slate-400">{student.email || 'No Email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-150"
                          title="Delete Student"
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
          <div className="text-center py-16 text-slate-500 font-medium">No students currently registered in this class</div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amanpreet Singh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. 1021"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Assignment *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765-XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@rimt.ac.in"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Edit Student details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Roll Number *</label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Assignment *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
                  Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Upload Student Excel</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleExcelUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Import to Class *</label>
                <select
                  value={uploadClassId}
                  onChange={(e) => setUploadClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.className} ({c.timing})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Spreadsheet file (.xlsx, .xls) *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors duration-150">
                  <input
                    type="file"
                    id="excel-file"
                    accept=".xlsx, .xls"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="excel-file" className="cursor-pointer flex flex-col items-center">
                    <FileSpreadsheet className="h-10 w-10 text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">
                      {uploadFile ? uploadFile.name : 'Click to select spreadsheet'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Maximum file size: 5 MB</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Need the format template?</span>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="text-xs font-bold text-blue-900 hover:text-blue-800 flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Sample
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2.5 bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-white rounded-xl font-semibold cursor-pointer shadow-sm flex items-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload and Import'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
