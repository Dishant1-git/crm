import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '../config/firebase';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mockVerifyUrl, setMockVerifyUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // student, teacher

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    dispatch(loginStart());
    try {
      let idToken = 'mock_firebase_id_token';
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'mock_api_key';

      if (isFirebaseConfigured) {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        idToken = await result.user.getIdToken();
      } else {
        console.warn('Firebase API key is mock. Triggering mock signup fallback.');
      }
      
      const res = await API.post('/auth/firebase', { 
        idToken,
        role: selectedRole 
      });
      if (res.data.success) {
        dispatch(loginSuccess(res.data));
        setSuccessMsg(isFirebaseConfigured ? 'Google Sign-up successful! Redirecting...' : 'Google Sign-up successful (Mock Mode)! Redirecting...');
        
        setTimeout(() => {
          const role = res.data.user.role;
          if (role === 'superadmin') navigate('/admin');
          else if (role === 'teacher') navigate('/teacher');
          else navigate('/student');
        }, 1500);
      }
    } catch (err) {
      dispatch(loginFailure(err.message || 'Google signup failed'));
      setErrorMsg(err.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setMockVerifyUrl('');
    
    try {
      const payload = { ...data, role: selectedRole };
      const res = await API.post('/auth/register', payload);
      
      if (res.data.success) {
        setSuccessMsg('Registration successful!');
        if (res.data.verificationUrl) {
          setMockVerifyUrl(res.data.verificationUrl);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-darkBg p-4 transition-colors duration-300">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[500px] glass-effect rounded-xl p-8 md:p-10 shadow-premium z-10 my-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join the premium enterprise learning platform
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-premium border border-red-200 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-premium border border-green-200 dark:border-green-900/50">
            <p className="font-bold">{successMsg}</p>
            {mockVerifyUrl && (
              <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Developer Verification Link (Click to verify account):</span>
                <a href={mockVerifyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                  {mockVerifyUrl}
                </a>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Click the link above to verify, then proceed to Login.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selection Grid */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-premium border transition-all ${
                  selectedRole === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500'
                }`}
              >
                <GraduationCap size={24} className="mb-2" />
                <span className="text-sm font-bold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex flex-col items-center justify-center p-4 rounded-premium border transition-all ${
                  selectedRole === 'teacher'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500'
                }`}
              >
                <BookOpen size={24} className="mb-2" />
                <span className="text-sm font-bold">Teacher</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-premium border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {errors.name && (
              <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-premium border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-premium border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || successMsg}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-premium border border-transparent text-sm font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <>
                Sign Up <ArrowRight className="ml-2" size={16} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-premium hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>Sign Up with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-light transition-all"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
