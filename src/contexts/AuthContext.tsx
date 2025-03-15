
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  userRole: string | null;
  userName: string | null;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  activateAccount: (phoneNumber: string, activationCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Check if we have user data in localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          
          // Verify the stored credentials with Supabase
          const { data: userResponse, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', userData.phoneNumber)
            .eq('password', userData.password)
            .single();
          
          if (userError) {
            console.error('Auth verification error:', userError);
            localStorage.removeItem('userData');
            setIsAuthenticated(false);
          } else if (userResponse) {
            setIsAuthenticated(true);
            setUserRole(userResponse.role);
            setUserName(`${userResponse.first_name} ${userResponse.last_name}`);
            setIsFirstLogin(userResponse.is_first_login || false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find user with the provided phone number
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('password', password)
        .single();
      
      if (error) {
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password.",
          variant: "destructive",
        });
        return false;
      }
      
      if (user.is_first_login) {
        // If it's first login, we need to complete activation process
        setIsFirstLogin(true);
        return false;
      }
      
      // Store user data in localStorage for persistence
      const userData = {
        id: user.id,
        phoneNumber: user.phone,
        password: user.password,
        role: user.role
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUserName(`${user.first_name} ${user.last_name}`);
      
      toast({
        title: "Login Successful",
        description: `Welcome ${user.first_name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (phoneNumber: string, activationCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verify activation code against phone number
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('activation_code', activationCode)
        .single();
      
      if (error || !user) {
        toast({
          title: "Activation Failed",
          description: "Invalid activation code. Please contact your administrator.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update first login status
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_first_login: false })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Account activation error:', updateError);
        
        toast({
          title: "Activation Failed",
          description: "Could not activate your account. Please try again.",
          variant: "destructive",
        });
        
        return false;
      }
      
      // Store user data in localStorage for persistence
      const userData = {
        id: user.id,
        phoneNumber: user.phone,
        password: user.password,
        role: user.role
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setIsFirstLogin(false);
      setUserRole(user.role);
      setUserName(`${user.first_name} ${user.last_name}`);
      
      toast({
        title: "Account Activated",
        description: "Your account has been successfully activated!",
      });
      
      return true;
    } catch (error) {
      console.error('Account activation error:', error);
      
      toast({
        title: "Activation Failed",
        description: "An unexpected error occurred. Please contact your administrator.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      toast({
        title: "Logout Failed",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstLogin,
        userRole,
        userName,
        login,
        activateAccount,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
