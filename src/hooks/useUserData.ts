
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>('cleaner'); // Default to cleaner for demo
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
      // First, verify if the user exists and password matches
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('password', password)
        .single();
      
      if (userError || !userData) {
        setLoginError("Invalid phone number or password");
        return false;
      }

      // If credentials are valid, set the user as authenticated
      setIsAuthenticated(true);
      setUserRole(userData.role);
      
      // Set full name if available, otherwise construct from first and last name
      if (userData.full_name) {
        setUserName(userData.full_name);
      } else if (userData.first_name && userData.last_name) {
        setUserName(`${userData.first_name} ${userData.last_name}`);
      } else {
        setUserName(phoneNumber); // Fallback to phone number if no name available
      }

      // Store login state in localStorage for persistence
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userName', userName || '');

      return true;
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

  // Fetch user profile to get role
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('role, first_name, last_name')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
          if (data.first_name && data.last_name) {
            setUserName(`${data.first_name} ${data.last_name}`);
          }
        } else {
          setUserRole('cleaner'); // Fallback to cleaner (for Lavi)
          setUserName("Lavi Fogel"); // Set name for Lavi
        }
      } else {
        // When not authenticated, use Lavi's defaults
        setUserRole('cleaner');
        setUserName("Lavi Fogel");
      }
    };

    fetchUserProfile();
  }, [session]);

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
