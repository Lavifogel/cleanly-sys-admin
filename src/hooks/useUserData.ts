
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { closeActiveCleaning, closeActiveShift, loginWithCredentials } from '@/services/authService';
import { checkAuthFromStorage, clearAuthData } from '@/utils/authUtils';
import { createActivityLog } from '@/hooks/activityLogs/useActivityLogService';

export const useUserData = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);
  const [hasActiveShift, setHasActiveShift] = useState<boolean>(false);
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
        
        // Log login activity
        try {
          await createActivityLog({
            user_id: user.id,
            activity_type: 'login',
            start_time: new Date().toISOString(),
            status: 'completed'
          });
          console.log("Login activity logged");
        } catch (logError) {
          console.error("Failed to log login activity:", logError);
        }
        
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

  // Function to check for active shift
  const checkForActiveShift = () => {
    const activeShiftData = localStorage.getItem('activeShift');
    return !!activeShiftData;
  };

  // Function to initiate logout process
  const initiateLogout = () => {
    if (userRole === 'cleaner') {
      const hasShift = checkForActiveShift();
      setHasActiveShift(hasShift);
      setShowLogoutConfirmation(true);
    } else {
      // For admin users, logout directly
      performLogout();
    }
  };

  // Function to perform actual logout
  const performLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Get user data from storage before clearing it
      const { userData } = checkAuthFromStorage();
      
      // If user is a cleaner, check for active cleaning
      if (userRole === 'cleaner') {
        try {
          // First close any active cleaning - ensure we await this
          const cleaningClosed = await closeActiveCleaning();
          console.log("Cleaning closed on logout:", cleaningClosed);
        } catch (error) {
          console.error("Error closing active cleaning on logout:", error);
        }
      }
      
      // Log logout activity if we have user data
      if (userData && userData.id) {
        try {
          await createActivityLog({
            user_id: userData.id,
            activity_type: 'logout',
            start_time: new Date().toISOString(),
            status: 'completed'
          });
          console.log("Logout activity logged");
        } catch (logError) {
          console.error("Failed to log logout activity:", logError);
        }
      }
      
      // Clear authentication data and state
      clearAuthData();
      setUserRole(null);
      setUserName(null);
      setIsAuthenticated(false);
      
      // Navigate after all operations are complete
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirmation(false);
    }
  };

  // Function to close the confirmation dialog
  const closeLogoutConfirmation = () => {
    setShowLogoutConfirmation(false);
  };

  return {
    userRole,
    userName,
    session,
    isAuthenticated,
    isLoggingOut,
    showLogoutConfirmation,
    hasActiveShift,
    loginWithCredentials: handleLoginWithCredentials,
    logout: initiateLogout,
    performLogout,
    closeLogoutConfirmation
  };
};
