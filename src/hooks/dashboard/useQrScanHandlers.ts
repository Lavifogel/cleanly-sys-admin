
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
  
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan,
    onEndShiftScan,
    onStartCleaningScan: (qrData: string) => {
      console.log("Starting cleaning with QR data:", qrData);
      onStartCleaningScan(qrData);
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
          onEndCleaningScan(qrData);
        } catch (error) {
          console.error("Error processing end cleaning scan:", error);
        }
        
        // Reset scan in progress after a delay
        cleanupTimeoutRef.current = setTimeout(() => {
          scanInProgressRef.current = false;
          cleanupTimeoutRef.current = null;
          console.log("End cleaning scan process complete, ready for new scans");
        }, 3000);
      }, 500);
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
    if (!showQRScanner) {
      // Delay resetting the scan in progress flag to prevent immediate rescans
      const resetTimer = setTimeout(() => {
        scanInProgressRef.current = false;
      }, 2000);
      
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
