
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

interface EnhancedQRCodeScannerProps extends QRCodeScannerProps {
  title?: string;
}

const QRCodeScanner: React.FC<EnhancedQRCodeScannerProps> = ({ 
  onScanSuccess, 
  onClose,
  title = "Scan QR Code"
}) => {
  const scannerMountedRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const scanProcessingRef = useRef(false);
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(
    // Handle successful scan
    (decodedText: string) => {
      console.log("QRCodeScanner: Scan successful, data:", decodedText);
      
      // Prevent duplicate scan processing
      if (scanProcessingRef.current) {
        console.log("QRCodeScanner: Scan already being processed, ignoring duplicate");
        return;
      }
      
      scanProcessingRef.current = true;
      
      // Pass the data to the success callback without stopping the camera
      // The parent component is responsible for closing the scanner
      onScanSuccess(decodedText);
      
      // Reset the processing flag after a delay
      setTimeout(() => {
        scanProcessingRef.current = false;
      }, 2000);
    },
    onClose
  );

  const { error, cameraActive } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    console.log("QRCodeScanner: Component mounted");
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessingRef.current = false;
    
    return () => {
      console.log("QRCodeScanner: Component unmounting, cleaning up resources");
      // Set mounted ref to false to prevent any subsequent state updates
      scannerMountedRef.current = false;
      
      // Ensure any pending cleanup timeouts are cleared
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      // Add a small delay before final cleanup to avoid race conditions
      setTimeout(() => {
        // Stop all video streams on unmount
        stopAllVideoStreams();
      }, 200);
    };
  }, []);

  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    console.log("QRCodeScanner: Manually closing scanner");
    // Prevent duplicate close attempts
    if (!scannerMountedRef.current) return;
    
    // Mark as unmounting to prevent further state updates
    scannerMountedRef.current = false;
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Slight delay to ensure cleanup completes before closing
    setTimeout(() => {
      handleClose();
      // Also call the onClose prop to ensure parent components are notified
      onClose();
    }, 300);
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={safeHandleClose}
            className="ml-auto"
            aria-label="Close QR scanner"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Position the QR code within the frame
        </p>
        
        <QRScannerView 
          scannerContainerId={scannerContainerId} 
          scannerState={scannerState} 
        />
        
        {error && (
          <div className="mt-4 text-destructive text-center text-sm">
            {error}
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleManualSimulation}
              className="w-full"
            >
              Simulate Scan (Dev Only)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
