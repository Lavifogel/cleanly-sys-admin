
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";

/**
 * Hook for ending shifts
 */
export function useEndShift(
  activeShift: Shift | null,
  elapsedTime: number,
  shiftsHistory: ShiftHistoryItem[],
  setActiveShift: (shift: Shift | null) => void,
  setElapsedTime: (time: number) => void,
  setShiftsHistory: (history: ShiftHistoryItem[]) => void
) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle endShift
  const endShift = useCallback(async (withScan: boolean, qrData?: string) => {
    if (!activeShift) return;
    
    try {
      const endTime = new Date();
      const status = withScan ? "finished with scan" : "finished without scan";
      
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
        toast({
          title: "Error",
          description: "Failed to end shift. Please try again.",
          variant: "destructive",
        });
        return;
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
      
      // Show success toast
      toast({
        title: "Shift Ended",
        description: "Your shift has been successfully completed.",
        duration: 3000,
      });
      
      // Redirect to the login page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error in endShift:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeShift, elapsedTime, shiftsHistory, setActiveShift, setElapsedTime, setShiftsHistory, toast, navigate]);

  return { endShift };
}
