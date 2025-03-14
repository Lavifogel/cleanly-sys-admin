
import { v4 as uuidv4 } from "uuid";
import { Cleaning } from "@/types/cleaning";
import { 
  createOrFindCleaningQrCode, 
  createCleaning, 
  updateCleaningEnd,
  saveCleaningImages 
} from "@/hooks/shift/useCleaningDatabase";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useCleaningActions(
  activeShiftId: string | undefined, 
  activeCleaning: Cleaning | null,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  cleaningsHistory: any[],
  setCleaningsHistory: (history: any[]) => void
) {
  const { toast } = useToast();

  // Start a new cleaning session with QR code data
  const startCleaning = async (qrData: string) => {
    if (!activeShiftId) {
      console.error("Cannot start cleaning without an active shift");
      return;
    }
    
    try {
      // Generate cleaning ID
      const cleaningId = uuidv4();
      const startTime = new Date();
      
      // Parse QR code data
      const { areaId, areaName, isValid } = parseQrData(qrData);
      const locationFromQR = areaName || "Unknown Location";
      
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
        console.log("Cleaning stored successfully");
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
      
    } catch (error) {
      console.error("Failed to start cleaning:", error);
    }
  };

  // Toggle pause/resume of the current cleaning
  const togglePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });
  };

  // Automatically end cleaning after 5 hours
  const autoEndCleaning = useCallback(async () => {
    if (!activeCleaning || !activeShiftId) return;
    
    try {
      const cleaningId = activeCleaning.id || "";
      const endTime = new Date();
      const status = "finished automatically";
      const notes = "This cleaning was automatically ended after 5 hours.";
      
      console.log("Auto-ending cleaning with ID:", cleaningId);
      
      // Update the cleaning in the database
      await updateCleaningEnd(
        cleaningId,
        endTime.toISOString(),
        status,
        notes
      );
      
      // Update the local state
      const newCleaning = {
        id: cleaningId,
        location: activeCleaning.location,
        date: new Date().toISOString().split('T')[0],
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor((endTime.getTime() - activeCleaning.startTime.getTime()) / 60000)}m`,
        status: status,
        images: 0,
        notes: notes,
        shiftId: activeShiftId,
        imageUrls: []
      };
      
      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      
      // Show toast notification
      toast({
        title: "Cleaning Ended Automatically",
        description: "Your cleaning has been automatically ended after 5 hours.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error in autoEndCleaning:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while auto-ending the cleaning.",
        variant: "destructive",
      });
    }
  }, [activeCleaning, activeShiftId, cleaningsHistory, setActiveCleaning, setCleaningElapsedTime, setCleaningsHistory, toast]);

  return {
    startCleaning,
    togglePauseCleaning,
    autoEndCleaning
  };
}
