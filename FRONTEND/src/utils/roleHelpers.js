export const isManager = (role) => role === 'Manager';
export const isTester = (role) => role === 'Tester';
export const isDeveloper = (role) => role === 'Developer';

export const canCreateBug = (role) => isTester(role);
export const canEditBug = (role) => isTester(role) || isManager(role);
export const canDeleteBug = (role) => isManager(role);
export const canAssignBug = (role) => isManager(role);
export const canUpdateStatus = (role) => isDeveloper(role);
export const canManageProjects = (role) => isManager(role);
export const canManageUsers = (role) => isManager(role);
export const canManageSprints = (role) => isManager(role);

export const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'Manager': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Tester': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Developer': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};
