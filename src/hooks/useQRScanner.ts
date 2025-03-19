
import { useState, useEffect, useCallback, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");
  const isOpeningRef = useRef(false);
  const openAttemptCount = useRef(0);

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      console.log("[useQRScanner] Camera resources released on scanner close");
      
      // Add a delay to ensure complete cleanup
      const cleanupTimer = setTimeout(() => {
        stopAllVideoStreams();
        console.log("[useQRScanner] Additional camera cleanup after close");
        openAttemptCount.current = 0; // Reset attempt counter when closed
      }, 800);
      
      return () => clearTimeout(cleanupTimer);
    }
  }, [showQRScanner]);

  // Clean up camera resources on component unmount
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("[useQRScanner] Camera resources released on unmount");
      
      // Double check cleanup after a delay
      setTimeout(() => {
        stopAllVideoStreams();
      }, 500);
    };
  }, []);

  const openScanner = useCallback((purpose: ScannerPurpose) => {
    // Prevent multiple open attempts in quick succession
    if (isOpeningRef.current) {
      console.log(`[useQRScanner] Scanner opening already in progress for ${purpose}, ignoring duplicate request`);
      return;
    }
    
    openAttemptCount.current += 1;
    isOpeningRef.current = true;
    
    // First ensure all camera resources are released
    stopAllVideoStreams();
    console.log(`[useQRScanner] Starting to open scanner for purpose: ${purpose} (attempt ${openAttemptCount.current})`);
    
    // Set the scanner purpose
    setScannerPurpose(purpose);
    
    // Different delay for different purposes, give more time for endCleaning
    const openDelay = purpose === "endCleaning" ? 1000 : 800;
    
    // Add a delay before showing the scanner to ensure clean state
    setTimeout(() => {
      if (purpose === "endCleaning") {
        console.log("[useQRScanner] Running additional cleanup for endCleaning purpose");
        stopAllVideoStreams();
      }
      
      setShowQRScanner(true);
      console.log(`[useQRScanner] Scanner opened for purpose: ${purpose}`);
      
      // Reset opening flag after a delay
      setTimeout(() => {
        isOpeningRef.current = false;
        console.log(`[useQRScanner] Scanner opening completed for: ${purpose}`);
      }, 1200);
    }, openDelay);
  }, []);

  const closeScanner = useCallback(() => {
    console.log(`[useQRScanner] Closing scanner for purpose: ${scannerPurpose}`);
    
    // Stop all video streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Hide the scanner UI
    setShowQRScanner(false);
    
    // Double-check that all camera resources are released after a delay
    setTimeout(() => {
      stopAllVideoStreams();
      console.log("[useQRScanner] Additional cleanup after scanner close");
      openAttemptCount.current = 0; // Reset attempt counter
    }, 800);
  }, [scannerPurpose]);

  return {
    showQRScanner,
    scannerPurpose,
    openScanner,
    closeScanner
  };
}
