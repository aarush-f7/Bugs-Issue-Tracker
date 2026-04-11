const BugStatusBadge = ({ status }) => {
  const styles = {
    'To Do': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30 badge-in-progress',
    'Done': 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const dots = {
    'To Do': 'bg-slate-400',
    'In Progress': 'bg-blue-400',
    'Done': 'bg-green-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles['To Do']}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots['To Do']}`} />
      {status || 'To Do'}
    </span>
  );
};

export default BugStatusBadge;
