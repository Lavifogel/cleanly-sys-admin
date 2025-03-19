
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerMountedRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const scanProcessingRef = useRef(false);
  const mountTimeRef = useRef(Date.now());
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(
    // Wrap the success callback to ensure proper cleanup before callback
    (decodedText: string) => {
      // Prevent duplicate scan processing
      if (scanProcessingRef.current) {
        console.log("Scan already being processed, ignoring duplicate");
        return;
      }
      
      scanProcessingRef.current = true;
      console.log("QR scan successful, data:", decodedText);
      
      // Stop all video streams before processing result
      stopAllVideoStreams();
      
      // Call the original success callback with a slight delay
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 700);
    },
    onClose
  );

  const { error, cameraActive } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessingRef.current = false;
    mountTimeRef.current = Date.now();
    
    // Add a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (scannerMountedRef.current) {
        console.log("QR scanner mounted, camera active:", cameraActive);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      
      console.log("QRCodeScanner component unmounting, cleaning up resources");
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

  // Prevent scanner from being closed too soon after opening
  const canClose = Date.now() - mountTimeRef.current > 2000;

  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    // Prevent duplicate close attempts
    if (!scannerMountedRef.current) return;
    
    // Don't allow closing the scanner too soon after opening
    if (!canClose) {
      console.log("Cannot close scanner yet, too soon after opening");
      return;
    }
    
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
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          {canClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={safeHandleClose}
              className="ml-auto"
              aria-label="Close QR scanner"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
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
