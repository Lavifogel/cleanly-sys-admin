
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { QRCodeScannerProps } from "@/types/qrScanner";
import { useQRScannerLogic } from "@/hooks/useQRScannerLogic";
import QRScannerControls from "@/components/qrScanner/QRScannerControls";
import QRScannerView from "@/components/qrScanner/QRScannerView";

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation,
    cleanup
  } = useQRScannerLogic({ onScanSuccess, onClose });

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">Position the QR code within the frame or take a picture</p>
        </div>
        
        <QRScannerView 
          scannerContainerId={scannerContainerId} 
          scannerState={scannerState} 
        />
        
        {scannerState.error && (
          <div className="mt-4 text-destructive text-center">
            {scannerState.error}
          </div>
        )}

        <QRScannerControls 
          scannerState={scannerState} 
          onTakePicture={handleTakePicture} 
          onSimulateScan={handleManualSimulation} 
        />
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
