
import { ScannerPurpose, useQRScanner } from "@/hooks/useQRScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";

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
  
  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned with purpose:", scannerPurpose, "data:", decodedText);
    
    // Close scanner before processing the result
    closeScanner();

    switch (scannerPurpose) {
      case "startShift":
        console.log("Starting shift with QR data:", decodedText);
        startShift(decodedText);
        break;
      case "endShift":
        console.log("Ending shift with QR data:", decodedText);
        endShift(true, decodedText);
        break;
      case "startCleaning":
        console.log("Starting cleaning with QR data:", decodedText);
        startCleaning(decodedText);
        setActiveTab("cleaning");
        break;
      case "endCleaning":
        console.log("Ending cleaning with QR data:", decodedText);
        prepareSummary(true, decodedText);
        break;
      default:
        console.warn("Unknown scanner purpose:", scannerPurpose);
        break;
    }
  };
  
  // Handler functions for different QR scanning purposes
  const handleStartShift = () => {
    if (activeShift) {
      console.log("Shift already active, cannot start new shift");
      return;
    }
    console.log("Opening scanner for startShift");
    openScanner("startShift");
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift || activeCleaning) {
      console.log("Cannot end shift: No active shift or cleaning in progress");
      return;
    }
    console.log("Opening scanner for endShift");
    openScanner("endShift");
  };

  const handleStartCleaning = () => {
    if (!activeShift || activeCleaning) {
      console.log("Cannot start cleaning: No active shift or cleaning already in progress");
      return;
    }
    console.log("Opening scanner for startCleaning");
    openScanner("startCleaning");
  };

  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) {
      console.log("Cannot end cleaning: No active cleaning");
      return;
    }
    console.log("Opening scanner for endCleaning");
    openScanner("endCleaning");
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
