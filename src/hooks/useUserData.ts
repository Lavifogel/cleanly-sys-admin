
import { useAuth } from '@/contexts/AuthContext';

export const useUserData = () => {
  const { userRole, userName, isAuthenticated } = useAuth();

  return {
    userRole,
    userName,
    session: isAuthenticated ? { user: { id: 'authenticated' } } : null
  };
};
