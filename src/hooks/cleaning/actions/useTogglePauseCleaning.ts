
import { useCallback } from "react";
import { Cleaning } from "@/types/cleaning";
import { useToast } from "@/hooks/use-toast";
import { updateActivityLog } from "@/hooks/activityLogs/useActivityLogService";

/**
 * Hook for toggling the pause state of a cleaning
 */
export function useTogglePauseCleaning(
  activeCleaning: Cleaning | null,
  setActiveCleaning: (cleaning: Cleaning | null) => void
) {
  const { toast } = useToast();

  // Handle togglePauseCleaning
  const togglePauseCleaning = useCallback(async () => {
    if (!activeCleaning) {
      console.log("No active cleaning to toggle pause");
      return;
    }
    
    try {
      const newPausedState = !activeCleaning.paused;
      const status = newPausedState ? 'paused' : 'active';
      
      console.log(`Toggling cleaning pause state to: ${newPausedState}`);
      
      // Update the activity log status
      await updateActivityLog(activeCleaning.id, { status });
      
      // Update the local state
      setActiveCleaning({
        ...activeCleaning,
        paused: newPausedState
      });
      
      // Save the paused state to localStorage
      localStorage.setItem('cleaningPaused', newPausedState ? 'true' : 'false');
      
      toast({
        title: newPausedState ? "Cleaning Paused" : "Cleaning Resumed",
        description: newPausedState ? "Timer paused. Click Resume to continue." : "Timer resumed.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error toggling cleaning pause state:", error);
      toast({
        title: "Error",
        description: "Failed to update cleaning status. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeCleaning, setActiveCleaning, toast]);

  return { togglePauseCleaning };
}
