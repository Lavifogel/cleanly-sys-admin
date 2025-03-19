
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
  const scanProcessedRef = useRef(false);
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(
    // Wrap the success callback to ensure proper cleanup before callback
    (decodedText: string) => {
      if (scanProcessedRef.current) {
        console.log("Scan already processed, ignoring duplicate");
        return;
      }
      
      scanProcessedRef.current = true;
      console.log("QR scan successful, data:", decodedText);
      
      // Stop camera streams first and ensure complete cleanup
      stopAllVideoStreams();
      
      // Call the original success callback with a delay to ensure camera is fully stopped
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 600); // Increased delay for more thorough cleanup
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      stopAllVideoStreams();
      setTimeout(() => {
        onClose();
      }, 400); // Increased delay
    }
  );

  const { error, cameraActive } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessedRef.current = false;
    
    // Ensure the container exists in the DOM
    const ensureContainer = () => {
      const container = document.getElementById(scannerContainerId);
      if (!container) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = scannerContainerId;
        newContainer.className = 'absolute inset-0 z-10 flex items-center justify-center';
        document.body.appendChild(newContainer);
      }
    };
    
    // Ensure container exists before camera initialization
    ensureContainer();
    
    // Clean up on unmount
    return () => {
      console.log("QRCodeScanner component unmounting, cleaning up resources");
      scannerMountedRef.current = false;
      stopAllVideoStreams();
      
      // Delay before final cleanup
      setTimeout(() => {
        stopAllVideoStreams();
      }, 300);
    };
  }, [scannerContainerId]);

  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    // Prevent duplicate close attempts
    if (!scannerMountedRef.current) return;
    
    // Mark as unmounting to prevent further state updates
    scannerMountedRef.current = false;
    
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Slight delay to ensure cleanup completes before closing
    setTimeout(() => {
      handleClose();
    }, 400); // Increased delay for better cleanup
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={safeHandleClose}
            className="ml-auto"
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
