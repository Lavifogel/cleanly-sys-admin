
import { useState, useEffect, useCallback } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

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

  // Clean up camera resources on component unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("Camera resources released on component unmount");
    };
  }, []);

  const openScanner = useCallback((purpose: ScannerPurpose) => {
    // First ensure all camera resources are released
    stopAllVideoStreams();
    
    // Set the scanner purpose
    setScannerPurpose(purpose);
    
    // Add a small delay before showing the scanner to ensure clean state
    setTimeout(() => {
      setShowQRScanner(true);
      console.log(`Scanner opened for purpose: ${purpose}`);
    }, 300);
  }, []);

  const closeScanner = useCallback(() => {
    // Stop all video streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Hide the scanner UI
    setShowQRScanner(false);
    
    // Double-check that all camera resources are released after a delay
    setTimeout(() => {
      stopAllVideoStreams();
    }, 300);
  }, []);

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  };
}
