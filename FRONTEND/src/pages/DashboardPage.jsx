import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats, getProjectStats } from '../api/dashboardAPI';
import { getAllProjects } from '../api/projectAPI';
import { getAllBugs } from '../api/bugAPI';
import BugCard from '../components/BugCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

// Animated count-up number
const CountUp = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StatCard = ({ label, value, color, icon }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.03, y: -4 }}
    className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-200"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-0.5">
        <CountUp target={Number(value) || 0} />
      </p>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, bugsData, projectsData] = await Promise.all([
          getDashboardStats(),
          getAllBugs(),
          getAllProjects(),
        ]);
        setStats(statsData.stats || statsData);
        const bugs = bugsData.bugs || bugsData;
        setRecentBugs(bugs.slice(0, 5));
        setProjects(projectsData.projects || projectsData);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProject) { setProjectStats(null); return; }
    getProjectStats(selectedProject)
      .then(data => setProjectStats(data.stats || data))
      .catch(() => toast.error('Failed to load project stats'));
  }, [selectedProject]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <LoadingSpinner size="lg" />
    </div>
  );

  const displayStats = projectStats || stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening in your workspace.</p>
      </div>

      {/* Project filter */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-slate-400 text-sm font-medium">Filter by Project:</label>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-3 py-2 text-sm transition-colors min-w-40"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          label="Total Bugs"
          value={displayStats?.total || 0}
          color="bg-indigo-500/20"
          icon={<svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Open (To Do)"
          value={displayStats?.todo || displayStats?.open || 0}
          color="bg-slate-500/20"
          icon={<svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="In Progress"
          value={displayStats?.inProgress || 0}
          color="bg-blue-500/20"
          icon={<svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard
          label="Done"
          value={displayStats?.done || displayStats?.closed || 0}
          color="bg-green-500/20"
          icon={<svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </motion.div>

      {/* Priority breakdown */}
      {displayStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-white font-semibold mb-4">Priority Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-400 text-sm font-medium">High</span>
              <span className="text-red-300 font-bold text-lg">
                <CountUp target={displayStats?.high || 0} />
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-400 text-sm font-medium">Medium</span>
              <span className="text-amber-300 font-bold text-lg">
                <CountUp target={displayStats?.medium || 0} />
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-green-400 text-sm font-medium">Low</span>
              <span className="text-green-300 font-bold text-lg">
                <CountUp target={displayStats?.low || 0} />
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent bugs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-white font-semibold mb-4">Recent Bugs</h2>
        {recentBugs.length === 0 ? (
          <p className="text-slate-400 text-sm">No bugs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentBugs.map((bug, i) => (
              <motion.div
                key={bug._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                <BugCard bug={bug} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
