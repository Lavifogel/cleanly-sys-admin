
import { useState } from "react";
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
  
  const closeScanner = () => {
    setShowQRScanner(false);
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };
  
  const handleQRScan = (decodedText: string) => {
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
    }
  };

  // Create the handler functions for the parent components to use
  const handleStartShift = () => {
    handleQRScannerStart('startShift');
  };
  
  const handleEndShiftWithScan = () => {
    handleQRScannerStart('endShift');
  };
  
  const handleStartCleaning = () => {
    handleQRScannerStart('startCleaning');
  };
  
  const handleEndCleaningWithScan = () => {
    handleQRScannerStart('endCleaning');
  };
  
  return {
    showQRScanner,
    scannerPurpose,
    handleQRScan,
    handleQRScannerStart,
    closeScanner,
    handleStartShift,
    handleEndShiftWithScan,
    handleStartCleaning,
    handleEndCleaningWithScan
  };
}
