
import { useState, useRef, useEffect } from "react";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

// Importing ScannerPurpose from useQRScanner instead of qrScanner types
import { ScannerPurpose } from "@/hooks/useQRScanner";

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
  const processingRef = useRef(false);
  const scannerTimeoutRef = useRef<number | null>(null);
  
  // Reset processing flag when scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      console.log("Scanner closed, resetting processing flag");
      processingRef.current = false;
    }
  }, [showQRScanner]);
  
  const closeScanner = () => {
    console.log(`Closing scanner with purpose: ${scannerPurpose}`);
    
    // Force stop all camera streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Hide scanner immediately
    setShowQRScanner(false);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    console.log(`Starting QR scanner for purpose: ${purpose}`);
    
    // Clear any existing timeouts
    if (scannerTimeoutRef.current) {
      clearTimeout(scannerTimeoutRef.current);
      scannerTimeoutRef.current = null;
    }
    
    // Reset processing flag explicitly
    processingRef.current = false;
    
    // First make sure any existing scanner is fully closed
    if (showQRScanner) {
      stopAllVideoStreams();
      setShowQRScanner(false);
      
      // Short delay to ensure resources are released before opening a new scanner
      scannerTimeoutRef.current = window.setTimeout(() => {
        setScannerPurpose(purpose);
        setShowQRScanner(true);
        scannerTimeoutRef.current = null;
      }, 500);
    } else {
      // If no scanner is currently open, just open a new one
      setScannerPurpose(purpose);
      
      // Small delay to ensure clean state
      scannerTimeoutRef.current = window.setTimeout(() => {
        setShowQRScanner(true);
        scannerTimeoutRef.current = null;
      }, 100);
    }
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("Already processing a scan result, ignoring duplicate");
      return;
    }
    
    processingRef.current = true;
    
    // Log the purpose and data for debugging
    console.log(`Processing QR scan for purpose: ${scannerPurpose}, data: ${decodedText}`);
    
    // Immediately stop all camera streams
    stopAllVideoStreams();
    
    // Hide scanner UI
    setShowQRScanner(false);
    
    // Add a small delay before processing the scan result
    // This ensures camera resources are fully released
    setTimeout(() => {
      try {
        console.log(`Executing handler for purpose: ${scannerPurpose}`);
        
        switch (scannerPurpose) {
          case 'startShift':
            onStartShiftScan(decodedText);
            break;
          case 'endShift':
            onEndShiftScan(decodedText);
            break;
          case 'startCleaning':
            onStartCleaningScan(decodedText);
            // Switch to cleaning tab after starting a cleaning
            if (setActiveTab) {
              setActiveTab('cleaning');
            }
            break;
          case 'endCleaning':
            onEndCleaningScan(decodedText);
            break;
        }
      } catch (error) {
        console.error("Error processing QR scan:", error);
      }
    }, 300);
  };

  // Clean up on unmount
  const cleanup = () => {
    if (scannerTimeoutRef.current) {
      clearTimeout(scannerTimeoutRef.current);
      scannerTimeoutRef.current = null;
    }
    stopAllVideoStreams();
  };
  
  // Explicitly clean up on unmount
  useEffect(() => {
    return cleanup;
  }, []);
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner,
    cleanup
  };
}
