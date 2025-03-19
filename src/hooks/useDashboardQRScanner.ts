
import { ScannerPurpose, useQRScanner } from "@/hooks/useQRScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useEffect } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export function useDashboardQRScanner(
  activeShift: ReturnType<typeof useShift>["activeShift"],
  activeCleaning: ReturnType<typeof useCleaning>["activeCleaning"],
  setActiveTab: (tab: string) => void,
  startShift: (qrData: string) => void,
  endShift: (withScan: boolean, qrData?: string) => void,
  startCleaning: (qrData: string) => void,
  prepareSummary: (withScan: boolean, qrData?: string) => void
) {
  const {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  } = useQRScanner();
  
  // Close and clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("[useDashboardQRScanner] Cleanup on unmount");
    };
  }, []);
  
  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("[useDashboardQRScanner] QR Code scanned with purpose:", scannerPurpose, "data:", decodedText);
    
    // Close scanner before processing the result
    closeScanner();
    
    // Add delay before processing to ensure camera resources are released
    setTimeout(() => {
      console.log(`[useDashboardQRScanner] Processing scan result for ${scannerPurpose}...`);
      
      switch (scannerPurpose) {
        case "startShift":
          console.log("[useDashboardQRScanner] Starting shift with QR data:", decodedText);
          startShift(decodedText);
          break;
        case "endShift":
          console.log("[useDashboardQRScanner] Ending shift with QR data:", decodedText);
          endShift(true, decodedText);
          break;
        case "startCleaning":
          console.log("[useDashboardQRScanner] Starting cleaning with QR data:", decodedText);
          startCleaning(decodedText);
          setActiveTab("cleaning");
          break;
        case "endCleaning":
          console.log("[useDashboardQRScanner] Ending cleaning with QR data:", decodedText);
          prepareSummary(true, decodedText);
          break;
        default:
          console.warn("[useDashboardQRScanner] Unknown scanner purpose:", scannerPurpose);
          break;
      }
    }, 1000); // Longer delay to ensure complete cleanup
  };
  
  // Handler functions for different QR scanning purposes
  const handleStartShift = () => {
    if (activeShift) {
      console.log("[useDashboardQRScanner] Shift already active, cannot start new shift");
      return;
    }
    console.log("[useDashboardQRScanner] Opening scanner for startShift");
    // Force cleanup before opening scanner
    stopAllVideoStreams();
    setTimeout(() => {
      openScanner("startShift");
    }, 500);
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift || activeCleaning) {
      console.log("[useDashboardQRScanner] Cannot end shift: No active shift or cleaning in progress");
      return;
    }
    console.log("[useDashboardQRScanner] Opening scanner for endShift");
    // Force cleanup before opening scanner
    stopAllVideoStreams();
    setTimeout(() => {
      openScanner("endShift");
    }, 500);
  };

  const handleStartCleaning = () => {
    if (!activeShift || activeCleaning) {
      console.log("[useDashboardQRScanner] Cannot start cleaning: No active shift or cleaning already in progress");
      return;
    }
    console.log("[useDashboardQRScanner] Opening scanner for startCleaning");
    // Force cleanup before opening scanner
    stopAllVideoStreams();
    setTimeout(() => {
      openScanner("startCleaning");
    }, 500);
  };

  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) {
      console.log("[useDashboardQRScanner] Cannot end cleaning: No active cleaning");
      return;
    }
    console.log("[useDashboardQRScanner] Opening scanner for endCleaning");
    // Force cleanup before opening scanner
    stopAllVideoStreams();
    
    // Use a longer delay for endCleaning and multiple cleanup steps
    setTimeout(() => {
      stopAllVideoStreams(); // Additional cleanup
      console.log("[useDashboardQRScanner] Additional cleanup before opening endCleaning scanner");
      
      setTimeout(() => {
        openScanner("endCleaning");
      }, 500);
    }, 800);
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    closeScanner,
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleStartCleaning,
    handleEndCleaningWithScan
  };
}
