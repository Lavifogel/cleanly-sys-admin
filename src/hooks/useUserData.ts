
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
      const adminToken = localStorage.getItem('adminAuth');
      
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
      } else if (adminToken) {
        try {
          const userData = JSON.parse(adminToken);
          setUserRole('admin');
          setUserName(`${userData.first_name} ${userData.last_name}`);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing admin token:', error);
          localStorage.removeItem('adminAuth');
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
      // Check for admin login (country code +123 and phone number 4567890)
      if (phoneNumber === '+1234567890' && password === '654321') {
        // Create admin user object
        const adminUser = {
          id: 'admin-id',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          phone: phoneNumber
        };
        
        // Store admin info in localStorage
        localStorage.setItem('adminAuth', JSON.stringify(adminUser));
        
        // Update state
        setUserRole('admin');
        setUserName(`${adminUser.first_name} ${adminUser.last_name}`);
        setIsAuthenticated(true);
        
        return { success: true, user: adminUser };
      }
      
      // If not using hardcoded admin credentials, try to log in as cleaner
      const { data: cleanerData, error: cleanerError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('password', password)
        .eq('role', 'cleaner')
        .single();

      if (cleanerError) {
        console.error('Login error from database:', cleanerError);
        return { success: false, error: new Error("Invalid phone number or password") };
      }

      if (cleanerData) {
        // Store user info in localStorage
        localStorage.setItem('cleanerAuth', JSON.stringify(cleanerData));
        
        // Update state
        setUserRole('cleaner');
        setUserName(`${cleanerData.first_name} ${cleanerData.last_name}`);
        setIsAuthenticated(true);
        
        console.log('Cleaner authenticated successfully:', cleanerData);
        return { success: true, user: cleanerData };
      }

      // If we get here, neither admin nor cleaner login was successful
      console.error('Login error: Invalid credentials');
      return { success: false, error: new Error("Invalid phone number or password") };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem('cleanerAuth');
    localStorage.removeItem('adminAuth');
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
