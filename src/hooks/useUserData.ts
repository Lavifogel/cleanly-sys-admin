
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { closeActiveCleaning, closeActiveShift, loginWithCredentials } from '@/services/authService';
import { checkAuthFromStorage, clearAuthData } from '@/utils/authUtils';

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
      const { isAuthenticated, userRole, userName } = checkAuthFromStorage();
      
      setIsAuthenticated(isAuthenticated);
      setUserRole(userRole);
      setUserName(userName);
      
      if (isAuthenticated) {
        // If on login page, redirect to appropriate dashboard
        if (location.pathname === '/login' || location.pathname === '/auth/login') {
          const dashboardPath = userRole === 'admin' ? '/admin/dashboard' : '/cleaners/dashboard';
          navigate(dashboardPath, { replace: true });
        }
      } else {
        // If not authenticated and not on login page or index page, redirect to login
        if (!location.pathname.includes('/login') && location.pathname !== '/') {
          navigate('/login', { replace: true });
        }
      }
    };

    checkAuthState();
  }, [location.pathname, navigate]);

  // Function to handle login with credentials
  const handleLoginWithCredentials = async (phoneNumber: string, password: string) => {
    try {
      const { success, user, role, error } = await loginWithCredentials(phoneNumber, password);
      
      if (success) {
        // Update state
        setUserRole(role);
        // Create a full name from first_name and last_name if full_name doesn't exist
        const fullName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.phone || 'User';
        
        setUserName(fullName);
        setIsAuthenticated(true);
        
        // Redirect to dashboard
        const dashboardPath = role === 'admin' ? '/admin/dashboard' : '/cleaners/dashboard';
        navigate(dashboardPath, { replace: true });
        
        return { success: true, user };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  // Function to log out
  const logout = async () => {
    // If user is a cleaner, check for active cleaning and shift
    if (userRole === 'cleaner') {
      try {
        // First close any active cleaning
        const cleaningClosed = await closeActiveCleaning();
        console.log("Cleaning closed on logout:", cleaningClosed);
        
        // Then close any active shift
        const shiftClosed = await closeActiveShift();
        console.log("Shift closed on logout:", shiftClosed);
      } catch (error) {
        console.error("Error closing active tasks on logout:", error);
      }
    }
    
    // Clear authentication data and state
    clearAuthData();
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
    loginWithCredentials: handleLoginWithCredentials,
    logout
  };
};
