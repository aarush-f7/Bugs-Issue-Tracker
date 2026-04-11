import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById, updateProject } from '../api/projectAPI';
import { getAllBugs } from '../api/bugAPI';
import { getProjectStats } from '../api/dashboardAPI';
import { getAllSprints, createSprint, updateSprint, deleteSprint } from '../api/sprintAPI';
import MemberList from '../components/MemberList';
import SprintCard from '../components/SprintCard';
import BugCard from '../components/BugCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import BugStatusBadge from '../components/BugStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import useRole from '../hooks/useRole';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/dateFormatter';

const TABS = ['Overview', 'Members', 'Sprints', 'Bugs'];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useRole();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  // Sprint modal
  const [sprintModal, setSprintModal] = useState(false);
  const [editSprint, setEditSprint] = useState(null);
  const [deleteSprint_, setDeleteSprint] = useState(null);
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '', status: 'Planned' });
  const [savingSprint, setSavingSprint] = useState(false);
  const [deletingSprint, setDeletingSprint] = useState(false);

  const loadProject = async () => {
    try {
      const [projData, statsData, bugsData, sprintsData] = await Promise.all([
        getProjectById(id),
        getProjectStats(id),
        getAllBugs({ project: id }),
        getAllSprints(),
      ]);
      setProject(projData.project || projData);
      setStats(statsData.stats || statsData);
      const allBugs = bugsData.bugs || bugsData;
      setBugs(allBugs.filter(b => (b.project?._id || b.project) === id));
      const allSprints = sprintsData.sprints || sprintsData;
      setSprints(allSprints.filter(s => (s.project?._id || s.project) === id));
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProject(); }, [id]);

  const openSprintCreate = () => { setSprintForm({ name: '', startDate: '', endDate: '', status: 'Planned' }); setEditSprint(null); setSprintModal(true); };
  const openSprintEdit = (s) => { setSprintForm({ name: s.name, startDate: s.startDate?.split('T')[0] || '', endDate: s.endDate?.split('T')[0] || '', status: s.status }); setEditSprint(s); setSprintModal(true); };

  const handleSprintSave = async (e) => {
    e.preventDefault();
    if (!sprintForm.name.trim()) return toast.error('Sprint name required');
    setSavingSprint(true);
    try {
      if (editSprint) { await updateSprint(editSprint._id, { ...sprintForm, project: id }); toast.success('Sprint updated'); }
      else { await createSprint({ ...sprintForm, project: id }); toast.success('Sprint created'); }
      setSprintModal(false);
      loadProject();
    } catch { toast.error('Failed to save sprint'); }
    finally { setSavingSprint(false); }
  };

  const handleSprintDelete = async () => {
    setDeletingSprint(true);
    try {
      await deleteSprint(deleteSprint_._id);
      toast.success('Sprint deleted');
      setDeleteSprint(null);
      loadProject();
    } catch { toast.error('Failed to delete sprint'); }
    finally { setDeletingSprint(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  if (!project) return <div className="p-6 text-slate-400">Project not found.</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/projects')} className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-slate-400 mt-1">{project.description}</p>}
          <p className="text-slate-500 text-xs mt-1">Created by {project.createdBy?.name} · {formatDate(project.createdAt)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${tab === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab === t && <motion.div layoutId="tab-bg" className="absolute inset-0 bg-indigo-600 rounded-lg" transition={{ duration: 0.2 }} />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>

          {/* Overview */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Bugs', value: stats?.total || 0, color: 'text-indigo-400' },
                { label: 'To Do', value: stats?.todo || stats?.open || 0, color: 'text-slate-400' },
                { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-blue-400' },
                { label: 'Done', value: stats?.done || stats?.closed || 0, color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5">
                  <p className="text-slate-400 text-sm">{s.label}</p>
                  <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Members */}
          {tab === 'Members' && (
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6">
              <MemberList members={project.members || []} projectId={id} onUpdate={loadProject} />
            </div>
          )}

          {/* Sprints */}
          {tab === 'Sprints' && (
            <div>
              {isManager && (
                <div className="flex justify-end mb-4">
                  <button onClick={openSprintCreate} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Sprint
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {sprints.length === 0 ? <p className="text-slate-400 text-sm text-center py-8">No sprints for this project.</p>
                  : sprints.map(s => <SprintCard key={s._id} sprint={s} isManager={isManager} onEdit={openSprintEdit} onDelete={setDeleteSprint} />)}
              </div>
            </div>
          )}

          {/* Bugs */}
          {tab === 'Bugs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bugs.length === 0 ? <p className="text-slate-400 text-sm col-span-full text-center py-8">No bugs for this project.</p>
                : bugs.map(b => <BugCard key={b._id} bug={b} />)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sprint Modal */}
      <Modal isOpen={sprintModal} onClose={() => setSprintModal(false)} title={editSprint ? 'Edit Sprint' : 'New Sprint'}>
        <form onSubmit={handleSprintSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
            <input value={sprintForm.name} onChange={e => setSprintForm(p => ({ ...p, name: e.target.value }))} placeholder="Sprint name" className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input type="date" value={sprintForm.startDate} onChange={e => setSprintForm(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
              <input type="date" value={sprintForm.endDate} onChange={e => setSprintForm(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select value={sprintForm.status} onChange={e => setSprintForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSprintModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={savingSprint} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {savingSprint && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editSprint ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteSprint_} onClose={() => setDeleteSprint(null)} onConfirm={handleSprintDelete} loading={deletingSprint} title="Delete Sprint" message={`Delete "${deleteSprint_?.name}"? This cannot be undone.`} />
    </motion.div>
  );
};

export default ProjectDetailPage;
