import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BugStatusBadge from './BugStatusBadge';
import PriorityBadge from './PriorityBadge';
import { timeAgo } from '../utils/dateFormatter';

const BugCard = ({ bug, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick(bug);
    navigate(`/bugs/${bug._id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#1e293b] border border-slate-700/50 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-slate-100 font-medium text-sm line-clamp-2 flex-1">{bug.title}</h3>
        <PriorityBadge priority={bug.priority} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <BugStatusBadge status={bug.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {bug.project?.name && (
            <span className="px-2 py-0.5 bg-slate-700/60 rounded-full text-slate-400">
              {bug.project.name}
            </span>
          )}
          {bug.assignedTo?.name && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
                {bug.assignedTo.name.charAt(0).toUpperCase()}
              </span>
              {bug.assignedTo.name}
            </span>
          )}
        </div>
        <span>{timeAgo(bug.createdAt)}</span>
      </div>
    </motion.div>
  );
};

export default BugCard;
