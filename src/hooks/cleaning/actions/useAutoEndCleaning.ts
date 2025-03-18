
import { useCallback } from "react";
import { Cleaning, CleaningHistoryItem } from "@/types/cleaning";
import { updateCleaningEnd } from "@/hooks/shift/useCleaningDatabase";
import { useToast } from "@/hooks/use-toast";
import { formatDateToDDMMYYYY } from "@/utils/timeUtils";

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
      
      // Update the cleaning in the database
      await updateCleaningEnd(
        cleaningId,
        endTime.toISOString(),
        status,
        notes
      );
      
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
