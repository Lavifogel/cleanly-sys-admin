
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>('cleaner'); // Default to cleaner
  const [userName, setUserName] = useState<string | null>("Lavi Fogel"); // Default to demo name
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch user session
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Function to handle cleaner login
  const loginWithCredentials = async (phoneNumber: string, password: string) => {
    setLoginError(null);
    
    try {
      // Check if this is the specified user credentials
      if (phoneNumber === '+972526768666' && password === '265671') {
        setIsAuthenticated(true);
        setUserRole('cleaner');
        setUserName("Lavi Fogel");
        
        // Store login state in localStorage for persistence
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'cleaner');
        localStorage.setItem('userName', 'Lavi Fogel');
        
        return true;
      } else {
        setLoginError("Invalid phone number or password");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login");
      return false;
    }
  };

  // Function to log out
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('cleaner'); // Reset to default
    setUserName("Lavi Fogel"); // Reset to default name
    
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  };

  // Check localStorage on initial load
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedIsAuthenticated === 'true') {
      setIsAuthenticated(true);
      setUserRole(storedUserRole || 'cleaner');
      setUserName(storedUserName || 'Lavi Fogel');
    }
  }, []);

  return {
    userRole,
    userName,
    session,
    isAuthenticated,
    loginError,
    loginWithCredentials,
    logout,
    refetchSession
  };
};
