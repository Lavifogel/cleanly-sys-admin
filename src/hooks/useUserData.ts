
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const { userRole, userName, isAuthenticated } = useAuth();
  const [session, setSession] = useState(null);

  // For backward compatibility, fetch session if needed by components
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      if (isAuthenticated) {
        const userData = localStorage.getItem('userData');
        if (userData) {
          return { user: { id: JSON.parse(userData).id } };
        }
      }
      return null;
    },
    enabled: isAuthenticated
  });

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
    }
  }, [sessionData]);

  return {
    userRole,
    userName,
    session
  };
};
