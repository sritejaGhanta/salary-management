import { useAuth } from '../context/auth.context';

export const useRole = () => {
  const { user } = useAuth();
  return {
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    canManageHR: user?.role === 'admin',
  };
};
