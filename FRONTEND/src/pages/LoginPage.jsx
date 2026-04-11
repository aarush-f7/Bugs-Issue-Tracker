import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../api/authAPI';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'tanay@test.com',          password: '123456', role: 'Manager',   color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { email: 'aarush@test.com',          password: '123456', role: 'Tester',    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30'   },
  { email: 'aman_goswami@example.com', password: '123456', role: 'Tester',    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30'   },
  { email: 'bharat@test.com',          password: '123456', role: 'Developer', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30'      },
];

const LoginPage = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (token) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">BugTrackr</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your workspace</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                className={`w-full bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-600'} focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-600'} focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors`}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>

        {/* Demo Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 shadow-xl"
        >
          {/* Heading */}
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-slate-300">Try Demo Accounts</span>
          </div>

          {/* Credential Rows */}
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(({ email, password, role, color }) => (
              <div
                key={email}
                className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2"
              >
                {/* Role Badge */}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0 ${color}`}>
                  {role}
                </span>

                {/* Email */}
                <span className="text-slate-400 text-xs flex-1 truncate">{email}</span>

                {/* Use Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ email, password })}
                  className="flex-shrink-0 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-2.5 py-1 transition-colors"
                >
                  Use
                </motion.button>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-slate-500 text-[11px] text-center mt-3">
            Click <span className="text-slate-400 font-medium">Use</span> to auto-fill credentials
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
