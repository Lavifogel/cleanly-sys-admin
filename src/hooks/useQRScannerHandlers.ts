
import { useState, useRef } from "react";

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
    setShowQRScanner(false);
    setTimeout(() => {
      processingRef.current = false;
    }, 500);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
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
    
    processingRef.current = true;
    setShowQRScanner(false);
    
    try {
      console.log(`QR scanned for purpose: ${scannerPurpose}, data: ${decodedText}`);
      
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
      processingRef.current = false;
    }
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner
  };
}
