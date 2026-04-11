import { motion } from 'framer-motion';
import { timeAgo } from '../utils/dateFormatter';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityMessage = (activity) => {
    if (activity.field === 'status') {
      return (
        <span>
          changed <span className="text-slate-300 font-medium">status</span> from{' '}
          <span className="text-amber-400">{activity.oldValue}</span> to{' '}
          <span className="text-green-400">{activity.newValue}</span>
        </span>
      );
    }
    if (activity.field === 'assignedTo') {
      return (
        <span>
          assigned this bug to{' '}
          <span className="text-indigo-400 font-medium">{activity.newValue}</span>
        </span>
      );
    }
    return (
      <span>
        changed <span className="text-slate-300 font-medium">{activity.field}</span> from{' '}
        <span className="text-amber-400">{activity.oldValue || 'none'}</span> to{' '}
        <span className="text-green-400">{activity.newValue}</span>
      </span>
    );
  };

  if (activities.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-6">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />

      <div className="space-y-4 pl-12">
        {activities.map((activity, i) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            {/* Dot */}
            <div className="absolute -left-10 top-2 w-4 h-4 rounded-full border-2 border-indigo-500 bg-[#1e293b] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>

            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/20">
              <div className="flex items-start justify-between gap-2">
                <p className="text-slate-400 text-sm">
                  <span className="text-indigo-400 font-medium">
                    {activity.changedBy?.name || 'System'}
                  </span>{' '}
                  {getActivityMessage(activity)}
                </p>
                <span className="text-slate-600 text-xs flex-shrink-0">{timeAgo(activity.createdAt)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
