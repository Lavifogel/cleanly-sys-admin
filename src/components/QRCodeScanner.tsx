
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
    scannerMountedRef.current = true;
    
    return () => {
      scannerMountedRef.current = false;
      // Make absolutely sure camera is stopped on unmount
      stopAllVideoStreams();
      console.log("QRCodeScanner unmounting, cleaning up resources");
    };
  }, []);
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(
    // Wrap the success callback to ensure proper cleanup before callback
    (decodedText: string) => {
      if (scanProcessedRef.current || !scannerMountedRef.current) {
        console.log("Scan already processed or component unmounted, ignoring duplicate");
        return;
      }
      
      scanProcessedRef.current = true;
      console.log("QR scan successful, data:", decodedText);
      
      // IMPORTANT: Stop camera streams first and ensure complete cleanup
      stopAllVideoStreams();
      
      // Wait to ensure camera is fully stopped
      setTimeout(() => {
        if (scannerMountedRef.current) {
          onScanSuccess(decodedText);
          // Force one more cleanup after processing
          stopAllVideoStreams();
        }
      }, 800);
    },
    // Wrap close callback to ensure camera shutdown
    () => {
      // IMPORTANT: Force stop all camera streams before closing
      stopAllVideoStreams();
      
      // Small delay to ensure camera is fully stopped before closing
      setTimeout(() => {
        if (scannerMountedRef.current) {
          onClose();
          // Final cleanup
          stopAllVideoStreams();
        }
      }, 500);
    }
  );

  const { error, cameraActive, isScanning } = scannerState;
  
  // Safely handle close with proper cleanup
  const safeHandleClose = () => {
    // First stop all camera streams
    stopAllVideoStreams();
    
    // Slight delay to ensure cleanup completes before closing
    setTimeout(() => {
      handleClose();
      // Final cleanup
      stopAllVideoStreams();
    }, 500);
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
