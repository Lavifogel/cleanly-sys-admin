
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerView from "@/components/qrScanner/QRScannerView";
import { Button } from "./ui/button";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const {
    scannerState,
    scannerContainerId,
    handleClose,
    handleManualSimulation
  } = useQRScannerLogic(onScanSuccess, onClose);

  const { error, cameraActive } = scannerState;
  
  // Auto-focus on scanning when component mounts
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log("QR scanner mounted, camera active:", cameraActive);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [cameraActive]);

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
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
