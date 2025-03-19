
import { useState, useRef } from "react";

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
  
  const closeScanner = () => {
    setShowQRScanner(false);
    stopAllVideoStreams();
    setTimeout(() => {
      processingQRCodeRef.current = false;
    }, 1000);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate scan processing
    if (processingQRCodeRef.current) {
      console.log("Already processing a QR code, ignoring duplicate scan");
      return;
    }
    
    processingQRCodeRef.current = true;
    
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
    } finally {
      // Close scanner AFTER processing the scan
      closeScanner();
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
