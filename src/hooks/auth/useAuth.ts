
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { loginWithCredentials } from "@/services/authService";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
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

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login
  };
}
