
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { useQRScannerHandlers } from "@/hooks/useQRScannerHandlers";
import { useEffect, useRef, useState } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

export function useQrScanHandlers({
  onStartShiftScan,
  onEndShiftScan,
  onStartCleaningScan,
  onEndCleaningScan,
  setActiveTab
}: {
  onStartShiftScan: (qrData: string) => void;
  onEndShiftScan: (qrData: string) => void;
  onStartCleaningScan: (qrData: string) => void;
  onEndCleaningScan: (qrData: string) => void;
  setActiveTab: (tab: string) => void;
}) {
  const scanInProgressRef = useRef(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanPurposeRef = useRef<ScannerPurpose | null>(null);
  
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan,
    onEndShiftScan,
    onStartCleaningScan: (qrData: string) => {
      console.log("Starting cleaning with QR data:", qrData);
      
      // Prevent multiple rapid scans
      const now = Date.now();
      if (now - lastScanTime < 3000) {
        console.log("Ignoring scan - too soon after previous scan");
        return;
      }
      setLastScanTime(now);
      
      if (scanInProgressRef.current) {
        console.log("Scan already in progress, ignoring duplicate");
        return;
      }
      
      scanInProgressRef.current = true;
      scanPurposeRef.current = "startCleaning";
      
      // Make sure camera is fully stopped before proceeding
      stopAllVideoStreams();
      
      // Add a delay to ensure UI updates before processing
      setTimeout(() => {
        try {
          onStartCleaningScan(qrData);
        } catch (error) {
          console.error("Error processing start cleaning scan:", error);
        }
        
        // Reset scan in progress after a delay
        cleanupTimeoutRef.current = setTimeout(() => {
          scanInProgressRef.current = false;
          scanPurposeRef.current = null;
          cleanupTimeoutRef.current = null;
          console.log("Start cleaning scan process complete, ready for new scans");
        }, 3000);
      }, 700);
    },
    onEndCleaningScan: (qrData: string) => {
      console.log("Ending cleaning with QR data:", qrData);
      
      // Prevent multiple rapid scans
      const now = Date.now();
      if (now - lastScanTime < 3000) {
        console.log("Ignoring scan - too soon after previous scan");
        return;
      }
      setLastScanTime(now);
      
      if (scanInProgressRef.current) {
        console.log("Scan already in progress, ignoring duplicate");
        return;
      }
      
      scanInProgressRef.current = true;
      scanPurposeRef.current = "endCleaning";
      
      // Make sure camera is fully stopped before proceeding
      stopAllVideoStreams();
      
      // Clear any existing cleanup timeout
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      // Add a delay to ensure UI updates before processing
      setTimeout(() => {
        try {
          console.log("Calling onEndCleaningScan with data:", qrData);
          onEndCleaningScan(qrData);
        } catch (error) {
          console.error("Error processing end cleaning scan:", error);
        }
        
        // Reset scan in progress after a delay
        cleanupTimeoutRef.current = setTimeout(() => {
          scanInProgressRef.current = false;
          scanPurposeRef.current = null;
          cleanupTimeoutRef.current = null;
          console.log("End cleaning scan process complete, ready for new scans");
        }, 3000);
      }, 700);
    },
    setActiveTab
  });

  const {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  } = qrScannerHandlers;
  
  // Reset scan in progress when scanner is closed
  useEffect(() => {
    if (!showQRScanner && scanInProgressRef.current) {
      console.log("Scanner closed while scan in progress, ensuring cleanup");
      
      // Delay resetting the scan in progress flag to prevent immediate rescans
      const resetTimer = setTimeout(() => {
        scanInProgressRef.current = false;
        scanPurposeRef.current = null;
        console.log("Reset scan in progress after scanner closed");
      }, 3000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [showQRScanner]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      // Ensure all camera resources are released
      stopAllVideoStreams();
    };
  }, []);
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
