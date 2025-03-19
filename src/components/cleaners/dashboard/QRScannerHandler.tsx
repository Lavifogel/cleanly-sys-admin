
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
  const processingQRScanRef = useRef(false);
  
  // Effect to manage scanner visibility changes and resource cleanup
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      console.log(`[QRScannerHandler] QR scanner opened for purpose: ${scannerPurpose}`);
      scannerMounted.current = true;
      processingQRScanRef.current = false;
      
      // Force stop any existing camera resources
      stopAllVideoStreams();
      
      // Special handling for endCleaning
      if (scannerPurpose === "endCleaning") {
        console.log("[QRScannerHandler] Special initialization for endCleaning purpose");
        // Additional cleanup after a delay
        setTimeout(() => {
          stopAllVideoStreams();
        }, 500);
      }
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      // Ensure camera is released when QR scanner is closed
      stopAllVideoStreams();
      console.log("[QRScannerHandler] QR scanner closed, resources released");
      
      // Add delay to ensure complete cleanup
      setTimeout(() => {
        stopAllVideoStreams();
        scannerMounted.current = false;
        processingQRScanRef.current = false;
      }, 800);
    }
    
    // Update previous state reference
    prevShowQRScannerRef.current = showQRScanner;
    
    // Clean up when component unmounts
    return () => {
      stopAllVideoStreams();
      console.log("[QRScannerHandler] QR scanner handler unmounted, resources cleaned up");
    };
  }, [showQRScanner, scannerPurpose]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
    };
  }, []);

  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scan handling
    if (processingQRScanRef.current) {
      console.log("[QRScannerHandler] Already processing a QR scan, ignoring duplicate");
      return;
    }
    
    processingQRScanRef.current = true;
    console.log("[QRScannerHandler] QR scan successful, purpose:", scannerPurpose, "data:", decodedText);
    
    // First stop all camera streams BEFORE processing the result
    stopAllVideoStreams();
    
    // Call the scan handler with a delay to ensure camera cleanup completes first
    setTimeout(() => {
      onQRScan(decodedText);
    }, 1000); // Increased delay for more thorough cleanup
  };

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              stopAllVideoStreams();
              setTimeout(closeScanner, 500);
            }} 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
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
            }, 800);
          }
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
