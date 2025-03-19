
import { useState, useEffect, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");
  const isProcessingScan = useRef(false);

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      console.log("useQRScanner: Scanner closed, ensuring camera resources are released");
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      
      // Reset processing state after a delay
      setTimeout(() => {
        isProcessingScan.current = false;
        console.log("useQRScanner: Reset processing state after scanner closed");
      }, 1000);
    } else {
      console.log(`useQRScanner: QR Scanner opened with purpose: ${scannerPurpose}`);
    }
  }, [showQRScanner, scannerPurpose]);

  // Also clean up on component unmount
  useEffect(() => {
    return () => {
      console.log("useQRScanner: Component unmounting, releasing camera resources");
      stopAllVideoStreams();
    };
  }, []);

  const openScanner = (purpose: ScannerPurpose) => {
    console.log(`useQRScanner: Opening scanner with purpose: ${purpose}`);
    // Reset processing state when opening scanner
    isProcessingScan.current = false;
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };

  const closeScanner = () => {
    console.log("useQRScanner: Closing scanner");
    stopAllVideoStreams();
    setShowQRScanner(false);
  };

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner,
    isProcessingScan
  };
}
