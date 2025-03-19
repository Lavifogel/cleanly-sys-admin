
import { useState, useRef } from "react";
import { stopAllVideoStreams } from "@/utils/qrScanner";

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
  const closeTimeoutRef = useRef<number | null>(null);
  
  const closeScanner = () => {
    console.log("Closing QR scanner in useQRScannerHandlers");
    
    // Prevent multiple close attempts
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Force stop all camera streams before hiding the scanner UI
    stopAllVideoStreams();
    
    // Set the scanner state to hidden
    setShowQRScanner(false);
    
    // Double-check camera is fully stopped after a delay
    closeTimeoutRef.current = window.setTimeout(() => {
      stopAllVideoStreams();
      
      // Reset processing state after a delay
      setTimeout(() => {
        processingRef.current = false;
        closeTimeoutRef.current = null;
      }, 200);
    }, 200);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    console.log(`Starting QR scanner for purpose: ${purpose}`);
    processingRef.current = false;
    setScannerPurpose(purpose);
    
    // Ensure any existing camera is fully closed before opening scanner
    stopAllVideoStreams();
    
    // Clear any pending close operations
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Add small delay before showing scanner to ensure clean start
    setTimeout(() => {
      setShowQRScanner(true);
    }, 200);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("Already processing a scan result, ignoring duplicate");
      return;
    }
    
    processingRef.current = true;
    console.log(`QR scanned for purpose: ${scannerPurpose}, data: ${decodedText}`);
    
    // Immediately stop all camera streams
    stopAllVideoStreams();
    
    // Hide scanner UI
    setShowQRScanner(false);
    
    // Add a delay before processing the scan result
    // This ensures camera resources are fully released
    setTimeout(() => {
      try {
        // Force stop camera streams again to ensure complete cleanup
        stopAllVideoStreams();
        
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
      } finally {
        // Final camera cleanup
        stopAllVideoStreams();
        
        // Reset processing flag
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    }, 300);
  };
  
  // Clean up on unmount
  const cleanup = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    stopAllVideoStreams();
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner,
    cleanup
  };
}
