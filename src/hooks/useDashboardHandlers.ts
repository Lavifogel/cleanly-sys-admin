
import { useState } from "react";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useConfirmation } from "@/hooks/useConfirmation";
import { useQRScanner } from "@/hooks/useQRScanner";

export function useDashboardHandlers() {
  const [activeTab, setActiveTab] = useState("home");
  
  // Use our custom hooks
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
    openScanner,
    closeScanner
  } = useQRScanner();
  
  const {
    showConfirmDialog,
    confirmAction,
    setShowConfirmDialog,
    showConfirmationDialog
  } = useConfirmation();

  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    closeScanner();

    switch (scannerPurpose) {
      case "startShift":
        startShift(decodedText);
        break;
      case "endShift":
        endShift(true, decodedText);
        break;
      case "startCleaning":
        startCleaning(decodedText);
        setActiveTab("cleaning");
        break;
      case "endCleaning":
        prepareSummary(true, decodedText);
        break;
      default:
        break;
    }
  };

  // Handler functions
  const handleStartShift = () => {
    if (activeShift) return;
    openScanner("startShift");
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift || activeCleaning) return;
    openScanner("endShift");
  };

  const handleEndShiftWithoutScan = () => {
    if (!activeShift || activeCleaning) return;
    showConfirmationDialog(
      "End Shift Without Scan",
      "Are you sure you want to end your shift without scanning? This action cannot be undone.",
      () => endShift(false)
    );
  };

  const handleStartCleaning = () => {
    if (!activeShift || activeCleaning) return;
    openScanner("startCleaning");
  };

  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) return;
    openScanner("endCleaning");
  };

  const handleEndCleaningWithoutScan = () => {
    if (!activeCleaning) return;
    showConfirmationDialog(
      "End Cleaning Without Scan",
      "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
      () => prepareSummary(false)
    );
  };

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
