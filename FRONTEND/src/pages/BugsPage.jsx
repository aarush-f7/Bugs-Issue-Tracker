import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllBugs, createBug } from '../api/bugAPI';
import { getAllProjects } from '../api/projectAPI';
import { getAllSprints } from '../api/sprintAPI';
import BugCard from '../components/BugCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import useRole from '../hooks/useRole';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const BugsPage = () => {
  const { isTester } = useRole();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '' });
  const [sort, setSort] = useState('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', project: '', sprint: '' });

  const loadBugs = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.project) params.project = filters.project;
      const data = await getAllBugs(params);
      setBugs(data.bugs || data);
    } catch { toast.error('Failed to load bugs'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const [pData, sData] = await Promise.all([getAllProjects(), getAllSprints()]);
      setProjects(pData.projects || pData);
      setSprints(sData.sprints || sData);
    };
    init();
  }, []);

  useEffect(() => { setLoading(true); loadBugs(); }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.project) return toast.error('Project is required');
    setSaving(true);
    try {
      await createBug({ ...form, sprint: form.sprint || undefined });
      toast.success('Bug created');
      setModalOpen(false);
      setForm({ title: '', description: '', priority: 'Medium', project: '', sprint: '' });
      loadBugs();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create bug'); }
    finally { setSaving(false); }
  };

  const sorted = [...bugs].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    const pOrder = { High: 0, Medium: 1, Low: 2 };
    return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
  });

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  const FilterSelect = ({ label, value, field, options }) => (
    <select
      value={value}
      onChange={e => setFilters(p => ({ ...p, [field]: e.target.value }))}
      className="bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-300 rounded-xl px-3 py-2 text-sm transition-colors"
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bugs</h1>
          <p className="text-slate-400 text-sm mt-1">{sorted.length} bug{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        {isTester && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Report Bug
          </motion.button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterSelect label="All Statuses" field="status" value={filters.status} options={[
          { value: 'To Do', label: 'To Do' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'Done', label: 'Done' },
        ]} />
        <FilterSelect label="All Priorities" field="priority" value={filters.priority} options={[
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' },
        ]} />
        <FilterSelect label="All Projects" field="project" value={filters.project} options={projects.map(p => ({ value: p._id, label: p.name }))} />
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-300 rounded-xl px-3 py-2 text-sm transition-colors">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">By Priority</option>
        </select>
        {(filters.status || filters.priority || filters.project) && (
          <button onClick={() => setFilters({ status: '', priority: '', project: '' })} className="px-3 py-2 text-slate-400 hover:text-white text-sm hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear
          </button>
        )}
      </div>

      {/* Bug list */}
      {sorted.length === 0
        ? <EmptyState title="No bugs found" description="Try adjusting your filters or report a new bug." action={isTester ? { label: 'Report Bug', onClick: () => setModalOpen(true) } : undefined} />
        : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sorted.map(bug => (
              <motion.div key={bug._id} variants={itemVariants}>
                <BugCard bug={bug} />
              </motion.div>
            ))}
          </motion.div>
        )
      }

      {/* Create Bug Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Bug" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Bug title" className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the bug..." rows={3} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm resize-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Project *</label>
              <select value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Sprint (optional)</label>
            <select value={form.sprint} onChange={e => setForm(p => ({ ...p, sprint: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
              <option value="">No sprint</option>
              {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Report Bug
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default BugsPage;
