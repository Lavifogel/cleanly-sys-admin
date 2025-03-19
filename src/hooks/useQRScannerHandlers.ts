
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
      // Stop all camera streams immediately to prevent multiple scan attempts
      stopAllVideoStreams();
      
      // Process after a slight delay to ensure clean camera shutdown
      setTimeout(() => {
        if (scannerPurpose === 'startShift') {
          console.log("Processing startShift scan");
          onStartShiftScan(decodedText);
        } else if (scannerPurpose === 'endShift') {
          console.log("Processing endShift scan");
          onEndShiftScan(decodedText);
        } else if (scannerPurpose === 'startCleaning') {
          console.log("Processing startCleaning scan");
          onStartCleaningScan(decodedText);
          // Switch to cleaning tab after starting a cleaning
          if (setActiveTab) {
            setActiveTab('cleaning');
          }
        } else if (scannerPurpose === 'endCleaning') {
          console.log("Processing endCleaning scan with data:", decodedText);
          onEndCleaningScan(decodedText);
        }
        
        // Close scanner AFTER processing the scan
        closeScanner();
      }, 300);
    } catch (error) {
      console.error("Error processing QR scan:", error);
      closeScanner();
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
