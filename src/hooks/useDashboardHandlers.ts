
import { useState } from "react";
import { useTabActions } from "@/hooks/dashboard/useTabActions";
import { useShiftHandlers } from "@/hooks/dashboard/useShiftHandlers";
import { useCleaningHandlers } from "@/hooks/dashboard/useCleaningHandlers";
import { useQrScanHandlers } from "@/hooks/dashboard/useQrScanHandlers";
import { useDashboardConfirmations } from "@/hooks/useDashboardConfirmations";

export function useDashboardHandlers() {
  // Get tab management functionality
  const { activeTab, setActiveTab } = useTabActions();
  
  // Get shift-related functionality
  const {
    activeShift,
    elapsedTime,
    shiftsHistory,
    startShift,
    endShift,
    handleStartShift: baseHandleStartShift,
    handleEndShiftWithScan: baseHandleEndShiftWithScan,
    handleEndShiftWithoutScan: baseHandleEndShiftWithoutScan,
    handleAutoEndShift
  } = useShiftHandlers();
  
  // Get cleaning-related functionality
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
    handleStartCleaning: baseHandleStartCleaning,
    handleEndCleaningWithScan: baseHandleEndCleaningWithScan,
    handleEndCleaningWithoutScan: baseHandleEndCleaningWithoutScan,
    handleAutoEndCleaning,
    handleCompleteSummary: baseHandleCompleteSummary,
    setSummaryNotes,
    setShowSummary,
    addImage,
    removeImage
  } = useCleaningHandlers(activeShift?.id);
  
  // Set up QR scanner handlers
  const {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  } = useQrScanHandlers({
    onStartShiftScan: (qrData) => startShift(qrData),
    onEndShiftScan: (qrData) => endShift(true, qrData),
    onStartCleaningScan: (qrData) => startCleaning(qrData),
    onEndCleaningScan: (qrData) => prepareSummary(true, qrData),
    setActiveTab
  });
  
  // Get confirmation dialog functionality
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    handleConfirmEndShiftWithoutQR,
    handleConfirmEndCleaningWithoutQR
  } = useDashboardConfirmations();
  
  // Event handlers that combine functionality
  const handleStartShift = () => {
    baseHandleStartShift();
    handleQRScannerStart('startShift');
  };
  
  const handleEndShiftWithScan = () => {
    baseHandleEndShiftWithScan();
    handleQRScannerStart('endShift');
  };
  
  const handleEndShiftWithoutScan = () => {
    baseHandleEndShiftWithoutScan();
    handleConfirmEndShiftWithoutQR(() => endShift(false));
  };
  
  const handleStartCleaning = () => {
    baseHandleStartCleaning();
    handleQRScannerStart('startCleaning');
  };
  
  const handleEndCleaningWithScan = () => {
    baseHandleEndCleaningWithScan();
    handleQRScannerStart('endCleaning');
  };
  
  const handleEndCleaningWithoutScan = () => {
    baseHandleEndCleaningWithoutScan();
    handleConfirmEndCleaningWithoutQR(() => prepareSummary(false));
  };
  
  const handleCompleteSummary = async () => {
    return baseHandleCompleteSummary(setActiveTab);
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
