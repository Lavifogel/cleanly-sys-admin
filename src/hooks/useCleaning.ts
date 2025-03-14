
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { useCleaningImages } from "./useCleaningImages";
import { useCleaningTimer } from "./useCleaningTimer";
import { formatTime } from "@/utils/timeUtils";
import { 
  createOrFindCleaningQrCode, 
  createCleaning, 
  updateCleaningEnd,
  saveCleaningImages 
} from "@/hooks/shift/useCleaningDatabase";
import { parseQrData, createMockQrData } from "@/hooks/shift/useQrDataParser";

export function useCleaning(activeShiftId: string | undefined) {
  const [activeCleaning, setActiveCleaning] = useState<null | Cleaning>(null);
  const [cleaningElapsedTime, setCleaningElapsedTime] = useState(0);
  const [cleaningSummary, setCleaningSummary] = useState<CleaningSummary>({
    location: "",
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
    images: []
  });
  const [summaryNotes, setSummaryNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [cleaningsHistory, setCleaningsHistory] = useState<CleaningHistoryItem[]>([
    {
      id: "1",
      location: "Conference Room A",
      date: "2023-08-15",
      startTime: "09:30",
      endTime: "10:05",
      duration: "35m",
      status: "finished with scan",
      images: 2,
      notes: "Cleaned and restocked supplies",
      shiftId: "previous-shift-1",
      imageUrls: [
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage1.jpg",
        "https://evkldsfnndkgpifhgvic.supabase.co/storage/v1/object/public/cleaning-images/cleanings/mockImage2.jpg"
      ]
    },
    {
      id: "2",
      location: "Main Office",
      date: "2023-08-15",
      startTime: "10:30",
      endTime: "11:12",
      duration: "42m",
      status: "finished without scan",
      images: 0,
      notes: "",
      shiftId: "previous-shift-1",
    },
  ]);

  const { images, addImage, removeImage, isUploading, saveImagesToDatabase } = useCleaningImages({ maxImages: 5 });
  
  useCleaningTimer(activeCleaning, setCleaningElapsedTime);

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

  const togglePauseCleaning = () => {
    if (!activeCleaning) return;

    setActiveCleaning({
      ...activeCleaning,
      paused: !activeCleaning.paused,
    });
  };

  const prepareSummary = (withScan: boolean, qrData?: string) => {
    if (!activeCleaning) return;
    
    setCleaningSummary({
      location: activeCleaning.location,
      startTime: activeCleaning.startTime.toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: formatTime(cleaningElapsedTime),
      notes: "",
      images: []
    });
    
    setSummaryNotes("");
    setShowSummary(true);
  };

  const completeSummary = async () => {
    if (!activeCleaning || !activeShiftId) return false;
    
    try {
      // Now this is valid since we added the id property to the Cleaning interface
      const cleaningId = activeCleaning.id || uuidv4(); // Use existing ID or create one
      const endTime = new Date();
      const status = "finished with scan";
      
      console.log("Completing cleaning with ID:", cleaningId);
      
      // Save the cleaning data to the database
      await updateCleaningEnd(
        cleaningId,
        endTime.toISOString(),
        status,
        summaryNotes
      );
      
      // Save any images
      if (images.length > 0) {
        await saveCleaningImages(cleaningId, images);
      }
      
      // Update the local state
      const newCleaning = {
        id: cleaningId,
        location: activeCleaning.location,
        date: new Date().toISOString().split('T')[0],
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
        status: status,
        images: images.length,
        notes: summaryNotes,
        shiftId: activeShiftId,
        imageUrls: images
      };

      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      setShowSummary(false);
      
      return true;
    } catch (error) {
      console.error("Error completing cleaning summary:", error);
      return false;
    }
  };

  return {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    images,
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary,
    saveImagesToDatabase
  };
}
