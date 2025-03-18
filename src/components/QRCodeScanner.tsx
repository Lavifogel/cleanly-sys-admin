
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
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(onScanSuccess, onClose);

  const { error, cameraActive } = scannerState;
  
  // Auto-focus on scanning when component mounts
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    
    // Add a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (scannerMountedRef.current) {
        console.log("QR scanner mounted, camera active:", cameraActive);
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      
      // Set mounted ref to false for cleanup helpers
      scannerMountedRef.current = false;
      
      // Ensure video elements are removed
      stopAllVideoStreams();
      
      // Clear any pending cleanup timeouts
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      // Add a delayed final cleanup to ensure all DOM operations have completed
      cleanupTimeoutRef.current = window.setTimeout(() => {
        // Remove any orphaned video elements that might be causing the removeChild error
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.parentNode) {
            try {
              video.parentNode.removeChild(video);
            } catch (e) {
              console.log("Cleanup - Could not remove video element:", e);
            }
          }
        });
      }, 100);
    };
  }, [cameraActive]);

  // Add an additional cleanup effect specifically for unmounting
  useEffect(() => {
    return () => {
      console.log("QRCodeScanner component unmounting, cleaning up resources");
      stopAllVideoStreams();
      
      // Remove any orphaned video elements
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.parentNode) {
          try {
            video.parentNode.removeChild(video);
          } catch (e) {
            console.log("Unmount - Could not remove video element:", e);
          }
        }
      });
    };
  }, []);

  const safeHandleClose = () => {
    // Stop all video streams before calling the close handler
    stopAllVideoStreams();
    
    // Delay the actual close slightly to ensure DOM operations complete
    setTimeout(() => {
      if (scannerMountedRef.current) {
        handleClose();
      }
    }, 100);
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
