
import { useState, useRef } from "react";
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
  
  const closeScanner = () => {
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
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    processingRef.current = false;
    setScannerPurpose(purpose);
    
    // Ensure any existing camera is fully closed before opening scanner
    stopAllVideoStreams();
    
    // Add small delay before showing scanner
    setTimeout(() => {
      setShowQRScanner(true);
    }, 100);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("Already processing a scan result, ignoring duplicate");
      return;
    }
    
    processingRef.current = true;
    
    // Immediately stop all camera streams
    stopAllVideoStreams();
    
    // Hide scanner UI
    setShowQRScanner(false);
    
    // Add a larger delay before processing the scan result
    // This ensures camera resources are fully released
    setTimeout(() => {
      try {
        console.log(`QR scanned for purpose: ${scannerPurpose}, data: ${decodedText}`);
        
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
        }, 500);
      }
    }, 500);
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
