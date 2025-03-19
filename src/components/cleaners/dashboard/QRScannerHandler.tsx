
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
  const closeTimeoutRef = useRef<number | null>(null);
  const processingQRRef = useRef(false);
  const lastProcessedCodeRef = useRef<string | null>(null);
  
  // Effect to manage scanner visibility changes
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      scannerMounted.current = true;
      processingQRRef.current = false;
      lastProcessedCodeRef.current = null;
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
      
      closeTimeoutRef.current = window.setTimeout(() => {
        scannerMounted.current = false;
        processingQRRef.current = false;
        lastProcessedCodeRef.current = null;
        closeTimeoutRef.current = null;
      }, 1000);
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

  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

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
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Special handling for endCleaning
    if (scannerPurpose === 'endCleaning') {
      console.log("Processing endCleaning scan");
      
      // Force a longer delay for endCleaning to ensure complete UI updates before processing
      setTimeout(() => {
        try {
          onQRScan(decodedText);
        } catch (error) {
          console.error("Error processing endCleaning scan:", error);
          processingQRRef.current = false;
        }
      }, 1000);
      
      return;
    }
    
    // Force a delay before processing the scan result for other scan types
    setTimeout(() => {
      try {
        onQRScan(decodedText);
      } catch (error) {
        console.error("Error processing scan:", error);
        processingQRRef.current = false;
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button variant="ghost" size="icon" onClick={closeScanner} className="bg-background/50 backdrop-blur-sm hover:bg-background/80">
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <QRCodeScanner 
        onScanSuccess={handleScanSuccess}
        onClose={() => {
          // Only allow closing if it's the initial scanner
          if (canClose) {
            // Ensure camera is stopped before closing
            stopAllVideoStreams();
            // Allow a moment for cleanup before closing
            setTimeout(() => {
              closeScanner();
            }, 500);
          }
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
