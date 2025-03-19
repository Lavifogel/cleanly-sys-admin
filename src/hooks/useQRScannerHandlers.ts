
import { useState, useRef, useEffect } from "react";

// Importing ScannerPurpose from useQRScanner instead of qrScanner types
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface ScanHandlerProps {
  onStartShiftScan: (qrData: string) => void;
  onEndShiftScan: (qrData: string) => void;
  onStartCleaningScan: (qrData: string) => void;
  onEndCleaningScan: (qrData: string) => void;
  setActiveTab?: (tab: string) => void;
}

export function useQRScannerHandlers({
  onStartShiftScan,
  onEndShiftScan,
  onStartCleaningScan,
  onEndCleaningScan,
  setActiveTab
}: ScanHandlerProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<ScannerPurpose>('startShift');
  const processingQRCodeRef = useRef(false);
  const scanTimeoutRef = useRef<number | null>(null);
  
  const closeScanner = () => {
    console.log("Closing scanner");
    setShowQRScanner(false);
    stopAllVideoStreams();
    
    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    // Reset processing state after a delay
    scanTimeoutRef.current = window.setTimeout(() => {
      processingQRCodeRef.current = false;
      scanTimeoutRef.current = null;
      console.log("QR processing state reset");
    }, 1500);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    console.log(`Starting QR scanner for purpose: ${purpose}`);
    // Reset processing state when opening scanner
    processingQRCodeRef.current = false;
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate scan processing
    if (processingQRCodeRef.current) {
      console.log("Scan already being processed, ignoring duplicate");
      return;
    }
    
    console.log(`QR scan detected for purpose: ${scannerPurpose}, data: ${decodedText}`);
    processingQRCodeRef.current = true;
    
    try {
      switch (scannerPurpose) {
        case 'startShift':
          console.log("Processing startShift scan");
          onStartShiftScan(decodedText);
          break;
        case 'endShift':
          console.log("Processing endShift scan");
          onEndShiftScan(decodedText);
          break;
        case 'startCleaning':
          console.log("Processing startCleaning scan");
          onStartCleaningScan(decodedText);
          // Switch to cleaning tab after starting a cleaning
          if (setActiveTab) {
            setActiveTab('cleaning');
          }
          break;
        case 'endCleaning':
          console.log("Processing endCleaning scan");
          onEndCleaningScan(decodedText);
          break;
      }
    } catch (error) {
      console.error("Error processing QR scan:", error);
    } finally {
      // Close scanner AFTER processing the scan with a slight delay
      // to ensure the scan is fully processed
      window.setTimeout(() => {
        closeScanner();
      }, 300);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        window.clearTimeout(scanTimeoutRef.current);
      }
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
