
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  updateShiftEnd,
  createOrFindQrCode 
} from "@/hooks/shift/useShiftDatabase";
import { createShiftHistoryItem } from "@/hooks/shift/useShiftHistory";
import { Shift, ShiftHistoryItem } from "@/hooks/shift/types";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";

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
      
      // Process QR code data if provided
      let endQrId = null;
      if (withScan && qrData) {
        // Parse QR code data
        const { areaId, areaName, isValid } = parseQrData(qrData);
        
        // If QR data isn't valid, create a mock QR data string
        const qrDataToUse = isValid ? qrData : createMockQrData(areaId, areaName);
        
        try {
          endQrId = await createOrFindQrCode(areaId, areaName, qrDataToUse);
          console.log("QR code ID for shift end:", endQrId);
        } catch (error: any) {
          console.error("Error with end QR code:", error);
          // Continue with shift end even if QR code processing fails
        }
      }
      
      // Update the shift in the database
      try {
        await updateShiftEnd(activeShift.id, endTime.toISOString(), status, endQrId);
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
