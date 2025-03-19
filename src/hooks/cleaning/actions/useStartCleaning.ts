
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Cleaning } from "@/types/cleaning";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";
import { createOrFindQrCode, generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";

export function useStartCleaning(
  activeShiftId: string | undefined,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void
) {
  const { toast } = useToast();

  const startCleaning = useCallback(async (qrData: string) => {
    if (!activeShiftId) {
      toast({
        title: "Error",
        description: "You need to start a shift first.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);
      
      // Start time
      const startTime = new Date();
      
      // If QR data isn't valid, create a mock QR data string
      const qrDataToUse = isValid ? qrData : createMockQrData(areaId, areaName);
      
      // Find or create QR code in database
      let qrId = null;
      try {
        qrId = await createOrFindQrCode(areaId, areaName, qrDataToUse);
        console.log("QR code ID for cleaning:", qrId);
      } catch (error: any) {
        console.error("Error with QR code:", error);
        toast({
          title: "QR Code Error",
          description: error.message || "There was an issue with the QR code.",
          variant: "destructive",
        });
      }
      
      // Get user ID
      const userId = await generateTemporaryUserId();
      
      // Create cleaning in activity_logs table
      const activityLog = await createActivityLog({
        user_id: userId,
        qr_id: qrId,
        activity_type: 'cleaning_start',
        start_time: startTime.toISOString(),
        status: 'active',
        notes: `Location: ${areaName}`,
        related_id: activeShiftId
      });
      
      console.log("Created new cleaning activity log:", activityLog);
      
      // Update local state
      setActiveCleaning({
        id: activityLog.id, // Use the ID from the created activity log
        location: areaName,
        startTime: startTime,
        timer: 0,
        paused: false
      });
      
      setCleaningElapsedTime(0);
      
      toast({
        title: "Cleaning Started",
        description: `Cleaning of ${areaName} has started.`,
        duration: 3000,
      });
      
      return activityLog.id;
    } catch (error: any) {
      console.error("Error in startCleaning:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [activeShiftId, setActiveCleaning, setCleaningElapsedTime, toast]);

  return { startCleaning };
}
