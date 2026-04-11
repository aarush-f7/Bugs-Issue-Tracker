import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getBugById, updateBug, deleteBug, updateBugStatus, assignBug } from '../api/bugAPI';
import { getComments } from '../api/commentAPI';
import { getBugActivity } from '../api/activityAPI';
import { getAllProjects } from '../api/projectAPI';
import { getAllSprints } from '../api/sprintAPI';
import { getAllUsers } from '../api/userAPI';
import BugStatusBadge from '../components/BugStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CommentBox from '../components/CommentBox';
import ActivityFeed from '../components/ActivityFeed';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import useRole from '../hooks/useRole';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/dateFormatter';

const BugDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isTester, isDeveloper } = useRole();
  const { user } = useAuth();

  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Assign (Manager)
  const [assignModal, setAssignModal] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status update (Developer)
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadAll = async () => {
    try {
      const [bugData, commentsData, activityData] = await Promise.all([
        getBugById(id),
        getComments(id),
        getBugActivity(id),
      ]);
      const b = bugData.bug || bugData;
      setBug(b);
      setComments(commentsData.comments || commentsData);
      setActivities(activityData.activities || activityData);
      setEditForm({
        title: b.title,
        description: b.description || '',
        priority: b.priority,
        project: b.project?._id || b.project || '',
        sprint: b.sprint?._id || b.sprint || '',
      });
    } catch { toast.error('Failed to load bug'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [id]);

  const openEditModal = async () => {
    const [pData, sData] = await Promise.all([getAllProjects(), getAllSprints()]);
    setProjects(pData.projects || pData);
    setSprints(sData.sprints || sData);
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return toast.error('Title required');
    setSaving(true);
    try {
      await updateBug(id, { ...editForm, sprint: editForm.sprint || undefined });
      toast.success('Bug updated');
      setEditModal(false);
      loadAll();
    } catch { toast.error('Failed to update bug'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBug(id);
      toast.success('Bug deleted');
      navigate('/bugs');
    } catch { toast.error('Failed to delete bug'); }
    finally { setDeleting(false); }
  };

  const openAssignModal = async () => {
    const data = await getAllUsers();
    const all = data.users || data;
    setDevelopers(all.filter(u => u.role === 'Developer'));
    setSelectedDev(bug?.assignedTo?._id || '');
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedDev) return toast.error('Select a developer');
    setAssigning(true);
    try {
      await assignBug(id, selectedDev);
      toast.success('Bug assigned');
      setAssignModal(false);
      loadAll();
    } catch { toast.error('Failed to assign bug'); }
    finally { setAssigning(false); }
  };

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    setStatusDropOpen(false);
    // Optimistic
    setBug(prev => ({ ...prev, status }));
    try {
      await updateBugStatus(id, status);
      toast.success(`Status updated to "${status}"`);
      loadAll();
    } catch {
      toast.error('Failed to update status');
      loadAll();
    } finally { setUpdatingStatus(false); }
  };

  const canEditBug = isManager || (isTester && bug?.createdBy?._id === user?._id);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  if (!bug) return <div className="p-6 text-slate-400">Bug not found.</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/bugs')} className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Bugs
      </button>

      {/* Bug header */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-white flex-1">{bug.title}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={bug.priority} />
            <BugStatusBadge status={bug.status} />
          </div>
        </div>

        {bug.description && <p className="text-slate-300 text-sm mb-6 leading-relaxed">{bug.description}</p>}

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
          {[
            { label: 'Project', value: bug.project?.name || 'N/A' },
            { label: 'Sprint', value: bug.sprint?.name || 'None' },
            { label: 'Reported by', value: bug.createdBy?.name || 'Unknown' },
            { label: 'Assigned to', value: bug.assignedTo?.name || 'Unassigned' },
            { label: 'Created', value: formatDateTime(bug.createdAt) },
          ].map(item => (
            <div key={item.label}>
              <p className="text-slate-500 text-xs mb-0.5">{item.label}</p>
              <p className="text-slate-200 font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
          {/* Manager actions */}
          {isManager && (
            <>
              <button onClick={openEditModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={openAssignModal} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Assign
              </button>
              <button onClick={() => setDeleteDialog(true)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm rounded-xl flex items-center gap-2 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </>
          )}

          {/* Tester edit own bugs */}
          {isTester && bug.createdBy?._id === user?._id && (
            <button onClick={openEditModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Bug
            </button>
          )}

          {/* Developer status update */}
          {isDeveloper && (
            <div className="relative">
              <button
                onClick={() => setStatusDropOpen(p => !p)}
                disabled={updatingStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl flex items-center gap-2 transition-colors"
              >
                {updatingStatus
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                }
                Update Status
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <AnimatePresence>
                {statusDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 mt-1 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl py-1 z-20 w-44"
                  >
                    {['To Do', 'In Progress', 'Done'].map(s => (
                      <button
                        key={s} onClick={() => handleStatusUpdate(s)}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${bug.status === s ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 mb-6">
        <CommentBox bugId={id} comments={comments} />
      </div>

      {/* Activity (collapsible) */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden">
        <button
          onClick={() => setActivityOpen(p => !p)}
          className="w-full flex items-center justify-between p-6 text-white font-semibold hover:bg-slate-700/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Activity Log ({activities.length})
          </span>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${activityOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {activityOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="px-6 pb-6">
                <ActivityFeed activities={activities} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Bug" maxWidth="max-w-xl">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
            <input value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm resize-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select value={editForm.priority || 'Medium'} onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Sprint</label>
              <select value={editForm.sprint || ''} onChange={e => setEditForm(p => ({ ...p, sprint: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-3 text-sm transition-colors">
                <option value="">No sprint</option>
                {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Bug">
        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
          {developers.length === 0
            ? <p className="text-slate-500 text-sm text-center py-4">No developers available</p>
            : developers.map(dev => (
              <label key={dev._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${selectedDev === dev._id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-800/50 border-transparent hover:border-slate-600'}`}>
                <input type="radio" name="developer" value={dev._id} checked={selectedDev === dev._id} onChange={() => setSelectedDev(dev._id)} className="accent-indigo-500" />
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">{dev.name.charAt(0)}</div>
                <div>
                  <p className="text-slate-200 text-sm">{dev.name}</p>
                  <p className="text-slate-500 text-xs">{dev.email}</p>
                </div>
              </label>
            ))
          }
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAssignModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={handleAssign} disabled={!selectedDev || assigning} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
            {assigning && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Assign
          </button>
        </div>
      </Modal>

      {/* Delete dialog */}
      <ConfirmDialog isOpen={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} loading={deleting} title="Delete Bug" message="Are you sure you want to delete this bug? This action cannot be undone." />
    </motion.div>
  );
};

export default BugDetailPage;
