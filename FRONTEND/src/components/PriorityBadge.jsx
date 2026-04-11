const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const icons = {
    High: '↑↑',
    Medium: '↑',
    Low: '↓',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[priority] || styles['Medium']}`}>
      <span className="text-xs leading-none">{icons[priority] || '↑'}</span>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
