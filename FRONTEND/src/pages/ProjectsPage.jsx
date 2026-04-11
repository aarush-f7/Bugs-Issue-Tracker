import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllProjects, createProject, updateProject, deleteProject } from '../api/projectAPI';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import useRole from '../hooks/useRole';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ProjectsPage = () => {
  const { isManager } = useRole();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data.projects || data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', description: '' }); setEditProject(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ name: p.name, description: p.description || '' }); setEditProject(p); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      if (editProject) {
        await updateProject(editProject._id, form);
        toast.success('Project updated');
      } else {
        await createProject(form);
        toast.success('Project created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget._id);
      toast.success('Project deleted');
      setDeleteTarget(null);
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isManager && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full max-w-xs bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm transition-colors"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? <EmptyState title="No projects found" description={search ? 'Try a different search.' : 'Create your first project to get started.'} action={isManager ? { label: 'Create Project', onClick: openCreate } : undefined} />
        : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => (
              <motion.div key={p._id} variants={cardVariants}>
                <ProjectCard project={p} isManager={isManager} onEdit={openEdit} onDelete={setDeleteTarget} />
              </motion.div>
            ))}
          </motion.div>
        )
      }

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Project name" className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Project description" rows={3} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm transition-colors resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editProject ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </motion.div>
  );
};

export default ProjectsPage;
