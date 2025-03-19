
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { useQRScannerHandlers } from "@/hooks/useQRScannerHandlers";
import { useEffect, useRef } from "react";

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
  
  const qrScannerHandlers = useQRScannerHandlers({
    onStartShiftScan,
    onEndShiftScan,
    onStartCleaningScan: (qrData: string) => {
      console.log("Starting cleaning with QR data:", qrData);
      onStartCleaningScan(qrData);
    },
    onEndCleaningScan: (qrData: string) => {
      console.log("Ending cleaning with QR data:", qrData);
      if (scanInProgressRef.current) {
        console.log("Scan already in progress, ignoring");
        return;
      }
      
      scanInProgressRef.current = true;
      
      // Add a delay to ensure UI updates before processing
      setTimeout(() => {
        onEndCleaningScan(qrData);
        
        // Reset scan in progress after a delay
        setTimeout(() => {
          scanInProgressRef.current = false;
        }, 2000);
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
      setTimeout(() => {
        scanInProgressRef.current = false;
      }, 2000);
    }
  }, [showQRScanner]);
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
