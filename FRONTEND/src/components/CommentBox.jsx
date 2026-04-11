import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addComment, deleteComment } from '../api/commentAPI';
import { timeAgo } from '../utils/dateFormatter';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';
import toast from 'react-hot-toast';

const CommentBox = ({ bugId, comments: initialComments = [] }) => {
  const { user } = useAuth();
  const { isManager } = useRole();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    // Optimistic update
    const optimistic = {
      _id: `temp-${Date.now()}`,
      text,
      author: user,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setText('');
    try {
      const res = await addComment(bugId, text.trim());
      const newComment = res.comment || res;
      setComments(prev => prev.map(c => c._id === optimistic._id ? newComment : c));
      toast.success('Comment added');
    } catch {
      setComments(prev => prev.filter(c => c._id !== optimistic._id));
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setDeletingId(commentId);
    setComments(prev => prev.filter(c => c._id !== commentId));
    try {
      await deleteComment(bugId, commentId);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (comment) =>
    isManager || comment.author?._id === user?._id || comment.author === user?._id;

  return (
    <div>
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3 mb-5">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {comment.author?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm font-medium">{comment.author?.name || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs">{timeAgo(comment.createdAt)}</span>
                    {canDelete(comment) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={deletingId === comment._id}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{comment.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-slate-800 border border-slate-600 focus:border-indigo-500 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;
