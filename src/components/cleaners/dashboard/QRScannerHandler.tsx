
import { useEffect, useRef } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";
import { ScannerPurpose } from "@/hooks/useQRScanner";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Effect to manage scanner visibility changes and ensure camera starts
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      console.log("QR Scanner opening, stopping any existing camera streams");
      // First make sure any previous camera streams are fully stopped
      stopAllVideoStreams();
      
      // Show a message to the user that the scanner is opening
      toast({
        title: "Opening Scanner",
        description: "Please allow camera access if prompted",
        duration: 3000,
      });
      
      // Longer delay to ensure clean start
      setTimeout(() => {
        console.log("Setting scanner as mounted");
        scannerMounted.current = true;
        processingQRScanRef.current = false;
        console.log("QR scanner opened, camera should start now");
      }, 500);
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      console.log("QR Scanner closing, cleaning up resources");
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
        }, 500);
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
  }, [showQRScanner, toast]);

  // Additional cleanup when component unmounts
  useEffect(() => {
    return () => {
      stopAllVideoStreams();
      console.log("QRScannerHandler unmounting, final cleanup");
    };
  }, []);

  // Handle safe scanner close
  const handleSafeClose = () => {
    console.log("Safe close triggered, stopping camera first");
    // Ensure camera is stopped
    stopAllVideoStreams();
    
    // Short delay to ensure resources are released before closing
    setTimeout(() => {
      closeScanner();
    }, 500);
  };

  if (!showQRScanner) return null;

  // If 'startShift' and no active shift, show a close button
  const canClose = scannerPurpose === 'startShift' && !activeShift;

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scan handling
    if (processingQRScanRef.current) {
      console.log("Already processing a QR scan, ignoring duplicate");
      return;
    }
    
    processingQRScanRef.current = true;
    console.log("QR scan successful, data:", decodedText);
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Show success toast
    toast({
      title: "QR Code Scanned",
      description: "Processing scan result...",
      duration: 2000,
    });
    
    // Allow a moment for cleanup before processing result
    setTimeout(() => {
      onQRScan(decodedText);
      // Processing flag will be reset when the scanner is closed
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50">
      {canClose && (
        <div className="absolute top-4 right-4 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSafeClose} 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <QRCodeScanner 
        onScanSuccess={handleScanSuccess}
        onClose={handleSafeClose}
      />
    </div>
  );
};

export default QRScannerHandler;
