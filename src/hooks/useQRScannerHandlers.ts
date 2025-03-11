
import { useToast } from "@/hooks/use-toast";

type ScanHandlerProps = {
  activeShift: any;
  activeCleaning: any;
  startShift: (qrData: string) => void;
  endShift: (withScan: boolean, qrData?: string) => void;
  startCleaning: (qrData: string) => void;
  prepareSummary: (withScan: boolean, qrData?: string) => void;
  openScanner: (purpose: string) => void;
  setActiveTab: (tab: string) => void;
  showConfirmationDialog: (title: string, description: string, action: () => void) => void;
};

export function useQRScannerHandlers({
  activeShift,
  activeCleaning,
  startShift,
  endShift,
  startCleaning,
  prepareSummary,
  openScanner,
  setActiveTab,
  showConfirmationDialog
}: ScanHandlerProps) {
  const { toast } = useToast();

  // Handle scanning QR code
  const handleQRScan = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

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

  // Handle starting a shift
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

  // Handle ending a shift
  const handleEndShift = (withScan = true) => {
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
        title: "Active Cleaning Detected",
        description: "Please finish your current cleaning before ending your shift.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Shift Without Scan",
        "Are you sure you want to end your shift without scanning? This action cannot be undone.",
        () => endShift(withScan)
      );
    } else {
      openScanner("endShift");
    }
  };

  // Handle starting a cleaning
  const handleStartCleaning = () => {
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description: "You need to start a shift before you can begin cleaning.",
        variant: "destructive",
      });
      return;
    }

    if (activeCleaning) {
      toast({
        title: "Cleaning Already Active",
        description: "You already have an active cleaning. Please finish it first.",
        variant: "destructive",
      });
      return;
    }

    openScanner("startCleaning");
  };

  // Handle ending a cleaning
  const handleEndCleaning = (withScan = true) => {
    if (!activeCleaning) {
      toast({
        title: "No Active Cleaning",
        description: "You don't have an active cleaning to end.",
        variant: "destructive",
      });
      return;
    }

    if (!withScan) {
      showConfirmationDialog(
        "End Cleaning Without Scan",
        "Are you sure you want to end this cleaning without scanning? This action cannot be undone.",
        () => prepareSummary(withScan)
      );
    } else {
      openScanner("endCleaning");
    }
  };

  return {
    handleQRScan,
    handleStartShift,
    handleEndShift,
    handleStartCleaning,
    handleEndCleaning
  };
}
