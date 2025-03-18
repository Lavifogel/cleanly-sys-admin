
import { useState } from "react";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/cleaning";
import { useTabManagement } from "@/hooks/useTabManagement";
import { useToast } from "@/hooks/use-toast";
import { useShiftHandlers } from "./useShiftHandlers";
import { useCleaningHandlers } from "./useCleaningHandlers";
import { useQRScannerHandlers } from "./useQRScannerHandlers";
import { useDashboardConfirmations } from "@/hooks/useDashboardConfirmations";

export function useDashboardHandlers() {
  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabManagement();
  
  // Core shift and cleaning state/logic
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
  
  // Specialized handlers
  const shiftHandlers = useShiftHandlers({
    activeShift,
    startShift,
    endShift,
    autoEndShift,
    toast
  });
  
  const cleaningHandlers = useCleaningHandlers({
    activeCleaning,
    startCleaning,
    prepareSummary,
    completeSummary,
    autoEndCleaning,
    setActiveTab,
    toast
  });
  
  // QR scanner handlers
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan: (qrData) => startShift(qrData),
    onEndShiftScan: (qrData) => endShift(true, qrData),
    onStartCleaningScan: (qrData) => startCleaning(qrData),
    onEndCleaningScan: (qrData) => prepareSummary(true, qrData),
    setActiveTab: setActiveTab
  });
  
  // Confirmation dialogs
  const confirmationHandlers = useDashboardConfirmations();
  
  // Connect confirmation handlers to action handlers
  const { 
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
    handleAutoEndShift
  } = shiftHandlers;
  
  const {
    handleStartCleaning,
    handleEndCleaningWithScan,
    handleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary
  } = cleaningHandlers;
  
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
    showQRScanner: qrScannerHandlers.showQRScanner,
    scannerPurpose: qrScannerHandlers.scannerPurpose,
    showConfirmDialog: confirmationHandlers.showConfirmDialog,
    confirmAction: confirmationHandlers.confirmAction,
    isUploading,
    images,
    
    // Actions
    handleQRScan: qrScannerHandlers.handleQRScan,
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
    closeScanner: qrScannerHandlers.closeScanner,
    setShowConfirmDialog: confirmationHandlers.setShowConfirmDialog,
    addImage,
    removeImage
  };
}
