
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";

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
          setUser(parsedAuth.userData);
          setStatus("authenticated");
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

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login
  };
}
