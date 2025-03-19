
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
    closeScanner,
    isProcessingScan
  } = useQRScanner();
  
  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText, "for purpose:", scannerPurpose);
    
    // If already processing a scan, ignore
    if (isProcessingScan.current) {
      console.log("Already processing a scan, ignoring");
      return;
    }
    
    // Set processing flag
    isProcessingScan.current = true;
    
    // Close scanner first to release camera resources
    closeScanner();

    // Process based on scanner purpose
    setTimeout(() => {
      try {
        switch (scannerPurpose) {
          case "startShift":
            console.log("Processing startShift scan");
            startShift(decodedText);
            break;
          case "endShift":
            console.log("Processing endShift scan");
            endShift(true, decodedText);
            break;
          case "startCleaning":
            console.log("Processing startCleaning scan");
            startCleaning(decodedText);
            setActiveTab("cleaning");
            break;
          default:
            console.warn("Unknown scanner purpose:", scannerPurpose);
        }
      } catch (error) {
        console.error("Error handling QR scan:", error);
      }
      
      // Reset processing flag after a delay
      setTimeout(() => {
        isProcessingScan.current = false;
      }, 3000);
    }, 500);
  };
  
  // Handler functions for different QR scanning purposes
  const handleStartShift = () => {
    if (activeShift) return;
    console.log("Opening scanner for starting shift");
    openScanner("startShift");
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift || activeCleaning) return;
    console.log("Opening scanner for ending shift");
    openScanner("endShift");
  };

  const handleStartCleaning = () => {
    if (!activeShift || activeCleaning) return;
    console.log("Opening scanner to start cleaning");
    openScanner("startCleaning");
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    closeScanner,
    handleQRScan,
    handleStartShift,
    handleEndShiftWithScan,
    handleStartCleaning
  };
}
