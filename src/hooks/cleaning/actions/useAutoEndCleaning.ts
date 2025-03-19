
import { useCallback } from "react";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { useToast } from "@/hooks/use-toast";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";

/**
 * Hook for automatically ending cleaning sessions
 */
export function useAutoEndCleaning(
  activeCleaning: Cleaning | null,
  activeShiftId: string | undefined,
  cleaningsHistory: CleaningHistoryItem[],
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  setCleaningsHistory: (history: CleaningHistoryItem[]) => void
) {
  const { toast } = useToast();

  // Automatically end cleaning without user confirmation
  const autoEndCleaning = useCallback(async () => {
    if (!activeCleaning || !activeShiftId) {
      console.log("No active cleaning to auto-end");
      return;
    }
    
    try {
      console.log("Auto-ending cleaning:", activeCleaning.id);
      
      const endTime = new Date();
      const status = "ended automatically";
      
      // Get user ID for the cleaning
      const userId = await generateTemporaryUserId();
      
      // Create a cleaning_end activity log
      try {
        await createActivityLog({
          user_id: userId,
          activity_type: 'cleaning_end',
          start_time: endTime.toISOString(),
          status: status,
          related_id: activeCleaning.id // Reference to the cleaning_start log
        });
        console.log("Cleaning end log created successfully");
      } catch (error: any) {
        console.error("Error creating cleaning_end log:", error);
        return;
      }
      
      // Format date for history
      const formatDateToDDMMYYYY = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      // Calculate time elapsed
      const durationMs = endTime.getTime() - activeCleaning.startTime.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      
      // Create a new cleaning history item
      const newCleaning: CleaningHistoryItem = {
        id: activeCleaning.id,
        location: activeCleaning.location,
        date: formatDateToDDMMYYYY(activeCleaning.startTime),
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${durationMinutes}m`,
        status: status,
        notes: "",
        images: 0,
        shiftId: activeShiftId
      };
      
      // Update local state
      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      
      console.log("Cleaning automatically ended");
      
      toast({
        title: "Cleaning Ended",
        description: "Your cleaning has been automatically ended due to inactivity.",
        duration: 3000,
      });
      
      return newCleaning;
    } catch (error: any) {
      console.error("Error in autoEndCleaning:", error);
      return null;
    }
  }, [
    activeCleaning, 
    activeShiftId, 
    cleaningsHistory, 
    setActiveCleaning, 
    setCleaningElapsedTime, 
    setCleaningsHistory, 
    toast
  ]);

  return { autoEndCleaning };
}
