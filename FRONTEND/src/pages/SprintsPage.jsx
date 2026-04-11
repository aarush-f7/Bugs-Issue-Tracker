import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllSprints, createSprint, updateSprint, deleteSprint } from '../api/sprintAPI';
import { getAllProjects } from '../api/projectAPI';
import { getAllBugs } from '../api/bugAPI';
import SprintCard from '../components/SprintCard';
import BugCard from '../components/BugCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import useRole from '../hooks/useRole';
import toast from 'react-hot-toast';

const SprintsPage = () => {
  const { isManager } = useRole();
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintBugs, setSprintBugs] = useState([]);
  const [loadingBugs, setLoadingBugs] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editSprint, setEditSprint] = useState(null);
  const [form, setForm] = useState({ name: '', project: '', startDate: '', endDate: '', status: 'Planned' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const [sData, pData] = await Promise.all([getAllSprints(), getAllProjects()]);
      setSprints(sData.sprints || sData);
      setProjects(pData.projects || pData);
    } catch { toast.error('Failed to load sprints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSprintClick = async (sprint) => {
    if (selectedSprint?._id === sprint._id) { setSelectedSprint(null); setSprintBugs([]); return; }
    setSelectedSprint(sprint);
    setLoadingBugs(true);
    try {
      const data = await getAllBugs({ sprint: sprint._id });
      setSprintBugs(data.bugs || data);
    } catch { toast.error('Failed to load sprint bugs'); }
    finally { setLoadingBugs(false); }
  };

  const openCreate = () => { setForm({ name: '', project: '', startDate: '', endDate: '', status: 'Planned' }); setEditSprint(null); setModalOpen(true); };
  const openEdit = (s) => { setForm({ name: s.name, project: s.project?._id || s.project || '', startDate: s.startDate?.split('T')[0] || '', endDate: s.endDate?.split('T')[0] || '', status: s.status }); setEditSprint(s); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Sprint name required');
    if (!form.project) return toast.error('Project required');
    setSaving(true);
    try {
      if (editSprint) { await updateSprint(editSprint._id, form); toast.success('Sprint updated'); }
      else { await createSprint(form); toast.success('Sprint created'); }
      setModalOpen(false);
      load();
    } catch { toast.error('Failed to save sprint'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSprint(deleteTarget._id);
      toast.success('Sprint deleted');
      if (selectedSprint?._id === deleteTarget._id) setSelectedSprint(null);
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete sprint'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sprints</h1>
          <p className="text-slate-400 text-sm mt-1">{sprints.length} sprint{sprints.length !== 1 ? 's' : ''} total</p>
        </div>
        {isManager && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Sprint
          </motion.button>
        )}
      </div>

      {sprints.length === 0
        ? <EmptyState title="No sprints yet" description="Create a sprint to organize your bugs." action={isManager ? { label: 'New Sprint', onClick: openCreate } : undefined} />
        : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {sprints.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className={`transition-all duration-200 ${selectedSprint?._id === s._id ? 'ring-2 ring-indigo-500 rounded-xl' : ''}`}>
                  <SprintCard sprint={s} isManager={isManager} onEdit={openEdit} onDelete={setDeleteTarget} onClick={handleSprintClick} />
                </div>
              </motion.div>
            ))}
          </div>
        )
      }

      {/* Sprint bugs */}
      {selectedSprint && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
          <h2 className="text-white font-semibold mb-4">
            Bugs in <span className="text-indigo-400">{selectedSprint.name}</span>
          </h2>
          {loadingBugs
            ? <div className="flex justify-center py-8"><LoadingSpinner /></div>
            : sprintBugs.length === 0
              ? <p className="text-slate-400 text-sm">No bugs in this sprint.</p>
              : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sprintBugs.map(b => <BugCard key={b._id} bug={b} />)}
                </div>
              )
          }
        </motion.div>
      )}

      {/* Sprint Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editSprint ? 'Edit Sprint' : 'New Sprint'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sprint 1" className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project *</label>
            <select value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editSprint ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Sprint" message={`Delete "${deleteTarget?.name}"?`} />
    </motion.div>
  );
};

export default SprintsPage;
