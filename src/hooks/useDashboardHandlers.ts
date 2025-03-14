
import { useState } from "react";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/cleaning";
import { useTabManagement } from "@/hooks/useTabManagement";
import { useQRScannerHandlers } from "@/hooks/useQRScannerHandlers";
import { useDashboardConfirmations } from "@/hooks/useDashboardConfirmations";
import { useToast } from "@/hooks/use-toast";

export function useDashboardHandlers() {
  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabManagement();
  
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    autoEndShift
  } = useShift();
  
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
  } = useCleaning(activeShift?.id);
  
  // Initialize the QR scanner handlers with the correct callback functions
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan: (qrData) => startShift(qrData),
    onEndShiftScan: (qrData) => endShift(true, qrData),
    onStartCleaningScan: (qrData) => startCleaning(qrData),
    onEndCleaningScan: (qrData) => prepareSummary(true, qrData)
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
  const handleStartShift = () => {
    handleQRScannerStart('startShift');
  };
  
  const handleEndShiftWithScan = () => {
    handleQRScannerStart('endShift');
  };
  
  const handleEndShiftWithoutScan = () => {
    handleConfirmEndShiftWithoutQR(() => endShift(false));
  };

  const handleAutoEndShift = () => {
    autoEndShift();
  };
  
  const handleStartCleaning = () => {
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
    handleQRScannerStart('endCleaning');
  };
  
  const handleEndCleaningWithoutScan = () => {
    handleConfirmEndCleaningWithoutQR(() => prepareSummary(false));
  };
  
  const handleAutoEndCleaning = () => {
    autoEndCleaning();
  };
  
  const handleCompleteSummary = async () => {
    if (await completeSummary()) {
      setActiveTab('home');
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
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift,
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary,
    togglePauseCleaning,
    setSummaryNotes,
    setShowSummary,
    closeScanner,
    setShowConfirmDialog,
    addImage,
    removeImage
  };
}
