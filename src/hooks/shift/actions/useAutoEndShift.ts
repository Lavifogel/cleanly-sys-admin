
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  updateShiftEnd 
} from "@/hooks/shift/useShiftDatabase";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";

/**
 * Hook for automatically ending shifts
 */
export function useAutoEndShift(
  activeShift: Shift | null,
  elapsedTime: number,
  shiftsHistory: ShiftHistoryItem[],
  setActiveShift: (shift: Shift | null) => void,
  setElapsedTime: (time: number) => void,
  setShiftsHistory: (history: ShiftHistoryItem[]) => void
) {
  const { toast } = useToast();

  // Auto end shift without confirmation or extra steps
  const autoEndShift = useCallback(async () => {
    if (!activeShift) return false;
    
    try {
      const endTime = new Date();
      const status = "finished automatically";
      
      console.log("Auto-ending shift:", activeShift.id);
      
      // Update the shift in the database
      try {
        await updateShiftEnd(activeShift.id, endTime.toISOString(), status);
      } catch (error: any) {
        console.error("Error auto-ending shift:", error);
        return false;
      }
      
      // Create a new shift history item
      const newShift = createShiftHistoryItem(
        activeShift.id,
        activeShift.startTime,
        endTime,
        elapsedTime,
        status
      );

      // Update the local state
      setShiftsHistory([newShift, ...shiftsHistory]);
      setActiveShift(null);
      setElapsedTime(0);
      
      console.log("Shift automatically ended");
      return true;
    } catch (error) {
      console.error("Error in autoEndShift:", error);
      return false;
    }
  }, [activeShift, elapsedTime, shiftsHistory, setActiveShift, setElapsedTime, setShiftsHistory]);

  return { autoEndShift };
}
