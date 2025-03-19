
import { v4 as uuidv4 } from "uuid";
import { Cleaning, CleaningHistoryItem, CleaningSummary } from "@/types/cleaning";
import { useCleaningImages } from "@/hooks/useCleaningImages";
import { updateCleaningEnd, saveCleaningImages } from "@/hooks/shift/useCleaningDatabase";
import { formatTime } from "@/utils/timeUtils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { images, addImage, removeImage, isUploading, saveImagesToDatabase, resetImages } = useCleaningImages({ maxImages: 5 });

  // Format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Prepare cleaning summary for completion
  const prepareSummary = (withScan: boolean, qrData?: string) => {
    if (!activeCleaning) {
      toast({
        title: "Error",
        description: "No active cleaning to prepare summary for.",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!activeCleaning || !activeShiftId) {
      toast({
        title: "Error",
        description: "Cannot complete summary: missing active cleaning or shift.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Ensure we have a valid cleaning ID
      const cleaningId = activeCleaning.id || uuidv4();
      const endTime = new Date();
      const status = "finished with scan";
      
      console.log("Completing cleaning with ID:", cleaningId);
      
      // Update the cleaning record in the database with end time and notes
      await updateCleaningEnd(
        cleaningId,
        endTime.toISOString(),
        status,
        summaryNotes
      );
      
      // Save any images
      if (images.length > 0) {
        try {
          // Use the dedicated function to save images to the database
          await saveImagesToDatabase(cleaningId);
          console.log(`Successfully saved ${images.length} images for cleaning ${cleaningId}`);
        } catch (imageError) {
          console.error("Error saving images:", imageError);
          toast({
            title: "Warning",
            description: "Cleaning saved but there was an issue uploading images.",
            variant: "destructive",
          });
        }
      }
      
      // Update the local state with the completed cleaning
      const newCleaning = {
        id: cleaningId,
        location: activeCleaning.location,
        date: formatDateToDDMMYYYY(new Date()),
        startTime: activeCleaning.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration: `${Math.floor(cleaningElapsedTime / 60)}m`,
        status: status,
        images: images.length,
        notes: summaryNotes,
        shiftId: activeShiftId,
        imageUrls: images
      };

      // Update local state
      setCleaningsHistory([newCleaning, ...cleaningsHistory]);
      setActiveCleaning(null);
      setCleaningElapsedTime(0);
      setShowSummary(false);
      
      toast({
        title: "Success",
        description: "Cleaning completed successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error completing cleaning summary:", error);
      toast({
        title: "Error",
        description: "Failed to complete cleaning. Please try again.",
        variant: "destructive",
      });
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
