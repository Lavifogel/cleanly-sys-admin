
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

  const handleStartCleaning = () => {
    if (!activeShiftId) {
      toast({
        title: "Error",
        description: "You need to start a shift first.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeCleaning) {
      toast({
        title: "Error",
        description: "You already have an active cleaning session.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Ready to start cleaning, waiting for QR scan");
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
    
    // In this handler we'll directly prepare the cleaning summary
    prepareSummary(false);
  };

  const handleAutoEndCleaning = () => {
    if (!activeCleaning) return;
    autoEndCleaning();
  };

  const handleCompleteSummary = async (setActiveTab: (tab: string) => void) => {
    try {
      if (await completeSummary()) {
        setActiveTab('home');
      }
    } catch (error) {
      console.error("Error completing summary:", error);
      toast({
        title: "Error",
        description: "Failed to complete the cleaning summary. Please try again.",
        variant: "destructive",
      });
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
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    handleStartCleaning,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary,
    setSummaryNotes,
    setShowSummary,
    addImage,
    removeImage
  };
}
