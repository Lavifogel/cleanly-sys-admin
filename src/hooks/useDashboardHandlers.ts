
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
  // and pass setActiveTab to enable tab switching after scanning
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan: (qrData) => startShift(qrData),
    onEndShiftScan: (qrData) => endShift(true, qrData),
    onStartCleaningScan: (qrData) => startCleaning(qrData),
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
  const handleStartShift = () => {
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
  
  const handleEndShiftWithoutScan = () => {
    if (!activeShift) {
      toast({
        title: "Error",
        description: "No active shift to end.",
        variant: "destructive",
      });
      return;
    }
    handleConfirmEndShiftWithoutQR(() => endShift(false));
  };

  const handleAutoEndShift = () => {
    if (!activeShift) return;
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
  
  const handleEndCleaningWithoutScan = () => {
    if (!activeCleaning) {
      toast({
        title: "Error",
        description: "No active cleaning to end.",
        variant: "destructive",
      });
      return;
    }
    handleConfirmEndCleaningWithoutQR(() => prepareSummary(false));
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
