
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";

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
      
      // Get user ID for the shift
      const userId = await generateTemporaryUserId();
      
      // Create a shift_end activity log
      try {
        await createActivityLog({
          user_id: userId,
          qr_id: activeShift.qrId,
          activity_type: 'shift_end',
          start_time: endTime.toISOString(),
          status: status,
          related_id: activeShift.id
        });
      } catch (error: any) {
        console.error("Error creating shift_end log:", error);
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
