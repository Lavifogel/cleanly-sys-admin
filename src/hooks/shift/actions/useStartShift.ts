
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { 
  createOrFindQrCode, 
  createShift,
  generateTemporaryUserId 
} from "@/hooks/shift/useShiftDatabase";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";
import { Shift } from "@/hooks/shift/types";

/**
 * Hook for starting shifts
 */
export function useStartShift(
  setActiveShift: (shift: Shift | null) => void,
  setElapsedTime: (time: number) => void
) {
  const { toast } = useToast();

  // Handle startShift
  const startShift = useCallback(async (qrData: string) => {
    try {
      // Generate a unique ID for the new shift
      const newShiftId = uuidv4();
      const startTime = new Date();
      
      console.log("Starting shift with QR data:", qrData);
      
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);
      
      // If QR data isn't valid, create a mock QR data string
      const qrDataToUse = isValid ? qrData : createMockQrData(areaId, areaName);
      
      // Find or create QR code in database
      let qrId = null;
      try {
        qrId = await createOrFindQrCode(areaId, areaName, qrDataToUse);
        console.log("QR code ID for shift:", qrId);
      } catch (error: any) {
        console.error("Error with QR code:", error);
        toast({
          title: "QR Code Error",
          description: error.message || "There was an issue with the QR code.",
          variant: "destructive",
        });
        return; // Exit early if QR code creation fails
      }
      
      // Generate a temporary user ID
      const temporaryUserId = await generateTemporaryUserId();
      
      // Store the shift in the database
      try {
        await createShift(newShiftId, temporaryUserId, startTime.toISOString(), qrId);
        console.log("Shift stored successfully");
      } catch (error: any) {
        console.error("Error storing shift:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to start shift. Database error.",
          variant: "destructive",
        });
        return; // Exit early if shift creation fails
      }
      
      // Update the local state
      const newShift: Shift = {
        startTime: startTime,
        timer: 0,
        id: newShiftId,
      };
      
      // Set active shift with a slight delay to ensure state updates properly
      setTimeout(() => {
        setActiveShift(newShift);
        setElapsedTime(0);
        
        toast({
          title: "Shift Started",
          description: "Your shift has been started successfully.",
          duration: 3000,
        });
      }, 50);
      
    } catch (error: any) {
      console.error("Error in startShift:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to allow the calling component to handle it
    }
  }, [setActiveShift, setElapsedTime, toast]);

  return { startShift };
}
