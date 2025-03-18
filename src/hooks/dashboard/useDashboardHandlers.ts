
import { useTabManagement } from "@/hooks/useTabManagement";
import { useQRScannerHandlers } from "@/hooks/useQRScannerHandlers";
import { useDashboardConfirmations } from "@/hooks/useDashboardConfirmations";
import { useShiftHandlers } from "./useShiftHandlers";
import { useCleaningHandlers } from "./useCleaningHandlers";
import { useToast } from "@/hooks/use-toast";

export function useDashboardHandlers() {
  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabManagement();
  
  // Get shift handlers
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    handleStartShift,
    handleEndShiftWithoutScan,
    endShift,
    autoEndShift
  } = useShiftHandlers();
  
  // Get cleaning handlers with the active shift ID
  const {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    images,
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
  } = useCleaningHandlers(activeShift?.id);
  
  // Initialize the QR scanner handlers with the correct callback functions
  // and pass setActiveTab to enable tab switching after scanning
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan: (qrData) => handleStartShift(qrData),
    onEndShiftScan: (qrData) => endShift(true, qrData),
    onStartCleaningScan: (qrData) => handleStartCleaning(qrData),
    onEndCleaningScan: (qrData) => prepareSummary(true, qrData),
    setActiveTab: setActiveTab // Pass setActiveTab to enable tab switching
  });

  const {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  } = qrScannerHandlers;
  
  const confirmationHandlers = useDashboardConfirmations();
  
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleConfirmEndShiftWithoutQR,
    handleConfirmEndCleaningWithoutQR
  } = confirmationHandlers;
  
  // Event handlers
  const handleStartShiftWithScan = () => {
    handleQRScannerStart('startShift');
  };
  
  const handleEndShiftWithScan = () => {
    if (!activeShift) {
      toast({
        title: "Error",
        description: "No active shift to end.",
        variant: "destructive",
      });
      return;
    }
    handleQRScannerStart('endShift');
  };

  const handleAutoEndShift = () => {
    if (!activeShift) return;
    autoEndShift();
  };
  
  const handleStartCleaningWithScan = () => {
    if (!activeShift) {
      toast({
        title: "Error",
        description: "You need to start a shift first.",
        variant: "destructive",
      });
      return;
    }
    
    handleQRScannerStart('startCleaning');
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
    handleQRScannerStart('endCleaning');
  };
  
  const handleAutoEndCleaning = () => {
    if (!activeCleaning) return;
    autoEndCleaning();
  };
  
  const handleCompleteCleaningSummary = async () => {
    try {
      if (await handleCompleteSummary()) {
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
    activeTab,
    setActiveTab,
    activeShift,
    elapsedTime,
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    shiftsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    showQRScanner,
    scannerPurpose,
    showConfirmDialog,
    confirmAction,
    isUploading,
    images,
    
    // Actions
    handleQRScan,
    handleStartShiftWithScan: handleStartShiftWithScan,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan: () => handleConfirmEndShiftWithoutQR(() => handleEndShiftWithoutScan()),
    handleAutoEndShift,
    handleStartCleaningWithScan,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan: () => handleConfirmEndCleaningWithoutQR(() => handleEndCleaningWithoutScan()),
    handleAutoEndCleaning,
    handleCompleteSummary: handleCompleteCleaningSummary,
    togglePauseCleaning,
    setSummaryNotes,
    setShowSummary,
    closeScanner,
    setShowConfirmDialog,
    addImage,
    removeImage
  };
}
