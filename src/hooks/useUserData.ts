
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          console.log("Found cleaner auth token for:", userData.full_name || `${userData.first_name} ${userData.last_name}`);
          setUserRole('cleaner');
          setUserName(userData.full_name || `${userData.first_name} ${userData.last_name}`);
          setIsAuthenticated(true);
          
          // If on login page, redirect to cleaner dashboard
          if (location.pathname === '/login' || location.pathname === '/auth/login') {
            navigate('/cleaners/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error parsing auth token:', error);
          localStorage.removeItem('cleanerAuth');
          setIsAuthenticated(false);
        }
      } else if (adminToken) {
        try {
          const userData = JSON.parse(adminToken);
          console.log("Found admin auth token for:", userData.full_name || `${userData.first_name} ${userData.last_name}`);
          setUserRole('admin');
          setUserName(userData.full_name || `${userData.first_name} ${userData.last_name}`);
          setIsAuthenticated(true);
          
          // If on login page, redirect to admin dashboard
          if (location.pathname === '/login' || location.pathname === '/auth/login') {
            navigate('/admin/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error parsing admin token:', error);
          localStorage.removeItem('adminAuth');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        
        // If not authenticated and not on login page or index page, redirect to login
        if (!location.pathname.includes('/login') && location.pathname !== '/') {
          navigate('/login', { replace: true });
        }
      }
    };

    checkAuthState();
  }, [location.pathname, navigate]);

  // Function to authenticate user with phone and password
  const loginWithCredentials = async (phoneNumber: string, password: string) => {
    try {
      console.log("Attempting login with phone:", phoneNumber);
      
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
        
        console.log("Admin login successful");
        
        // Redirect admin to dashboard
        navigate('/admin/dashboard', { replace: true });
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
        console.log("Cleaner data retrieved:", cleanerData);
        
        // Store user info in localStorage
        localStorage.setItem('cleanerAuth', JSON.stringify(cleanerData));
        
        // Update state
        setUserRole('cleaner');
        setUserName(cleanerData.full_name || `${cleanerData.first_name} ${cleanerData.last_name}`);
        setIsAuthenticated(true);
        
        console.log('Cleaner authenticated successfully:', cleanerData);
        
        // Redirect cleaner to dashboard
        navigate('/cleaners/dashboard', { replace: true });
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
    navigate('/login', { replace: true });
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
