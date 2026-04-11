import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers } from '../api/userAPI';
import { removeProjectMember, addProjectMember } from '../api/projectAPI';
import { getRoleBadgeColor } from '../utils/roleHelpers';
import toast from 'react-hot-toast';
import useRole from '../hooks/useRole';
import Modal from './Modal';

const MemberList = ({ members = [], projectId, onUpdate }) => {
  const { isManager } = useRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      const users = data.users || data;
      const memberIds = members.map(m => (m._id || m));
      setAllUsers(users.filter(u => !memberIds.includes(u._id)));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAdd = () => {
    setShowAddModal(true);
    fetchUsers();
  };

  const handleAdd = async () => {
    if (!selectedUsers.length) return;
    setAdding(true);
    try {
      await addProjectMember(projectId, selectedUsers);
      toast.success('Members added');
      setShowAddModal(false);
      setSelectedUsers([]);
      onUpdate?.();
    } catch {
      toast.error('Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await removeProjectMember(projectId, userId);
      toast.success('Member removed');
      onUpdate?.();
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const toggleUser = (id) =>
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        {isManager && (
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Members
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {members.map((member, i) => {
            const m = typeof member === 'object' ? member : { _id: member, name: 'Unknown' };
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {m.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{m.name}</p>
                    <p className="text-slate-500 text-xs">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.role && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(m.role)}`}>
                      {m.role}
                    </span>
                  )}
                  {isManager && (
                    <button
                      onClick={() => handleRemove(m._id)}
                      disabled={removingId === m._id}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {removingId === m._id
                        ? <span className="w-3.5 h-3.5 border border-slate-500 border-t-red-400 rounded-full animate-spin block" />
                        : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {members.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No members yet. Add some members!</p>
        )}
      </div>

      {/* Add Members Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Members">
        {loadingUsers ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allUsers.length === 0
                ? <p className="text-slate-500 text-sm text-center py-4">No users available to add</p>
                : allUsers.map(user => (
                    <label
                      key={user._id}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors border border-transparent hover:border-indigo-500/30"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUser(user._id)}
                        className="w-4 h-4 accent-indigo-500"
                      />
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.role}</p>
                      </div>
                    </label>
                  ))
              }
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedUsers.length || adding}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {adding && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MemberList;
