
import { useState, useEffect, useCallback, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");
  const isOpeningRef = useRef(false);

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      console.log("Camera resources released from useQRScanner hook");
      
      // Add a delay to ensure complete cleanup
      const cleanupTimer = setTimeout(() => {
        stopAllVideoStreams();
      }, 500);
      
      return () => clearTimeout(cleanupTimer);
    }
  }, [showQRScanner]);

  // Clean up camera resources on component unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("Camera resources released on component unmount");
      
      // Double check cleanup after a delay
      setTimeout(() => {
        stopAllVideoStreams();
      }, 300);
    };
  }, []);

  const openScanner = useCallback((purpose: ScannerPurpose) => {
    // Prevent multiple open attempts in quick succession
    if (isOpeningRef.current) {
      console.log("Scanner opening already in progress, ignoring duplicate request");
      return;
    }
    
    isOpeningRef.current = true;
    
    // First ensure all camera resources are released
    stopAllVideoStreams();
    
    // Set the scanner purpose
    setScannerPurpose(purpose);
    
    // Add a delay before showing the scanner to ensure clean state
    setTimeout(() => {
      setShowQRScanner(true);
      console.log(`Scanner opened for purpose: ${purpose}`);
      
      // Reset opening flag after a delay
      setTimeout(() => {
        isOpeningRef.current = false;
      }, 800);
    }, 600);
  }, []);

  const closeScanner = useCallback(() => {
    // Stop all video streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Hide the scanner UI
    setShowQRScanner(false);
    console.log("Scanner closed");
    
    // Double-check that all camera resources are released after a delay
    setTimeout(() => {
      stopAllVideoStreams();
    }, 500);
  }, []);

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  };
}
