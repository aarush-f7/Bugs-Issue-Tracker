import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getRoleBadgeColor } from '../utils/roleHelpers';

const Navbar = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 bg-[#0d1526]/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold">BugTrackr</span>
        </div>
      </div>

      {/* Right: user menu */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropOpen(prev => !prev)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-slate-200 text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{role}</p>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl py-1 z-50">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-slate-200 text-sm font-medium">{user?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
              <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}>
                {role}
              </span>
            </div>
            <Link
              to="/profile"
              onClick={() => setDropOpen(false)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
