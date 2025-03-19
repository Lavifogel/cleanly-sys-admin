
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";
import { closeActiveShift, closeActiveCleaning } from "@/services/authService";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [hasActiveShift, setHasActiveShift] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle showing logout confirmation
  const initiateLogout = useCallback(() => {
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
      
      // Close active sessions in database
      await closeActiveShift();
      await closeActiveCleaning();
      
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
  }, [navigate, toast]);

  return {
    isLoggingOut,
    showLogoutConfirmation,
    hasActiveShift,
    logout: initiateLogout,
    performLogout,
    closeLogoutConfirmation
  };
}
