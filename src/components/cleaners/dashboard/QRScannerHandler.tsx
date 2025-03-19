
import { useEffect, useRef } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QRScannerHandlerProps {
  showQRScanner: boolean;
  scannerPurpose: ScannerPurpose;
  closeScanner: () => void;
  onQRScan: (decodedText: string) => void;
  activeShift?: boolean;
}

const QRScannerHandler = ({
  showQRScanner,
  scannerPurpose,
  closeScanner,
  onQRScan,
  activeShift = false
}: QRScannerHandlerProps) => {
  const scannerMounted = useRef(false);
  const prevShowQRScannerRef = useRef(showQRScanner);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingQRRef = useRef(false);
  const lastProcessedCodeRef = useRef<string | null>(null);
  const mountTimeRef = useRef(0);
  
  // Effect to manage scanner visibility changes
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      scannerMounted.current = true;
      processingQRRef.current = false;
      lastProcessedCodeRef.current = null;
      mountTimeRef.current = Date.now();
      console.log("QR scanner opened for purpose:", scannerPurpose);
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      // Ensure camera is released when QR scanner is closed
      stopAllVideoStreams();
      console.log("QR scanner closed, camera resources released");
      
      // Add a delay before setting scannerMounted to false to avoid conflicts
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      
      closeTimeoutRef.current = setTimeout(() => {
        scannerMounted.current = false;
        processingQRRef.current = false;
        lastProcessedCodeRef.current = null;
        closeTimeoutRef.current = null;
      }, 2000);
    }
    
    // Update previous state reference
    prevShowQRScannerRef.current = showQRScanner;
    
    // Clean up on component unmount
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      
      if (scannerMounted.current) {
        stopAllVideoStreams();
        scannerMounted.current = false;
        processingQRRef.current = false;
        console.log("QR scanner handler unmounted, resources cleaned up");
      }
    };
  }, [showQRScanner, scannerPurpose]);

  // Early exit if scanner should not be shown
  if (!showQRScanner) return null;

  // Prevent scanner from being closed too soon after opening
  const canClose = Date.now() - mountTimeRef.current > 2000;

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate processing
    if (processingQRRef.current) {
      console.log("Already processing a QR code, ignoring duplicate scan");
      return;
    }
    
    // Check if this is the same code we just processed
    if (lastProcessedCodeRef.current === decodedText) {
      console.log("Same QR code scanned again, ignoring");
      return;
    }
    
    processingQRRef.current = true;
    lastProcessedCodeRef.current = decodedText;
    console.log("QR scan successful with purpose:", scannerPurpose, "data:", decodedText);
    
    // Special handling for cleaning-related scans
    const isCleaning = scannerPurpose === 'startCleaning' || scannerPurpose === 'endCleaning';
    const processingDelay = isCleaning ? 800 : 500;
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Force a delay before processing the scan result
    setTimeout(() => {
      try {
        console.log(`Processing ${scannerPurpose} scan result:`, decodedText);
        onQRScan(decodedText);
      } catch (error) {
        console.error(`Error processing ${scannerPurpose} scan:`, error);
        processingQRRef.current = false;
      }
    }, processingDelay);
  };

  const handleCloseScanner = () => {
    // Don't allow closing the scanner too soon after opening
    if (!canClose) {
      console.log("Cannot close scanner yet, too soon after opening");
      return;
    }
    
    // Stop all camera streams first
    stopAllVideoStreams();
    
    // Add a slight delay to ensure cleanup completes before triggering the close action
    setTimeout(() => {
      closeScanner();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCloseScanner} 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
            aria-label="Close QR scanner"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <QRCodeScanner 
        onScanSuccess={handleScanSuccess}
        onClose={handleCloseScanner}
      />
    </div>
  );
};

export default QRScannerHandler;
