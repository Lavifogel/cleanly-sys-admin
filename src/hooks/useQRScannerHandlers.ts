
import { useState, useRef, useCallback } from "react";
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
  
  const closeScanner = useCallback(() => {
    // Force stop all camera streams before hiding the scanner UI
    stopAllVideoStreams();
    setShowQRScanner(false);
    
    // Double-check camera is fully stopped after a delay
    setTimeout(() => {
      stopAllVideoStreams();
      
      // Reset processing state after a delay
      setTimeout(() => {
        processingRef.current = false;
      }, 300);
    }, 200);
  }, []);
  
  const handleQRScannerStart = useCallback((purpose: ScannerPurpose) => {
    // Reset processing state
    processingRef.current = false;
    setScannerPurpose(purpose);
    
    // Ensure any existing camera is fully closed before opening scanner
    stopAllVideoStreams();
    
    // Add small delay before showing scanner to ensure previous resources are released
    setTimeout(() => {
      setShowQRScanner(true);
    }, 300);
  }, []);
  
  const handleQRScan = useCallback((decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("Already processing a scan result, ignoring duplicate");
      return;
    }
    
    processingRef.current = true;
    console.log(`Processing QR scan for purpose: ${scannerPurpose}, data: ${decodedText}`);
    
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
            console.log("Calling endCleaning handler with data:", decodedText);
            onEndCleaningScan(decodedText);
            break;
          default:
            console.log("Unknown scanner purpose:", scannerPurpose);
            break;
        }
      } catch (error) {
        console.error("Error processing QR scan:", error);
      } finally {
        // Final camera cleanup
        stopAllVideoStreams();
        
        // Reset processing flag with a delay
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    }, 500);
  }, [scannerPurpose, onStartShiftScan, onEndShiftScan, onStartCleaningScan, onEndCleaningScan, setActiveTab]);
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
