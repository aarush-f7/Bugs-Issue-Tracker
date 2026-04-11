import { formatDate } from '../utils/dateFormatter';

const sprintStatusStyles = {
  Planned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  Active: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const SprintCard = ({ sprint, onEdit, onDelete, isManager, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(sprint)}
      className={`bg-[#1e293b] border border-slate-700/50 hover:border-indigo-500/30 rounded-xl p-4 transition-all duration-200 group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-medium group-hover:text-indigo-300 transition-colors">{sprint.name}</h4>
          {sprint.project?.name && (
            <p className="text-slate-500 text-xs mt-0.5">{sprint.project.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${sprintStatusStyles[sprint.status] || sprintStatusStyles.Planned}`}>
            {sprint.status}
          </span>
          {isManager && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onEdit?.(sprint)}
                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete?.(sprint)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
        </span>
      </div>
    </div>
  );
};

export default SprintCard;
