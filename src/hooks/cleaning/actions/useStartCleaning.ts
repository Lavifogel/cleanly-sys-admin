
import { v4 as uuidv4 } from "uuid";
import { Cleaning } from "@/types/cleaning";
import { 
  createOrFindCleaningQrCode, 
  createCleaning 
} from "@/hooks/shift/useCleaningDatabase";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";

export function useStartCleaning(
  activeShiftId: string | undefined,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void
) {
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
      
      // Store the cleaning in the database
      try {
        await createCleaning(
          cleaningId, 
          activeShiftId, 
          startTime.toISOString(), 
          qrId,
          locationFromQR
        );
        console.log("Cleaning stored successfully in database");
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
      console.log("Cleaning started successfully with ID:", cleaningId);
      
    } catch (error) {
      console.error("Failed to start cleaning:", error);
    }
  };

  return { startCleaning };
}
