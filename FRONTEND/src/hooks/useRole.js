import useAuth from './useAuth';

const useRole = () => {
  const { role } = useAuth();
  return {
    role,
    isManager: role === 'Manager',
    isTester: role === 'Tester',
    isDeveloper: role === 'Developer',
  };
};

export default useRole;
