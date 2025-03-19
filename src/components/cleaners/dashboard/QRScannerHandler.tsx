
import { useEffect, useRef, useState } from "react";
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
  // Local state to properly handle scanner mount/unmount
  const [showScannerComponent, setShowScannerComponent] = useState(false);
  const scannerMounted = useRef(false);
  const prevShowQRScannerRef = useRef(showQRScanner);
  const closeTimeoutRef = useRef<number | null>(null);
  const processingQRScanRef = useRef(false);
  
  // Effect to manage scanner visibility changes
  useEffect(() => {
    // Handle when scanner opens
    if (showQRScanner && !prevShowQRScannerRef.current) {
      // Make sure we're starting fresh
      stopAllVideoStreams();
      processingQRScanRef.current = false;
      
      // Reset state before showing scanner
      console.log(`Preparing to open QR scanner for purpose: ${scannerPurpose}`);
      
      // Add delay to ensure clean mounting
      setTimeout(() => {
        if (showQRScanner) { // Double check scanner should still be shown
          scannerMounted.current = true;
          setShowScannerComponent(true);
          console.log(`QR scanner opened for purpose: ${scannerPurpose}`);
        }
      }, 200);
    } 
    // Handle when scanner closes
    else if (!showQRScanner && prevShowQRScannerRef.current) {
      // Ensure camera is released when QR scanner is closed
      if (scannerMounted.current) {
        // Immediately force stop all video streams
        stopAllVideoStreams();
        console.log("QR scanner closing, camera resources released");
        
        // Add a delay before removing the component to avoid conflicts
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
        
        closeTimeoutRef.current = window.setTimeout(() => {
          setShowScannerComponent(false);
          scannerMounted.current = false;
          processingQRScanRef.current = false;
          closeTimeoutRef.current = null;
          
          // Force stop streams again to ensure complete cleanup
          stopAllVideoStreams();
          console.log("QR scanner fully closed");
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

  // If the scanner is not shown, don't render anything
  if (!showQRScanner) return null;
  
  // If we're in the process of mounting/unmounting, show a loading state
  if (!showScannerComponent) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <p className="text-lg mb-2">Preparing camera...</p>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scan handling
    if (processingQRScanRef.current) {
      console.log("Already processing a QR scan, ignoring duplicate");
      return;
    }
    
    processingQRScanRef.current = true;
    console.log(`QR scan successful for purpose ${scannerPurpose}, data:`, decodedText);
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Allow a moment for cleanup before processing result
    setTimeout(() => {
      onQRScan(decodedText);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute top-4 right-4 z-[60]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            stopAllVideoStreams();
            closeScanner();
          }} 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <QRCodeScanner 
        onScanSuccess={handleScanSuccess}
        onClose={() => {
          // Ensure camera is stopped before closing
          stopAllVideoStreams();
          closeScanner();
        }}
      />
    </div>
  );
};

export default QRScannerHandler;
