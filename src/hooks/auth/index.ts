
import { useAuth } from "./useAuth";
import { useLogout } from "./useLogout";
import { useUserProfile } from "./useUserProfile";
import { useState, useEffect } from "react";

export function useUserData() {
  const auth = useAuth();
  const logout = useLogout();
  const profile = useUserProfile(auth.user);

  // Connect the separate hook states
  useEffect(() => {
    // This effect can be used to sync state between hooks if needed
  }, [auth.user]);

  return {
    // Auth state
    user: auth.user,
    status: auth.status,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    
    // Logout state
    isLoggingOut: logout.isLoggingOut,
    showLogoutConfirmation: logout.showLogoutConfirmation,
    hasActiveShift: logout.hasActiveShift,
    logout: logout.logout,
    performLogout: logout.performLogout,
    closeLogoutConfirmation: logout.closeLogoutConfirmation,
    
    // User profile state
    userRole: profile.userRole,
    userName: profile.userName
  };
}

export * from "./useAuth";
export * from "./useLogout";
export * from "./useUserProfile";
