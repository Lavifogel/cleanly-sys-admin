
import { Cleaning } from "@/types/cleaning";
import { useToast } from "@/hooks/use-toast";

interface UseCleaningHandlersProps {
  activeCleaning: Cleaning | null;
  startCleaning: (qrData: string) => Promise<void>;
  prepareSummary: (withScan: boolean, qrData?: string) => void;
  completeSummary: () => Promise<boolean>;
  autoEndCleaning: () => void;
  setActiveTab: (tab: string) => void;
  toast: ReturnType<typeof useToast>;
}

export function useCleaningHandlers({
  activeCleaning,
  startCleaning,
  prepareSummary,
  completeSummary,
  autoEndCleaning,
  setActiveTab,
  toast
}: UseCleaningHandlersProps) {
  // Event handlers
  const handleStartCleaning = () => {
    // This function will be implemented by useQRScannerHandlers
  };
  
  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) {
      toast({
        title: "Error",
        description: "No active cleaning to end.",
        variant: "destructive",
      });
      return;
    }
    // This function will be implemented by useQRScannerHandlers
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
    // This function will be implemented by useDashboardConfirmations
  };
  
  const handleAutoEndCleaning = () => {
    if (!activeCleaning) return;
    autoEndCleaning();
  };
  
  const handleCompleteSummary = async () => {
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
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary
  };
}
