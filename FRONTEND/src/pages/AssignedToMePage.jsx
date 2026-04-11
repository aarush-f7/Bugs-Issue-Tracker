import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedToMe, updateBugStatus } from '../api/bugAPI';
import BugStatusBadge from '../components/BugStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = ['To Do', 'In Progress', 'Done'];

const AssignedToMePage = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getAssignedToMe();
      setBugs(data.bugs || data);
    } catch { toast.error('Failed to load assigned bugs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (bugId, status) => {
    setUpdatingId(bugId);
    setBugs(prev => prev.map(b => b._id === bugId ? { ...b, status } : b));
    try {
      await updateBugStatus(bugId, status);
      toast.success(`Status → "${status}"`);
    } catch {
      toast.error('Update failed');
      load();
    } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  const grouped = STATUS_COLUMNS.reduce((acc, s) => {
    acc[s] = bugs.filter(b => b.status === s);
    return acc;
  }, {});

  const columnColors = {
    'To Do': { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
    'In Progress': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    'Done': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Assigned to Me</h1>
        <p className="text-slate-400 text-sm mt-1">{bugs.length} bug{bugs.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {bugs.length === 0
        ? <EmptyState title="No bugs assigned" description="You have no bugs assigned to you yet. Check back later!" />
        : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STATUS_COLUMNS.map(status => {
              const col = columnColors[status];
              return (
                <div key={status} className={`${col.bg} border ${col.border} rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className={`font-semibold text-sm ${col.text}`}>{status}</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">{grouped[status].length}</span>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {grouped[status].map((bug, i) => (
                        <motion.div
                          key={bug._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/40 transition-all hover:shadow-lg group"
                          onClick={() => navigate(`/bugs/${bug._id}`)}
                        >
                          <h3 className="text-slate-200 text-sm font-medium mb-2 line-clamp-2 group-hover:text-white transition-colors">{bug.title}</h3>
                          <div className="flex items-center justify-between mb-3">
                            <PriorityBadge priority={bug.priority} />
                            {bug.project?.name && <span className="text-slate-500 text-xs">{bug.project.name}</span>}
                          </div>

                          {/* Quick status change */}
                          <select
                            value={bug.status}
                            onChange={e => { e.stopPropagation(); handleStatusChange(bug._id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            disabled={updatingId === bug._id}
                            className="w-full bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-2 py-1.5 text-xs transition-colors mt-2"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {grouped[status].length === 0 && (
                      <p className="text-slate-600 text-xs text-center py-4">No bugs here</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </motion.div>
  );
};

export default AssignedToMePage;
