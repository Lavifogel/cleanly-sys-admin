
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useUserData() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [hasActiveShift, setHasActiveShift] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setUser(parsedAuth.userData);
          setStatus("authenticated");
          
          // Check if the user has an active shift
          const activeShift = localStorage.getItem('activeShift');
          if (activeShift) {
            setHasActiveShift(true);
          }
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setStatus("unauthenticated");
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    setStatus("loading");
    
    try {
      // Fetch user by phone/username
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', username)
        .limit(1);
      
      if (error) throw new Error(error.message);
      
      if (!users || users.length === 0) {
        throw new Error("User not found");
      }
      
      const user = users[0];
      
      // Simple password check (in a real app, use proper password hashing)
      if (user.password !== password) {
        throw new Error("Invalid credentials");
      }
      
      // Set user data
      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        email: user.email,
        phone: user.phone
      };
      
      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({ userData }));
      localStorage.setItem('tempUserId', user.id);
      
      // Log login activity
      try {
        await createActivityLog({
          user_id: user.id,
          activity_type: 'login',
          start_time: new Date().toISOString(),
          status: 'success'
        });
      } catch (error) {
        console.error("Error logging login activity:", error);
      }
      
      setUser(userData);
      setStatus("authenticated");
      
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  // Handle showing logout confirmation
  const logout = useCallback(() => {
    const activeShift = localStorage.getItem('activeShift');
    setHasActiveShift(!!activeShift);
    setShowLogoutConfirmation(true);
  }, []);

  // Close logout confirmation
  const closeLogoutConfirmation = useCallback(() => {
    setShowLogoutConfirmation(false);
  }, []);

  // Perform actual logout
  const performLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Log logout activity
      if (user && user.id) {
        try {
          await createActivityLog({
            user_id: user.id,
            activity_type: 'logout',
            start_time: new Date().toISOString(),
            status: 'success'
          });
        } catch (error) {
          console.error("Error logging logout activity:", error);
        }
      } else {
        const temporaryUserId = await generateTemporaryUserId();
        
        try {
          await createActivityLog({
            user_id: temporaryUserId,
            activity_type: 'logout',
            start_time: new Date().toISOString(),
            status: 'success'
          });
        } catch (error) {
          console.error("Error logging logout activity with temporary ID:", error);
        }
      }
      
      // Clear authentication data
      localStorage.removeItem('auth');
      
      // Optionally clear all shift and cleaning related data
      const shouldClearActivityData = window.confirm("Do you want to end all active sessions?");
      if (shouldClearActivityData) {
        localStorage.removeItem('activeShift');
        localStorage.removeItem('shiftTimer');
        localStorage.removeItem('shiftStartTime');
        localStorage.removeItem('activeCleaning');
        localStorage.removeItem('cleaningTimer');
        localStorage.removeItem('cleaningStartTime');
        localStorage.removeItem('cleaningPaused');
      }
      
      setUser(null);
      setStatus("unauthenticated");
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to login page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirmation(false);
    }
  }, [navigate, toast, user]);

  // Extract role from user data
  const userRole = user?.role || 'cleaner';
  const userName = user?.fullName || 'User';
  const isAuthenticated = status === "authenticated";

  return {
    user,
    userRole,
    userName,
    status,
    isAuthenticated,
    isLoggingOut,
    showLogoutConfirmation,
    hasActiveShift,
    login,
    logout,
    performLogout,
    closeLogoutConfirmation
  };
}
