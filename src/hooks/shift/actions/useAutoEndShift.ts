
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  updateShiftEnd 
} from "@/hooks/shift/useShiftDatabase";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";

/**
 * Hook for automatically ending shifts that exceed max duration
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
  const navigate = useNavigate();

  // Handle auto end shift (for shifts that exceed 16 hours)
  const autoEndShift = useCallback(async () => {
    if (!activeShift) return;
    
    try {
      const endTime = new Date();
      const status = "finished automatically";
      
      // Update the shift in the database
      try {
        await updateShiftEnd(activeShift.id, endTime.toISOString(), status);
      } catch (error: any) {
        console.error("Error auto-updating shift:", error);
        toast({
          title: "Error",
          description: "Failed to auto-end shift. Please try again.",
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
      
      // Show toast
      toast({
        title: "Shift Ended Automatically",
        description: "Your shift has been automatically ended after 16 hours.",
        duration: 3000,
      });
      
      // Redirect to the login page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error in autoEndShift:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while auto-ending the shift.",
        variant: "destructive",
      });
    }
  }, [activeShift, elapsedTime, navigate, setActiveShift, setElapsedTime, setShiftsHistory, shiftsHistory, toast]);

  return { autoEndShift };
}
