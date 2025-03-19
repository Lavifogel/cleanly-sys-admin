
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X, Camera } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScannerUtils";
import { useToast } from "@/hooks/use-toast";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerMountedRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const scanProcessedRef = useRef(false);
  const { toast } = useToast();
  
  const {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
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
      
      // Notify the user of successful scan
      toast({
        title: "QR Code Scanned",
        description: "Successfully scanned QR code",
        duration: 3000,
      });
      
      // Call the original success callback with a delay to ensure camera is fully stopped
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 300);
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      stopAllVideoStreams();
      setTimeout(() => {
        onClose();
      }, 200);
    }
  );

  const { error, cameraActive } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    scanProcessedRef.current = false;
    
    // Add a delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (scannerMountedRef.current) {
        console.log("QR scanner mounted, camera active:", cameraActive);
        
        // If camera isn't active after a few seconds, show a toast with instructions
        if (!cameraActive) {
          const permissionTimer = setTimeout(() => {
            if (scannerMountedRef.current && !cameraActive) {
              toast({
                title: "Camera Access",
                description: "Please allow camera access to scan QR codes",
                duration: 5000,
              });
            }
          }, 3000);
          
          return () => clearTimeout(permissionTimer);
        }
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
      
      // Force stop all camera streams
      stopAllVideoStreams();
      
      // Add a small delay before final cleanup to avoid race conditions
      setTimeout(() => {
        // Stop all video streams on unmount
        stopAllVideoStreams();
      }, 200);
    };
  }, [cameraActive, toast]);

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
    }, 250);
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
          <div className="mt-4 p-3 bg-destructive/10 rounded-md text-destructive text-center text-sm">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                // Try restarting camera
                stopAllVideoStreams();
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
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
        
        {/* Hidden file input for image upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
