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
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      console.log("Camera resources released from useQRScanner hook");
      
      // Reset processing state after a delay
      setTimeout(() => {
        isProcessingScan.current = false;
      }, 1000);
    }
  }, [showQRScanner]);

  // Also clean up on component unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("Camera resources released on component unmount");
    };
  }, []);

  const openScanner = (purpose: ScannerPurpose) => {
    // Reset processing state when opening scanner
    isProcessingScan.current = false;
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };

  const closeScanner = () => {
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
