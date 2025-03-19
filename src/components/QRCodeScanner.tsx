
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";
import { stopAllVideoStreams } from "@/utils/qrScanner";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerMountedRef = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const scanProcessedRef = useRef(false);
  
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(
    (decodedText: string) => {
      if (scanProcessedRef.current) {
        console.log("Scan already processed, ignoring duplicate");
        return;
      }
      
      scanProcessedRef.current = true;
      console.log("QR scan successful, data:", decodedText);
      
      stopAllVideoStreams();
      
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 300);
    },
    () => {
      console.log("QRCodeScanner onClose handler triggered");
      stopAllVideoStreams();
      setTimeout(() => {
        onClose();
      }, 300);
    }
  );

  const { error, cameraActive } = scannerState;
  
  useEffect(() => {
    scannerMountedRef.current = true;
    scanProcessedRef.current = false;
    
    console.log("QRCodeScanner component mounted, initializing camera...");
    
    // Immediate cleanup to ensure no existing camera is running
    stopAllVideoStreams();
    
    return () => {
      console.log("QRCodeScanner component unmounting, cleaning up resources");
      scannerMountedRef.current = false;
      
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      
      stopAllVideoStreams();
    };
  }, []);

  const safeHandleClose = () => {
    if (!scannerMountedRef.current) {
      console.log("Scanner not mounted, skipping close attempt");
      return;
    }
    
    console.log("Safe handle close triggered, stopping all streams first");
    
    scannerMountedRef.current = false;
    
    stopAllVideoStreams();
    
    cleanupTimeoutRef.current = window.setTimeout(() => {
      console.log("Cleanup timeout complete, calling handleClose");
      handleClose();
      cleanupTimeoutRef.current = null;
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
            className="ml-auto hover:bg-destructive/10"
            aria-label="Close"
            data-testid="close-qr-scanner"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Position the QR code within the frame
        </p>
        
        {/* Force immediate creation of scanner container to avoid timing issues */}
        <div id={scannerContainerId} style={{ display: 'none' }}></div>
        
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
