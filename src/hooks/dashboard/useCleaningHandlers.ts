
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
    console.log("Requesting to start cleaning");
    
    if (!activeShiftId) {
      toast({
        title: "Error",
        description: "You need to start a shift first.",
        variant: "destructive",
      });
      return;
    }
    
    // The actual opening of the scanner is done in useDashboardHandlers.ts
    console.log("Start cleaning prerequisites met, scanner will open");
  };

  const handleEndCleaningWithScan = () => {
    console.log("Requesting to end cleaning with scan");
    
    if (!activeCleaning) {
      toast({
        title: "Error",
        description: "No active cleaning to end.",
        variant: "destructive",
      });
      return;
    }
    
    // This function will be called when "Complete with Scan" button is clicked
    // The actual opening of the scanner is done in useDashboardHandlers.ts
    console.log("End cleaning prerequisites met, scanner will open");
  };

  const handleEndCleaningWithoutScan = () => {
    console.log("Requesting to end cleaning without scan");
    
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
    console.log("Auto-ending cleaning due to timeout");
    
    if (!activeCleaning) return;
    autoEndCleaning();
  };

  const handleCompleteSummary = async (setActiveTab: (tab: string) => void) => {
    try {
      console.log("Attempting to complete cleaning summary");
      
      if (await completeSummary()) {
        console.log("Cleaning summary completed successfully, switching to home tab");
        setActiveTab('home');
        return true;
      }
      return false;
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
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary,
    setSummaryNotes,
    setShowSummary,
    addImage,
    removeImage
  };
}
