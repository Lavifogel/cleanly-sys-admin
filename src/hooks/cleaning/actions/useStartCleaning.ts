
import { v4 as uuidv4 } from "uuid";
import { Cleaning } from "@/types/cleaning";
import { createActivityLog } from "@/hooks/activityLogs/useActivityLogService";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";
import { useToast } from "@/hooks/use-toast";
import { createOrFindCleaningQrCode } from "@/hooks/shift/useCleaningDatabase";
import { generateTemporaryUserId } from "@/hooks/shift/useShiftDatabase";

export function useStartCleaning(
  activeShiftId: string | undefined,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void
) {
  const { toast } = useToast();

  // Start a new cleaning session with QR code data
  const startCleaning = async (qrData: string) => {
    if (!activeShiftId) {
      console.error("Cannot start cleaning without an active shift");
      return;
    }
    
    try {
      console.log("Starting cleaning process with QR data:", qrData);
      
      // Generate cleaning ID
      const cleaningId = uuidv4();
      const startTime = new Date();
      
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);
      const locationFromQR = areaName || "Unknown Location";
      
      console.log("Parsed QR data:", { areaId, areaName, isValid });
      
      // If QR data isn't valid, create a mock QR data string
      const qrDataToUse = isValid ? qrData : createMockQrData(areaId, areaName);
      
      // Find or create QR code in database
      let qrId = null;
      try {
        qrId = await createOrFindCleaningQrCode(areaId, areaName, qrDataToUse);
        console.log("QR code ID for cleaning:", qrId);
      } catch (error: any) {
        console.error("Error with cleaning QR code:", error);
      }
      
      // Get user ID 
      const userId = await generateTemporaryUserId();
      
      // Store the cleaning in the database as an activity log
      try {
        await createActivityLog({
          user_id: userId,
          qr_id: qrId,
          activity_type: 'cleaning_start',
          start_time: startTime.toISOString(),
          status: 'active',
          notes: `Location: ${locationFromQR}`,
          related_id: activeShiftId
        });
        console.log("Cleaning stored successfully as activity log");
      } catch (error: any) {
        console.error("Error storing cleaning:", error);
      }
      
      // Update local state with the cleaning id included
      setActiveCleaning({
        id: cleaningId,
        location: locationFromQR,
        startTime: startTime,
        timer: 0,
        paused: false,
      });
      setCleaningElapsedTime(0);
      
      // Show success toast
      toast({
        title: "Cleaning Started",
        description: `Started cleaning at ${locationFromQR}`,
      });
      
      console.log("Cleaning started successfully:", {
        id: cleaningId,
        location: locationFromQR,
        startTime: startTime
      });
      
    } catch (error) {
      console.error("Failed to start cleaning:", error);
      
      // Show error toast
      toast({
        title: "Failed to Start Cleaning",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  return { startCleaning };
}
