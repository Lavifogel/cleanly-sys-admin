
import { useState } from "react";
import { useCleaning } from "@/hooks/cleaning";
import { useToast } from "@/hooks/use-toast";

export function useCleaningHandlers(activeShiftId: string | undefined) {
  const { toast } = useToast();
  
  const {
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
    autoEndCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary
  } = useCleaning(activeShiftId);
  
  // Cleaning handlers
  const handleStartCleaning = (qrData: string) => {
    if (!activeShiftId) {
      toast({
        title: "Error",
        description: "You need to start a shift first.",
        variant: "destructive",
      });
      return;
    }
    
    return startCleaning(qrData);
  };
  
  const handleEndCleaningWithoutScan = () => {
    if (!activeCleaning) {
      toast({
        title: "Error",
        description: "No active cleaning to end.",
        variant: "destructive",
      });
      return;
    }
    
    return prepareSummary(false);
  };
  
  const handleCompleteSummary = async () => {
    try {
      return await completeSummary();
    } catch (error) {
      console.error("Error completing summary:", error);
      toast({
        title: "Error",
        description: "Failed to complete the cleaning summary. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    // State
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    images,
    
    // Actions
    handleStartCleaning,
    handleEndCleaningWithoutScan,
    handleCompleteSummary,
    togglePauseCleaning,
    prepareSummary,
    autoEndCleaning,
    setSummaryNotes,
    setShowSummary,
    addImage,
    removeImage
  };
}
