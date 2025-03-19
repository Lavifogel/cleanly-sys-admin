
import { useCallback } from "react";
import { Cleaning } from "@/types/cleaning";
import { updateActivityLog } from "@/hooks/activityLogs/useActivityLogService";

export function useTogglePauseCleaning(
  activeCleaning: Cleaning | null,
  setActiveCleaning: (cleaning: Cleaning | null) => void
) {
  const togglePauseCleaning = useCallback(async () => {
    if (!activeCleaning || !activeCleaning.id) return;
    
    try {
      const newPausedState = !activeCleaning.paused;
      
      // Update the cleaning in the database
      await updateActivityLog(activeCleaning.id, {
        status: newPausedState ? 'paused' : 'active'
      });
      
      // Update the local state
      setActiveCleaning({
        ...activeCleaning,
        paused: newPausedState
      });
      
      console.log(`Cleaning ${newPausedState ? 'paused' : 'resumed'}`);
    } catch (error) {
      console.error("Error toggling cleaning pause state:", error);
    }
  }, [activeCleaning, setActiveCleaning]);
  
  return { togglePauseCleaning };
}
