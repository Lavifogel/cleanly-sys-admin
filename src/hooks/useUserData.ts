import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>('cleaner');
  const [userName, setUserName] = useState<string | null>("Lavi Fogel");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Fetch user session
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Function to log out
  const logout = () => {
    console.log("Logout requested but auto-login is enabled");
  };

  // Auto-authenticate on initial load
  useEffect(() => {
    setIsAuthenticated(true);
    setUserRole('cleaner');
    setUserName("Lavi Fogel");
    
    // Store authentication state
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'cleaner');
    localStorage.setItem('userName', 'Lavi Fogel');
    
    // Set dashboard tab to profile
    localStorage.setItem('dashboard_active_tab', 'profile');
  }, []);

  return {
    userRole,
    userName,
    session,
    isAuthenticated,
    loginError: null,
    loginWithCredentials: async () => true,
    logout,
    refetchSession
  };
};
