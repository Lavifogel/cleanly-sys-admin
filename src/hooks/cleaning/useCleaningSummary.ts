
import { v4 as uuidv4 } from "uuid";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { useCleaningImages } from "@/hooks/useCleaningImages";
import { updateCleaningEnd } from "@/hooks/shift/useCleaningDatabase";
import { formatTime } from "@/utils/timeUtils";

export function useCleaningSummary(
  activeShiftId: string | undefined,
  activeCleaning: Cleaning | null,
  cleaningElapsedTime: number,
  setActiveCleaning: (cleaning: Cleaning | null) => void,
  setCleaningElapsedTime: (time: number) => void,
  cleaningsHistory: CleaningHistoryItem[],
  setCleaningsHistory: (history: CleaningHistoryItem[]) => void,
  setCleaningSummary: (summary: CleaningSummary) => void,
  summaryNotes: string,
  setSummaryNotes: (notes: string) => void,
  setShowSummary: (show: boolean) => void
) {
  const { images, addImage, removeImage, isUploading, saveImagesToDatabase, resetImages } = useCleaningImages({ maxImages: 5 });

  // Prepare cleaning summary for completion
  const prepareSummary = (withScan: boolean, qrData?: string) => {
    if (!activeCleaning) return;
    
    // Reset summary notes and images when opening the summary form
    setSummaryNotes("");
    resetImages();
    
    setCleaningSummary({
      location: activeCleaning.location,
      startTime: activeCleaning.startTime.toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration: formatTime(cleaningElapsedTime),
      notes: "",
      images: []
    });
    
    setShowSummary(true);
  };

  // Complete the cleaning with summary and save to DB
  const completeSummary = async () => {
    if (!activeCleaning || !activeShiftId) return false;
    
    try {
      // Now this is valid since we added the id property to the Cleaning interface
      const cleaningId = activeCleaning.id || uuidv4(); // Use existing ID or create one
      const endTime = new Date();
      const status = "finished with scan";
      
      console.log("Completing cleaning with ID:", cleaningId);
      
      // Fixed: Only passing the required arguments to updateCleaningEnd
      await updateCleaningEnd(
        cleaningId,
        endTime.toISOString(),
        status,
        summaryNotes
      );
      
      // Save any images
      if (images.length > 0) {
        await saveImagesToDatabase(cleaningId);
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
    images,
    isUploading,
    addImage,
    removeImage,
    prepareSummary,
    completeSummary,
    saveImagesToDatabase
  };
}
