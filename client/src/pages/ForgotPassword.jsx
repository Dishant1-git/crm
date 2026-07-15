import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, HelpCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-radial-at-t from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-lg mb-4">
            ?
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Reset Password</h2>
          <p className="text-slate-400 text-sm mt-1">RIMT University CRM Credentials Support</p>
        </div>

        <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4 mb-6">
          <div className="flex">
            <HelpCircle className="h-6 w-6 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-white">System Security Policy</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                For administrative safety, teachers cannot reset their own passwords. If you have forgotten your password, please contact the **Head Administrator / IT Department** to initiate a reset.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Admin Office Contact
            </span>
            <span className="text-sm font-medium text-white flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2 text-blue-400" />
              dean@rimt.ac.in
            </span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all duration-150"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
