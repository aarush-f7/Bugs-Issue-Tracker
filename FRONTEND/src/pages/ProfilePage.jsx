import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { getRoleBadgeColor } from '../utils/roleHelpers';
import { formatDate } from '../utils/dateFormatter';

const ProfilePage = () => {
  const { user, role, logout } = useAuth();

  const infoItems = [
    { label: 'Full Name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Member Since', value: formatDate(user?.createdAt) },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
              {role}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="space-y-4 mb-8">
          {infoItems.map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <span className="text-slate-400 text-sm">{item.label}</span>
              <span className="text-slate-200 text-sm font-medium">{item.value || 'N/A'}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
