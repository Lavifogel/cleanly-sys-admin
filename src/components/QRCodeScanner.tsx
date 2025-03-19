
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/qrScanner/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerMountedRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const scanProcessedRef = useRef(false);
  const startAttemptedRef = useRef(false);
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation,
    startScanner,
    stopCamera
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
      stopCamera();
      
      // Call the original success callback with a delay to ensure camera is fully stopped
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 300);
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      stopAllVideoStreams();
      stopCamera();
      onClose();
    }
  );

  const { error, cameraActive, isScanning } = scannerState;
  
  // Component mount effect - explicitly start camera
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessedRef.current = false;
    
    // Initial camera cleanup to ensure fresh start
    stopAllVideoStreams();
    
    // Initial camera start with increased delay
    const timer = setTimeout(() => {
      if (scannerMountedRef.current && !startAttemptedRef.current) {
        console.log("QR scanner mounted, explicitly starting camera (initial)...");
        startAttemptedRef.current = true;
        startScanner();
        
        // Add a backup timer in case the first attempt fails
        setTimeout(() => {
          if (scannerMountedRef.current && !cameraActive && !scanProcessedRef.current) {
            console.log("Camera not active after initial start, trying again...");
            startScanner();
          }
        }, 1200);
      }
    }, 500); // Delay for better reliability
    
    return () => {
      clearTimeout(timer);
      
      console.log("QRCodeScanner component unmounting, cleaning up resources");
      scannerMountedRef.current = false;
      
      // Ensure any pending cleanup timeouts are cleared
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      // Force stop all camera streams
      stopCamera();
      stopAllVideoStreams();
    };
  }, [startScanner, stopCamera, cameraActive]);
  
  // Add a separate effect to monitor camera state and retry if needed
  useEffect(() => {
    if (scannerMountedRef.current && !cameraActive && startAttemptedRef.current && !scanProcessedRef.current) {
      // Camera should be active but isn't, try to restart
      const retryTimer = setTimeout(() => {
        if (scannerMountedRef.current && !cameraActive && !scanProcessedRef.current) {
          console.log("Camera still not active, retrying camera start...");
          startScanner();
        }
      }, 1500);
      
      return () => clearTimeout(retryTimer);
    }
  }, [cameraActive, startScanner]);

  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    // Prevent duplicate close attempts
    if (!scannerMountedRef.current) return;
    
    // Mark as unmounting to prevent further state updates
    scannerMountedRef.current = false;
    
    // First stop all camera streams
    stopCamera();
    stopAllVideoStreams();
    
    // Call the close handler
    handleClose();
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
        
        {!cameraActive && !scanProcessedRef.current && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log("Manual camera start requested");
                startAttemptedRef.current = true;
                startScanner();
              }}
              className="w-full"
            >
              Start Camera
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
