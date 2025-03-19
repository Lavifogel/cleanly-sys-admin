
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  updateShiftEnd 
} from "@/hooks/shift/useShiftDatabase";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";

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
    if (!activeShift) {
      console.error("No active shift to end");
      toast({
        title: "Error",
        description: "No active shift found to end",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log(`Ending shift (withScan: ${withScan}, qrData: ${qrData || 'none'})`);
      const endTime = new Date();
      const status = withScan ? "finished with scan" : "finished without scan";
      
      // Update the shift in the database
      try {
        await updateShiftEnd(activeShift.id, endTime.toISOString(), status);
        console.log("Shift ended successfully in database");
      } catch (error: any) {
        console.error("Error updating shift:", error);
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
