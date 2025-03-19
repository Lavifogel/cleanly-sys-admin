
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { loginWithCredentials, closeActiveShift, closeActiveCleaning } from "@/services/authService";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          console.log("Found stored auth data:", parsedAuth);
          setUser(parsedAuth.userData);
          setStatus("authenticated");
        } else {
          console.log("No stored auth data found");
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
      console.log("Logging in with credentials:", username);
      const result = await loginWithCredentials(username, password);
      
      if (!result.success) {
        throw result.error || new Error("Failed to login");
      }
      
      // Set user data
      setUser(result.user);
      setStatus("authenticated");
      
      // Log login activity (only for non-admin users)
      if (result.user.id !== 'admin-id') {
        try {
          await createActivityLog({
            user_id: result.user.id,
            activity_type: 'login',
            start_time: new Date().toISOString(),
            status: 'success'
          });
        } catch (logError) {
          console.error("Error logging login activity:", logError);
        }
      }
      
      console.log("Login successful for user with role:", result.user.role);
      return result.user;
    } catch (error) {
      console.error("Login error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  // Logout function
  const performLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      
      // Get user ID for activity log
      const storedAuth = localStorage.getItem('auth');
      let userId: string | null = null;
      
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth.userData && parsedAuth.userData.id) {
            userId = parsedAuth.userData.id;
          }
        } catch (error) {
          console.error("Error parsing auth data:", error);
        }
      }
      
      // Log logout activity
      if (userId) {
        try {
          await createActivityLog({
            user_id: userId,
            activity_type: 'logout',
            start_time: new Date().toISOString(),
            status: 'success'
          });
        } catch (error) {
          console.error("Error logging logout activity:", error);
        }
      }
      
      // Close active sessions in database
      await closeActiveShift();
      await closeActiveCleaning();
      
      // Clear authentication data
      localStorage.removeItem('auth');
      
      // Clear all shift and cleaning related data
      localStorage.removeItem('activeShift');
      localStorage.removeItem('shiftTimer');
      localStorage.removeItem('shiftStartTime');
      localStorage.removeItem('activeCleaning');
      localStorage.removeItem('cleaningTimer');
      localStorage.removeItem('cleaningStartTime');
      localStorage.removeItem('cleaningPaused');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Update auth state
      setUser(null);
      setStatus("unauthenticated");
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [toast]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login,
    isLoggingOut,
    performLogout
  };
}
