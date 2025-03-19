
import { useState, useEffect } from "react";
import { stopAllVideoStreams } from "@/utils/qrScanner";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      console.log("Camera resources released from useQRScanner hook");
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
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };

  const closeScanner = () => {
    setShowQRScanner(false);
  };

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  };
}
