
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
  
  // Effect to manage scanner visibility changes
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      scannerMounted.current = true;
      processingQRRef.current = false;
      console.log("QR scanner opened");
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      // Ensure camera is released when QR scanner is closed
      if (scannerMounted.current) {
        stopAllVideoStreams();
        console.log("QR scanner closed, camera resources released");
        
        // Add a delay before setting scannerMounted to false to avoid conflicts
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        
        closeTimeoutRef.current = window.setTimeout(() => {
          scannerMounted.current = false;
          processingQRRef.current = false;
          closeTimeoutRef.current = null;
        }, 800); // Increased timeout to ensure complete cleanup
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
        processingQRRef.current = false;
        console.log("QR scanner handler unmounted, resources cleaned up");
      }
    };
  }, [showQRScanner]);

  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

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
        onScanSuccess={(decodedText) => {
          if (processingQRRef.current) {
            console.log("Already processing a QR code, ignoring duplicate scan");
            return;
          }
          
          processingQRRef.current = true;
          console.log("QR scan successful, data:", decodedText);
          
          // First stop all camera streams
          stopAllVideoStreams();
          
          // Allow a moment for cleanup before processing result
          setTimeout(() => {
            onQRScan(decodedText);
          }, 500); // Increased delay for more reliable processing
        }}
        onClose={() => {
          // Only allow closing if it's the initial scanner
          if (canClose) {
            // Ensure camera is stopped before closing
            stopAllVideoStreams();
            // Allow a moment for cleanup before closing
            setTimeout(() => {
              closeScanner();
            }, 500); // Increased delay for more reliable closing
          }
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
