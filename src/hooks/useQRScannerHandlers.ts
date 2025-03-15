
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
          // Navigate to cleaning page after starting a cleaning
          navigate('/cleaners/cleaning');
          break;
        case 'endCleaning':
          onEndCleaningScan(decodedText);
          break;
      }
    } catch (error) {
      console.error("Error processing QR scan:", error);
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
