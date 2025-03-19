
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
    console.log("Closing scanner for purpose:", scannerPurpose);
    // Force stop all camera streams before hiding the scanner UI
    stopAllVideoStreams();
    setShowQRScanner(false);
    
    // Reset processing state after a delay
    setTimeout(() => {
      processingRef.current = false;
    }, 500);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    console.log("Starting QR scanner for purpose:", purpose);
    // Reset processing state before opening scanner
    processingRef.current = false;
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log("Already processing a scan result, ignoring duplicate");
      return;
    }
    
    console.log(`QR code scanned successfully for purpose: ${scannerPurpose}, data: ${decodedText}`);
    processingRef.current = true;
    
    // Immediately stop all camera streams
    stopAllVideoStreams();
    
    // Hide scanner UI
    setShowQRScanner(false);
    
    // Add a small delay before processing the scan result
    // This ensures camera resources are fully released
    setTimeout(() => {
      try {
        console.log(`Processing scan result for purpose: ${scannerPurpose}`);
        
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
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
