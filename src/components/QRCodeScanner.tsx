
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X, RefreshCw } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { useToast } from "@/hooks/use-toast";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerMountedRef = useRef(false);
  const scanProcessedRef = useRef(false);
  const initAttemptRef = useRef(0);
  const [containerReady, setContainerReady] = useState(false);
  const { toast } = useToast();
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation,
    startScanner
  } = useQRScannerLogic(
    // Wrap the success callback to ensure proper cleanup before callback
    (decodedText: string) => {
      if (scanProcessedRef.current) {
        console.log("[QRCodeScanner] Scan already processed, ignoring duplicate");
        return;
      }
      
      scanProcessedRef.current = true;
      console.log("[QRCodeScanner] QR scan successful, data:", decodedText);
      
      // Stop camera streams first and ensure complete cleanup
      stopAllVideoStreams();
      
      // Call the original success callback with a delay to ensure camera is fully stopped
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 800);
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      stopAllVideoStreams();
      setTimeout(() => {
        onClose();
      }, 500);
    }
  );

  const { error, cameraActive } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessedRef.current = false;
    
    // Force stop any existing camera resources
    stopAllVideoStreams();
    
    // Give the DOM time to render completely before attempting to start camera
    const renderTimer = setTimeout(() => {
      setContainerReady(true);
    }, 300);
    
    // Clean up on unmount
    return () => {
      console.log("[QRCodeScanner] Component unmounting, cleaning up resources");
      scannerMountedRef.current = false;
      clearTimeout(renderTimer);
      stopAllVideoStreams();
      
      // Delay before final cleanup
      setTimeout(() => {
        stopAllVideoStreams();
      }, 800);
    };
  }, []);

  // Separate effect for starting the scanner after container is ready
  useEffect(() => {
    if (!containerReady || !scannerMountedRef.current) return;
    
    // Ensure scanner container exists in the DOM
    const ensureContainer = () => {
      const container = document.getElementById(scannerContainerId);
      if (!container) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = scannerContainerId;
        newContainer.className = 'absolute inset-0 z-10 flex items-center justify-center';
        newContainer.style.minHeight = '300px';
        newContainer.style.minWidth = '300px';
        document.body.appendChild(newContainer);
        console.log("[QRCodeScanner] Created container for scanner:", scannerContainerId);
        return false;
      } else {
        console.log("[QRCodeScanner] Scanner container already exists:", scannerContainerId);
        // Ensure container has proper dimensions
        container.style.minHeight = '300px';
        container.style.minWidth = '300px';
        return true;
      }
    };
    
    if (ensureContainer()) {
      // Explicitly call startScanner after DOM is ready
      const initTimer = setTimeout(() => {
        if (scannerMountedRef.current) {
          console.log("[QRCodeScanner] Explicitly starting scanner after DOM ready");
          startScanner();
        }
      }, 500);
      
      return () => clearTimeout(initTimer);
    }
  }, [containerReady, scannerContainerId, startScanner]);

  // Add a retry mechanism for camera initialization
  useEffect(() => {
    if (!containerReady) return;
    
    const retryTimer = setInterval(() => {
      if (!cameraActive && scannerMountedRef.current && initAttemptRef.current < 3) {
        initAttemptRef.current++;
        console.log(`[QRCodeScanner] Camera not active, retry attempt ${initAttemptRef.current}`);
        stopAllVideoStreams();
        setTimeout(() => {
          if (scannerMountedRef.current) {
            console.log(`[QRCodeScanner] Attempting to restart camera (retry #${initAttemptRef.current})`);
            startScanner();
          }
        }, 800);
      } else if (initAttemptRef.current >= 3 || cameraActive) {
        clearInterval(retryTimer);
      }
    }, 3000);
    
    return () => clearInterval(retryTimer);
  }, [containerReady, cameraActive, startScanner]);

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
    }, 500);
  };

  // Handle manual retry when camera fails
  const handleRetry = () => {
    toast({
      title: "Retrying camera initialization",
      description: "Attempting to restart the camera...",
      duration: 3000,
    });
    
    // Force stop all streams first
    stopAllVideoStreams();
    
    // Small delay before retry
    setTimeout(() => {
      if (scannerMountedRef.current) {
        console.log("[QRCodeScanner] Manual camera retry initiated");
        initAttemptRef.current = 0; // Reset attempt counter
        startScanner();
      }
    }, 800);
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
          <div className="mt-4 flex flex-col items-center">
            <div className="text-destructive text-center text-sm mb-2">
              {error}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry Camera
            </Button>
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
