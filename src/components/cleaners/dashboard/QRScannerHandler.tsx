
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
  const processingQRScanRef = useRef(false);
  
  // Effect to manage scanner visibility changes
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      // First ensure that any existing camera is fully stopped before starting a new one
      stopAllVideoStreams();
      
      // Small delay before mounting scanner to ensure clean camera state
      setTimeout(() => {
        if (!scannerMounted.current) {
          scannerMounted.current = true;
          processingQRScanRef.current = false;
          console.log(`QR scanner opened for purpose: ${scannerPurpose}`);
        }
      }, 100);
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      // Ensure camera is released when QR scanner is closed
      if (scannerMounted.current) {
        // Immediately force stop all video streams
        stopAllVideoStreams();
        console.log("QR scanner closed, camera resources released");
        
        // Add a delay before setting scannerMounted to false to avoid conflicts
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        
        closeTimeoutRef.current = window.setTimeout(() => {
          scannerMounted.current = false;
          processingQRScanRef.current = false;
          closeTimeoutRef.current = null;
          
          // Force stop streams again to ensure complete cleanup
          stopAllVideoStreams();
        }, 300);
      }
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
        console.log("QR scanner handler unmounted, resources cleaned up");
      }
    };
  }, [showQRScanner, scannerPurpose]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("QRScannerHandler unmounting, final cleanup");
    };
  }, []);

  if (!showQRScanner) return null;

  // Always allow the scanner to be closed with the X button
  const canClose = true;

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scan handling
    if (processingQRScanRef.current) {
      console.log("Already processing a QR scan, ignoring duplicate");
      return;
    }
    
    processingQRScanRef.current = true;
    console.log("QR scan successful, data:", decodedText);
    
    // First stop all camera streams BEFORE processing the result
    stopAllVideoStreams();
    
    // Delay processing to ensure camera cleanup completes first
    setTimeout(() => {
      onQRScan(decodedText);
      // Processing flag will be reset when the scanner is closed
    }, 300);
  };

  const handleClose = () => {
    // Stop camera streams first
    stopAllVideoStreams();
    console.log("Close button clicked, stopping camera streams");
    
    // Log to help identify if this close handler is being called
    console.log("QRScannerHandler: handleClose called, scannerPurpose:", scannerPurpose);
    
    // Set the scanner as unmounted immediately to prevent race conditions
    scannerMounted.current = false;
    
    // Then close the scanner with a delay to ensure proper cleanup
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
            onClick={handleClose} 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
            data-testid="handler-close-button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      {scannerMounted.current && (
        <QRCodeScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => {
            console.log("QRCodeScanner onClose callback triggered");
            // Ensure camera is stopped before closing
            stopAllVideoStreams();
            // Allow a moment for cleanup before closing
            setTimeout(() => {
              closeScanner();
            }, 300);
          }}
        />
      )}
    </div>
  );
};

export default QRScannerHandler;
