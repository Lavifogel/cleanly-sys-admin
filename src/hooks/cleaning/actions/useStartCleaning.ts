
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Cleaning } from "@/types/cleaning";
import { useToast } from "@/hooks/use-toast";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";
import { parseQrData } from "@/hooks/shift/useQrDataParser";

/**
 * Hook for starting cleaning sessions
 */
export function useStartCleaning(
  activeShiftId: string | undefined,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void
) {
  const { toast } = useToast();

  // Handle startCleaning
  const startCleaning = useCallback(async (qrData: string) => {
    if (!activeShiftId) {
      toast({
        title: "Error",
        description: "You need to start a shift before starting a cleaning.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const cleaningId = uuidv4();
      const startTime = new Date();
      
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);

      // Generate a temporary user ID
      const temporaryUserId = await generateTemporaryUserId();
      
      // Create a cleaning_start activity log
      try {
        await createActivityLog({
          user_id: temporaryUserId,
          qr_id: areaId,
          activity_type: 'cleaning_start',
          start_time: startTime.toISOString(),
          status: 'active',
          related_id: activeShiftId
        });
        console.log("Cleaning stored successfully as activity log");
      } catch (error: any) {
        console.error("Error storing cleaning:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to start cleaning. Database error.",
          variant: "destructive",
        });
        return;
      }
      
      // Update the state with the new cleaning
      setActiveCleaning({
        id: cleaningId,
        location: areaName || "Unknown Area",
        startTime,
        timer: 0,
        paused: false
      });
      setCleaningElapsedTime(0);
      
      toast({
        title: "Cleaning Started",
        description: `Cleaning started at ${areaName || "Unknown Area"}.`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error in startCleaning:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeShiftId, setActiveCleaning, setCleaningElapsedTime, toast]);

  return { startCleaning };
}
