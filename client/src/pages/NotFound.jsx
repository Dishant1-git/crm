import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleGoHome = () => {
    if (user) {
      if (user.role === 'HEAD') {
        navigate('/head/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center font-sans">
      <div className="space-y-6 max-w-md">
        <div className="text-9xl font-black text-blue-900 tracking-wider">404</div>
        <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          The page you are looking for does not exist, has been removed, or you don't have authorization permissions to access it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-100 transition-all duration-150"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer transition-all duration-150 shadow-sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Home Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
