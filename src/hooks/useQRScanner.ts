
import { useState, useEffect, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export type ScannerPurpose = "startShift" | "endShift" | "startCleaning" | "endCleaning";

export function useQRScanner() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>("startShift");
  const isProcessingScan = useRef(false);
  const scannerClosedTimeRef = useRef(Date.now());

  // Effect to release camera resources when QR scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // When the scanner is closed, ensure camera is released
      stopAllVideoStreams();
      console.log("Camera resources released from useQRScanner hook");
      
      // Record time when scanner was closed
      scannerClosedTimeRef.current = Date.now();
      
      // Reset processing state after a longer delay to prevent immediate rescans
      setTimeout(() => {
        isProcessingScan.current = false;
        console.log("Reset processing state in useQRScanner");
      }, 2000);
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
    // Prevent rapid reopening of scanner
    const timeSinceLastClose = Date.now() - scannerClosedTimeRef.current;
    if (timeSinceLastClose < 1500) {
      console.log("Preventing rapid scanner reopen, waiting...");
      setTimeout(() => {
        openScannerImpl(purpose);
      }, 1500 - timeSinceLastClose);
      return;
    }
    
    openScannerImpl(purpose);
  };
  
  const openScannerImpl = (purpose: ScannerPurpose) => {
    // Reset processing state when opening scanner
    isProcessingScan.current = false;
    setScannerPurpose(purpose);
    console.log(`Opening scanner for purpose: ${purpose}`);
    setShowQRScanner(true);
  };

  const closeScanner = () => {
    console.log(`Closing scanner with purpose: ${scannerPurpose}`);
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
