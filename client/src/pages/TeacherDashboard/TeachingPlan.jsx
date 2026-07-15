import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Loader2, 
  Calendar, 
  Clock, 
  BookOpen, 
  MessageSquare,
  ChevronRight,
  ListTodo
} from 'lucide-react';

const TeacherTeachingPlan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    duration: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teaching-plans');
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to load teaching plans logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.topic) {
      return toast.error('Subject and Topic are required');
    }

    setSaving(true);
    try {
      await api.post('/teaching-plans', formData);
      toast.success('Teaching plan logged successfully');
      setFormData({
        subject: '',
        topic: '',
        duration: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchPlans();
    } catch (error) {
      toast.error('Failed to save teaching plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily Teaching Logs</h1>
        <p className="text-sm text-slate-500 font-medium">Record daily lectures, covered topics, class durations, and teacher remarks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Entry Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-900" />
            Add Teaching Entry
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <BookOpen className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Covered Topic *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <ListTodo className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normalization (1NF, 2NF)"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 1 Hour"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lecture Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Remarks</label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <textarea
                  rows="3"
                  placeholder="Additional remarks or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-white rounded-xl font-bold cursor-pointer transition-colors duration-150"
            >
              {saving ? 'Logging Plan...' : 'Save Teaching Log'}
            </button>
          </form>
        </div>

        {/* Plan History logs list */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Teaching History Logs</h3>
          
          <div className="overflow-y-auto max-h-[500px] divide-y divide-slate-100 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-900 mb-3" />
                <p className="text-slate-500 font-medium">Loading history logs...</p>
              </div>
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <div key={plan._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                        {plan.subject}
                      </span>
                      {plan.duration && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {plan.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{plan.topic}</h4>
                    {plan.description && (
                      <p className="text-xs text-slate-500 font-medium italic mt-1">"{plan.description}"</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-bold flex items-center flex-shrink-0 self-start md:self-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date(plan.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 text-sm font-medium">No teaching plans logged yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTeachingPlan;
