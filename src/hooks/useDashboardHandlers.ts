
import { useState } from "react";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
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
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary
  } = useCleaning(activeShift?.id);
  
  const {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  } = useQRScannerHandlers({
    onStartShiftScan: startShift,
    onEndShiftScan: endShift,
    onStartCleaningScan: startCleaning,
    onEndCleaningScan: prepareSummary
  });
  
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleConfirmEndShiftWithoutQR,
    handleConfirmEndCleaningWithoutQR
  } = useDashboardConfirmations();
  
  // Event handlers
  const handleStartShift = () => {
    handleQRScannerStart('startShift');
  };
  
  const handleEndShiftWithScan = () => {
    handleQRScannerStart('endShift');
  };
  
  const handleEndShiftWithoutScan = () => {
    handleConfirmEndShiftWithoutQR(endShift);
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
    handleConfirmEndCleaningWithoutQR(prepareSummary);
  };
  
  const handleCompleteSummary = async () => {
    if (await completeSummary()) {
      setActiveTab('home');
    }
  };
  
  return {
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
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift,
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
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
