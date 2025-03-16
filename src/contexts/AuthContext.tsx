
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentSession, isAuthenticated, loginWithPhoneAndPassword, logout, getUserRole } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userName: string | null;
  login: (phoneNumber: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null as string | null,
    userName: null as string | null,
  });

  useEffect(() => {
    // Check for existing session on component mount
    const session = getCurrentSession();
    if (session) {
      setAuthState({
        isAuthenticated: true,
        userRole: session.role,
        userName: `${session.firstName} ${session.lastName}`.trim(),
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = async (phoneNumber: string, password: string) => {
    const result = await loginWithPhoneAndPassword(phoneNumber, password);
    
    if (result.success && result.session) {
      setAuthState({
        isAuthenticated: true,
        userRole: result.session.role,
        userName: `${result.session.firstName} ${result.session.lastName}`.trim(),
      });
    }
    
    return {
      success: result.success,
      error: result.error
    };
  };

  const handleLogout = () => {
    logout();
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userName: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        userRole: authState.userRole,
        userName: authState.userName,
        login: handleLogin,
        logout: handleLogout,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
