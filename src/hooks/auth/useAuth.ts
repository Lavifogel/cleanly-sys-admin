
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
      // Check for admin login first
      if (username === '+1234567890' && password === '654321') {
        // Create admin user object
        const adminUser = {
          id: 'admin-id',
          firstName: 'Admin',
          lastName: 'User',
          fullName: 'Admin User',
          role: 'admin',
          phone: username
        };
        
        // Store in localStorage
        localStorage.setItem('auth', JSON.stringify({ userData: adminUser }));
        
        console.log("Admin login successful");
        setUser(adminUser);
        setStatus("authenticated");
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
        return adminUser;
      }
      
      // Regular user login flow
      console.log("Attempting to log in with credentials:", username);
      
      // Fetch user by phone
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', username)
        .limit(1);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error(error.message);
      }
      
      console.log("Users found:", users);
      
      if (!users || users.length === 0) {
        console.error("No user found with phone:", username);
        throw new Error("User not found");
      }
      
      const user = users[0];
      console.log("User data retrieved:", user);
      
      // Check if password exists and matches
      if (!user.password) {
        console.error("User has no password set");
        throw new Error("User account not properly configured");
      }
      
      // Simple password check 
      if (user.password !== password) {
        console.error("Password doesn't match");
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
      
      console.log("User data prepared:", userData);
      
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
      
      // Navigate based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/cleaners/dashboard');
      }
      
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      setStatus("unauthenticated");
      throw error;
    }
  }, [navigate, toast]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login
  };
}
