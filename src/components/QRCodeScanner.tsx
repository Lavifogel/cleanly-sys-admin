
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
  
  // Pre-clean any existing camera before initializing
  useEffect(() => {
    // Force stop all camera streams when component mounts
    stopAllVideoStreams();
    scanProcessedRef.current = false;
  }, []);
  
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
      
      // IMPORTANT: Stop camera streams first and ensure complete cleanup
      stopAllVideoStreams();
      
      // Small delay to ensure camera is fully stopped before calling success callback
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 300);
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      // IMPORTANT: Force stop all camera streams before closing
      stopAllVideoStreams();
      
      // Small delay to ensure camera is fully stopped before closing
      setTimeout(() => {
        onClose();
      }, 300);
    }
  );

  const { error, cameraActive, isScanning } = scannerState;
  
  // Component mount effect
  useEffect(() => {
    // Mark component as mounted
    scannerMountedRef.current = true;
    
    return () => {
      console.log("QRCodeScanner component unmounting, cleaning up resources");
      scannerMountedRef.current = false;
      
      // Force stop all camera streams
      stopAllVideoStreams();
      
      // Add a small delay before final cleanup to avoid race conditions
      setTimeout(() => {
        // Stop all video streams on unmount - double check
        stopAllVideoStreams();
      }, 300);
    };
  }, []);

  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Slight delay to ensure cleanup completes before closing
    setTimeout(() => {
      handleClose();
    }, 300);
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
        
        {isScanning && !cameraActive && (
          <div className="mt-4 text-center text-sm">
            Activating camera... Please wait
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
