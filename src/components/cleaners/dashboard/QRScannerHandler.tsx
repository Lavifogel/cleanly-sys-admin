
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

  if (!showQRScanner) return null;

  return (
    <QRCodeScanner 
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
