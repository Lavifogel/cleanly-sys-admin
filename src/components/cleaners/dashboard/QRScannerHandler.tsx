
import { useEffect } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface QRScannerHandlerProps {
  showQRScanner: boolean;
  scannerPurpose: ScannerPurpose;
  closeScanner: () => void;
  onQRScan: (decodedText: string) => void;
}

const QRScannerHandler = ({
  showQRScanner,
  scannerPurpose,
  closeScanner,
  onQRScan
}: QRScannerHandlerProps) => {
  
  // Monitor when the QR scanner is closed and ensure camera is properly released
  useEffect(() => {
    if (!showQRScanner) {
      // Ensure any lingering video tracks are stopped
      stopAllVideoStreams();
      console.log("Camera resources released when QR scanner hidden");
    }
    
    // Also clean up when unmounting
    return () => {
      if (showQRScanner) {
        stopAllVideoStreams();
        console.log("Camera resources released when QR scanner component unmounted");
      }
    };
  }, [showQRScanner]);

  // Generate appropriate title based on scanner purpose
  const getScannerTitle = () => {
    switch (scannerPurpose) {
      case "startShift":
        return "Scan to Start Shift";
      case "endShift":
        return "Scan to End Shift";
      case "startCleaning":
        return "Scan to Start Cleaning";
      case "endCleaning":
        return "Scan to Complete Cleaning";
      default:
        return "Scan QR Code";
    }
  };

  if (!showQRScanner) return null;

  return (
    <QRCodeScanner 
      title={getScannerTitle()}
      onScanSuccess={(decodedText) => {
        onQRScan(decodedText);
        // Ensure camera is stopped after successful scan
        stopAllVideoStreams();
      }}
      onClose={() => {
        closeScanner();
        // Double-ensure camera is stopped
        stopAllVideoStreams();
      }}
    />
  );
};

export default QRScannerHandler;
