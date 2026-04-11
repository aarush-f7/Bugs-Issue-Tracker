import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getReportedByMe } from '../api/bugAPI';
import BugCard from '../components/BugCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const ReportedByMePage = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReportedByMe();
        setBugs(data.bugs || data);
      } catch { toast.error('Failed to load your bugs'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  const filtered = bugs.filter(b => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.priority && b.priority !== filters.priority) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reported by Me</h1>
        <p className="text-slate-400 text-sm mt-1">{bugs.length} bug{bugs.length !== 1 ? 's' : ''} you reported</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-300 rounded-xl px-3 py-2 text-sm transition-colors">
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} className="bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-300 rounded-xl px-3 py-2 text-sm transition-colors">
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        {(filters.status || filters.priority) && (
          <button onClick={() => setFilters({ status: '', priority: '' })} className="px-3 py-2 text-slate-400 hover:text-white text-sm hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0
        ? <EmptyState title="No bugs found" description={bugs.length === 0 ? "You haven't reported any bugs yet." : 'Try adjusting your filters.'} />
        : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(bug => (
              <motion.div key={bug._id} variants={itemVariants}>
                <BugCard bug={bug} />
              </motion.div>
            ))}
          </motion.div>
        )
      }
    </motion.div>
  );
};

export default ReportedByMePage;
