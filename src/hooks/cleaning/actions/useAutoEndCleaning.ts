
import { useCallback } from "react";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { useToast } from "@/hooks/use-toast";
import { formatDateToDDMMYYYY } from "@/utils/timeUtils";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";

export function useAutoEndCleaning(
  activeCleaning: Cleaning | null,
  activeShiftId: string | undefined,
  cleaningsHistory: CleaningHistoryItem[],
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  setCleaningsHistory: (history: CleaningHistoryItem[]) => void
) {
  const { toast } = useToast();

  // Automatically end cleaning after 5 hours
  const autoEndCleaning = useCallback(async () => {
    if (!activeCleaning || !activeShiftId) return;
    
    try {
      const cleaningId = activeCleaning.id || "";
      const endTime = new Date();
      const status = "finished automatically";
      const notes = "This cleaning was automatically ended after 5 hours.";
      
      console.log("Auto-ending cleaning with ID:", cleaningId);
      
      // Get user ID
      const userId = await generateTemporaryUserId();
      
      // Create a cleaning_end activity log
      try {
        await createActivityLog({
          user_id: userId,
          activity_type: 'cleaning_end',
          start_time: endTime.toISOString(),
          status: status,
          notes: notes,
          related_id: cleaningId
        });
      } catch (error: any) {
        console.error("Error creating cleaning_end log:", error);
      }
      
      // Update the local state with formatted date
      const newCleaning = {
        id: cleaningId,
        location: activeCleaning.location,
        date: formatDateToDDMMYYYY(new Date()),
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor((endTime.getTime() - activeCleaning.startTime.getTime()) / 60000)}m`,
        status: status,
        images: 0,
        notes: notes,
        shiftId: activeShiftId,
        imageUrls: []
      };
      
      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      
      // Show toast notification
      toast({
        title: "Cleaning Ended Automatically",
        description: "Your cleaning has been automatically ended after 5 hours.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error in autoEndCleaning:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while auto-ending the cleaning.",
        variant: "destructive",
      });
    }
  }, [activeCleaning, activeShiftId, cleaningsHistory, setActiveCleaning, setCleaningElapsedTime, setCleaningsHistory, toast]);

  return { autoEndCleaning };
}
