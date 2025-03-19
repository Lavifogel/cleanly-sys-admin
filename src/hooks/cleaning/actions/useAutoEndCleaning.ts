
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";

export function useAutoEndCleaning(
  activeCleaning: Cleaning | null,
  activeShiftId: string | undefined,
  cleaningsHistory: CleaningHistoryItem[],
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  setCleaningsHistory: (history: CleaningHistoryItem[]) => void
) {
  const { toast } = useToast();

  const autoEndCleaning = useCallback(async () => {
    if (!activeCleaning || !activeShiftId) return false;
    
    try {
      const endTime = new Date();
      const status = "finished automatically";
      
      console.log("Auto-ending cleaning:", activeCleaning.id);
      
      // Update the cleaning in activity_logs
      await updateActivityLog(activeCleaning.id, {
        end_time: endTime.toISOString(),
        status: status
      });
      
      // Create a new cleaning history item
      const newCleaning = {
        id: activeCleaning.id || "",
        location: activeCleaning.location,
        date: new Date().toDateString(),
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor((endTime.getTime() - activeCleaning.startTime.getTime()) / (1000 * 60))}m`,
        status: status,
        images: 0,
        notes: "Ended automatically",
        shiftId: activeShiftId
      };
      
      // Update the local state
      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      
      toast({
        title: "Cleaning Ended",
        description: "Your cleaning activity has been automatically ended.",
        duration: 3000,
      });
      
      console.log("Cleaning automatically ended");
      return true;
    } catch (error) {
      console.error("Error in autoEndCleaning:", error);
      
      toast({
        title: "Error",
        description: "Failed to end cleaning automatically. Please try again manually.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [activeCleaning, activeShiftId, cleaningsHistory, setActiveCleaning, setCleaningElapsedTime, setCleaningsHistory, toast]);

  return { autoEndCleaning };
}
