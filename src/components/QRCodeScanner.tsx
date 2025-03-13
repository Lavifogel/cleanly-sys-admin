
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useQRScannerLogic } from "@/hooks/qrScanner/useQRScannerLogic";
import QRScannerControls from "@/components/qrScanner/QRScannerControls";
import QRScannerView from "@/components/qrScanner/QRScannerView";

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  onScanSuccess, 
  onClose, 
  title = "Scan QR Code" 
}) => {
  const {
    scannerState,
    scannerContainerId,
    fileInputRef,
    handleClose,
    handleTakePicture,
    handleFileSelect,
    handleManualSimulation
  } = useQRScannerLogic(onScanSuccess, onClose);

  const { error } = scannerState;

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="absolute right-4 top-4 z-10">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">Position the QR code within the frame or take a picture</p>
        </div>
        
        <QRScannerView 
          scannerContainerId={scannerContainerId} 
          scannerState={scannerState} 
        />
        
        {error && (
          <div className="mt-4 text-destructive text-center">
            {error}
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
          onClick={(e) => {
            // This prevents the file selection dialog from showing files
            // and forces it to go directly to the camera
            e.stopPropagation();
          }}
        />
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
