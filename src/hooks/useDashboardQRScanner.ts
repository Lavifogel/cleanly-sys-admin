
import { ScannerPurpose, useQRScanner } from "@/hooks/useQRScanner";
import { useShift } from "@/hooks/useShift";
import { useCleaning } from "@/hooks/useCleaning";
import { useToast } from "@/hooks/use-toast";

export function useDashboardQRScanner(
  activeShift: ReturnType<typeof useShift>["activeShift"],
  activeCleaning: ReturnType<typeof useCleaning>["activeCleaning"],
  setActiveTab: (tab: string) => void,
  startShift: (qrData: string) => void,
  endShift: (withScan: boolean, qrData?: string) => void,
  startCleaning: (qrData: string) => void,
  prepareSummary: (withScan: boolean, qrData?: string) => void
) {
  const { toast } = useToast();
  const {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  } = useQRScanner();
  
  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    
    // Validate QR code data
    if (!decodedText || decodedText.trim() === '') {
      toast({
        title: "Invalid QR Code",
        description: "The QR code could not be read or contained no data.",
        variant: "destructive",
      });
      return;
    }
    
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
  
  // Handler functions for different QR scanning purposes
  const handleStartShift = () => {
    if (activeShift) {
      toast({
        title: "Shift Already Active",
        description: "You already have an active shift.",
        variant: "destructive",
      });
      return;
    }
    openScanner("startShift");
  };

  const handleEndShiftWithScan = () => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You don't have an active shift to end.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeCleaning) {
      toast({
        title: "Active Cleaning",
        description: "Please end your current cleaning before ending your shift.",
        variant: "destructive",
      });
      return;
    }
    
    openScanner("endShift");
  };

  const handleStartCleaning = () => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You need to start a shift before starting a cleaning task.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeCleaning) {
      toast({
        title: "Cleaning Already Active",
        description: "Please end your current cleaning before starting a new one.",
        variant: "destructive",
      });
      return;
    }
    
    openScanner("startCleaning");
  };

  const handleEndCleaningWithScan = () => {
    if (!activeCleaning) {
      toast({
        title: "No Active Cleaning",
        description: "You don't have an active cleaning to end.",
        variant: "destructive",
      });
      return;
    }
    
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
