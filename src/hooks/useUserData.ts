
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Check if a user is authenticated (either via session or manual login)
  useEffect(() => {
    const checkAuthState = async () => {
      // Check localStorage for auth token
      const authToken = localStorage.getItem('cleanerAuth');
      
      if (authToken) {
        try {
          const userData = JSON.parse(authToken);
          setUserRole('cleaner');
          setUserName(`${userData.first_name} ${userData.last_name}`);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing auth token:', error);
          localStorage.removeItem('cleanerAuth');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthState();
  }, []);

  // Function to authenticate user with phone and password
  const loginWithCredentials = async (phoneNumber: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('password', password)
        .eq('role', 'cleaner')
        .single();

      if (error || !data) {
        throw new Error("Invalid phone number or password");
      }

      // Store user info in localStorage
      localStorage.setItem('cleanerAuth', JSON.stringify(data));
      
      // Update state
      setUserRole('cleaner');
      setUserName(`${data.first_name} ${data.last_name}`);
      setIsAuthenticated(true);
      
      return { success: true, user: data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem('cleanerAuth');
    setUserRole(null);
    setUserName(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return {
    userRole,
    userName,
    session,
    isAuthenticated,
    loginWithCredentials,
    logout
  };
};
