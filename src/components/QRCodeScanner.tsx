
import React from "react";
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
    handleFileSelect,
    handleManualSimulation
  } = useQRScannerLogic(onScanSuccess, onClose);

  const { error } = scannerState;
  
  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground">Position the QR code within the frame</p>
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
          onTakePicture={() => {}} 
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
            e.stopPropagation();
          }}
        />
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;
