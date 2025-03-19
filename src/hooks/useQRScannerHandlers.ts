
import { useState, useRef, useEffect } from "react";

// Importing ScannerPurpose from useQRScanner
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
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedCodeRef = useRef<string | null>(null);
  
  // Effect to ensure camera resources are released when scanner is closed
  useEffect(() => {
    if (!showQRScanner) {
      // Forcefully stop all camera streams when scanner is closed
      stopAllVideoStreams();
      console.log("Camera resources released after scanner closed");
      
      // Add a small delay before allowing new scans to prevent multiple triggers
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      scanTimeoutRef.current = setTimeout(() => {
        processingQRCodeRef.current = false;
        lastProcessedCodeRef.current = null;
        console.log("Reset processing state after scanner closed");
        scanTimeoutRef.current = null;
      }, 3000); // Longer timeout to ensure complete cleanup
    }
    
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
    };
  }, [showQRScanner]);
  
  const closeScanner = () => {
    console.log("Closing scanner from useQRScannerHandlers");
    setShowQRScanner(false);
    
    // Explicitly release camera resources
    stopAllVideoStreams();
  };
  
  const handleQRScannerStart = (purpose: ScannerPurpose) => {
    // Prevent starting a new scan if we're still processing
    if (processingQRCodeRef.current) {
      console.log("Still processing previous scan, preventing new scan");
      return;
    }
    
    console.log(`Starting QR scanner with purpose: ${purpose}`);
    
    // Reset processing flag and last processed code before starting
    processingQRCodeRef.current = false;
    lastProcessedCodeRef.current = null;
    setScannerPurpose(purpose);
    setShowQRScanner(true);
  };
  
  const handleQRScan = (decodedText: string) => {
    // Prevent duplicate scan processing
    if (processingQRCodeRef.current) {
      console.log("Already processing a QR code, ignoring duplicate scan");
      return;
    }
    
    // Check if this is the same code we just processed
    if (lastProcessedCodeRef.current === decodedText) {
      console.log("Same QR code scanned again, ignoring");
      return;
    }
    
    console.log(`QR scan detected for purpose: ${scannerPurpose}`);
    processingQRCodeRef.current = true;
    lastProcessedCodeRef.current = decodedText;
    
    try {
      console.log(`Processing QR scan for purpose: ${scannerPurpose}, data: ${decodedText}`);
      
      // Don't close the scanner immediately - let the processing complete first
      // Use setTimeout to ensure UI updates before processing the scan
      setTimeout(() => {
        switch (scannerPurpose) {
          case 'startShift':
            onStartShiftScan(decodedText);
            closeScanner(); // Close after processing
            break;
          case 'endShift':
            onEndShiftScan(decodedText);
            closeScanner(); // Close after processing
            break;
          case 'startCleaning':
            onStartCleaningScan(decodedText);
            // Switch to cleaning tab after starting a cleaning
            if (setActiveTab) {
              setActiveTab('cleaning');
            }
            closeScanner(); // Close after processing
            break;
          case 'endCleaning':
            console.log("Calling onEndCleaningScan with data:", decodedText);
            onEndCleaningScan(decodedText);
            closeScanner(); // Close after processing
            break;
          default:
            console.warn("Unknown scanner purpose:", scannerPurpose);
            closeScanner(); // Close on unknown purpose
        }
        
        // Reset processing state after a delay to prevent multiple scans
        setTimeout(() => {
          processingQRCodeRef.current = false;
          console.log("Reset processing state after handling scan");
        }, 2000);
      }, 500);
    } catch (error) {
      console.error("Error processing QR scan:", error);
      // Reset processing state after error
      setTimeout(() => {
        processingQRCodeRef.current = false;
        lastProcessedCodeRef.current = null;
        closeScanner(); // Close on error
      }, 2000);
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
