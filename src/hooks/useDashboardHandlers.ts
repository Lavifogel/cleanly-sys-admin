
import { useState } from "react";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useTabManagement } from "@/hooks/useTabManagement";
import { useDashboardQRScanner } from "@/hooks/useDashboardQRScanner";
import { useDashboardConfirmations } from "@/hooks/useDashboardConfirmations";

export function useDashboardHandlers() {
  // Use our custom hooks for tab management
  const { activeTab, setActiveTab } = useTabManagement();
  
  // Use shift and cleaning hooks
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift
  } = useShift();
  
  const {
    activeCleaning,
    cleaningElapsedTime,
    cleaningsHistory,
    cleaningSummary,
    summaryNotes,
    showSummary,
    isUploading,
    startCleaning,
    togglePauseCleaning,
    prepareSummary,
    completeSummary,
    addImage,
    removeImage,
    setSummaryNotes,
    setShowSummary
  } = useCleaning(activeShift?.id);
  
  // Use QR scanner hook
  const {
    showQRScanner,
    scannerPurpose,
    closeScanner,
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleStartCleaning,
    handleEndCleaningWithScan
  } = useDashboardQRScanner(
    activeShift,
    activeCleaning,
    setActiveTab,
    startShift,
    endShift,
    startCleaning,
    prepareSummary
  );
  
  // Use confirmations hook
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleEndShiftWithoutScan,
    handleEndCleaningWithoutScan
  } = useDashboardConfirmations(
    activeShift,
    activeCleaning,
    endShift,
    prepareSummary
  );

  // Handle completing a cleaning summary
  const handleCompleteSummary = () => {
    if (completeSummary()) {
      setActiveTab("home");
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
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleEndShiftWithoutScan,
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
