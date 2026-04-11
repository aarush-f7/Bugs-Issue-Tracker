import { motion } from 'framer-motion';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
        {icon || (
          <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">{title || 'Nothing here yet'}</h3>
      {description && (
        <p className="text-slate-400 text-sm text-center max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
